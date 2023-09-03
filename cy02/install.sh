# #!/bin/bash

apt update && apt upgrade -y
apt install -y nginx tor

cp nginx.conf /etc/nginx/sites-available/default
cp torrc /etc/tor/
cp sshd_config /etc/ssh/sshd_config
cp index.html /var/www/html/

systemctl restart nginx
systemctl enable tor
systemctl restart tor
while ! systemctl is-active -q tor; do
    sleep 1
done

systemctl restart sshd

ONION_ADDR=$(cat /var/lib/tor/hidden_service/hostname)
sed -i "s/server_name .*.onion;/server_name $ONION_ADDR;/g" /etc/nginx/sites-available/default

systemctl reload nginx

echo "Adresse .onion est: $ONION_ADDR"

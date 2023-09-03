#!/bin/bash

apt update && apt upgrade -y
apt install -y nginx tor
cp nginx.conf /etc/nginx/sites-available/default
cp torrc /etc/tor/
cp sshd_config /etc/ssh/sshd_config
cp index.html /var/www/html/

systemctl restart nginx
systemctl enable tor
systemctl restart tor
systemctl restart sshd

echo "Adresse .onion est:"
cat /var/lib/tor/hidden_service/hostname

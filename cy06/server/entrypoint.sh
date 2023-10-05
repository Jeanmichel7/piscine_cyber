#!/bin/sh

ip=$(hostname -i)
mac=$(cat /sys/class/net/eth0/address)

echo "Adresse IP/MAC server: $ip $mac"

exec "$@"
#!/bin/sh

# recuperer la key du fichier key.hex
key=$(cat key.hex)

# sauvegarder la key en base32 dans une variable (linux)
keyBase32=$(echo $key | xxd -r -p | base32)
# keyBase32=$(echo $key | xxd -r -p | base32 -w 0)

echo "Retour oathtool :"
oathtool --totp -b $keyBase32


echo "Retour my script :"
node ft_otp.js -g key.hex
node ft_otp.js -k ft_otp.key
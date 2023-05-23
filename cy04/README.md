
# Stockholm - Piscine Cyber

Bienvenue sur le projet Stockholm de la Piscine Cyber. Ce projet implémente une fonctionnalité de chiffrement pour un ransomware.
Le script creer une clee EAS et chiffre les fichiers du dossier courant.
Ensuite la clé EAS est chiffree avec une clé public RSA et est sauvegardé dans 'aes_key.enc' a default de l'envoyer sur un serveur de controle.
Pour dechiffrer les fichiers, il faut la clé privée RSA permettant de dechiffrer la cle AES.

## Installation

1. Assurez-vous d'avoir Node.js v18 installé sur votre machine. Vous pouvez le télécharger et l'installer à partir de [https://nodejs.org](https://nodejs.org).

2. Clonez ce répertoire sur votre machine locale

3. Dans le répertoire cloné, lancer l'installation avec la commande suivante :
   ```
   make
   ```

## Utilisation

1. Exécutez le programme en utilisant la commande suivante dans le terminal :
   ```
   node stockholm.js ou make run
   ```

2. Lorsqu'il vous est demandé, entrez la clé privée RSA dans le fichier crypto/rsa_private_key.pem

3. Reexécutez le programme en utilisant la commande suivante dans le terminal :
   ```
   node stockholm.js -r ou make decrypt
   ```



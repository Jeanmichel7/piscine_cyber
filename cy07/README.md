
# Lancement du site de test
``` bash
cd test-site && docker-compose up
```

# Lancement du programme vaccine
``` bash
cd src    
npm install   
node vaccine.js [--help] [--version] [-X <method>] url
```

## Options
- --help : affiche l'aide
- --version : affiche la version
- -X <method> : méthode HTTP (GET, POST) optionnel, GET par défaut
- url : url de la requête

## Test GET

DB postgres
node vaccine.js http://localhost:3000/postgres/users?user=1

DB mysql
node vaccine.js http://localhost:3000/mysql/users?user=1

## Test POST
DB postgres
node vaccine.js -X POST http://localhost:3000/postgres

DB mysql
node vaccine.js -X POST http://localhost:3000/mysql


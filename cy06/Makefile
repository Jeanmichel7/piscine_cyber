all: 
	docker-compose up

build: 
	docker-compose up --build

down:
	docker-compose down

stop:
	docker stop client server attacker

start:
	docker start client server attacker

re: down build

restartserver:
	docker-compose up -d --no-deps --build server

restartclient:
	docker-compose up -d --no-deps --build client

restartdb:
	docker-compose up -d --no-deps --build db

restart: restartserver restartclient restartdb

restartall: down build

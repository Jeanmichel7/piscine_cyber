all: 
	docker-compose up

restartclient:
	docker-compose up -d --no-deps --build client

bla:
	gcc -o inquisitor inquisitor.c -lpcap -lpthread -lssl

run:
	docker-compose up -d
	./inquisitor
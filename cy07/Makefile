all: install

install:
	@echo "Installing dependencies..."
	@npm install
	@echo "\n\n\nRunning the application..."
	tsc vaccine.ts
	@echo "use 'node vaccine.js' to run the application"

stop:
	docker stop test-site_adminer_1 test-site_express_1 test-site_mysql-db_1

re: 
	docker-compose down
	docker-compose up --build
	
dbsave:
	docker exec -t postgres pg_dumpall -U postgres -c > test-site/postgres/save.sql
# docker exec -t postgres pg_dump -U postgres testdb > test-site/postgres/save.sql

dbrestore:
	docker exec -i postgres psql -U postgres < test-site/postgres/save.sql

.PHONY: install run all
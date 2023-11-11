all: install

install:
	@echo "Installing dependencies..."
	@npm install
	@echo "\n\n\nRunning the application..."
	tsc vaccine.ts
	@echo "use 'node vaccine.js' to run the application"

stop:
	docker stop test-site_adminer_1 test-site_express_1 test-site_mysql-db_1
	
.PHONY: install run all
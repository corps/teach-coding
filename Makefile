ASSETS := $(wildcard assets/*)

.PHONY: assets
.dist: $(ASSETS)
	mkdir -p dist
	cp $(ASSETS) dist/
	touch .assets

.image: Dockerfile .dist
	docker build --network host --tag teach-coding .
	touch .image

bash: .image
	docker run --rm -it -u $(shell id -u):$(shell id -g) -v $$PWD:/app teach-coding bash

up: .image
	docker run -d -p 8080:8080 -v $$PWD:/app --name teach-coding-srv teach-coding websocketd --port 8080 --staticdir dist ./app.py || true
	docker run -d -v $$PWD:/app --name teach-coding-webpack teach-coding webpack --watch || true

down:
	docker stop teach-coding-srv || true
	docker stop teach-coding-webpack || true
	docker rm teach-coding-srv || true
	docker rm teach-coding-webpack || true

logs:
	@ docker logs -f teach-coding-srv

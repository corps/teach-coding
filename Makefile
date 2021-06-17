.image: Dockerfile
	docker build --tag teach-coding .
	touch .image

bash: .image
	docker run --rm -it -v $$PWD:/app teach-coding bash

up: .image
	docker run -d -p 8080:8080 -v $$PWD:/app --name teach-coding-srv teach-coding websocketd --port 8080 --staticdir dist ./app.py
	docker run -d -v $$PWD:/app --name teach-coding-webpack teach-coding webpack --watch

down:
	docker stop teach-coding-srv
	docker stop teach-coding-webpack
	docker rm teach-coding-srv
	docker rm teach-coding-webpack

logs:
	@ echo "===== Server"
	@ docker logs teach-coding-srv
	@ echo "===== Webpack"
	@ docker logs teach-coding-webpack

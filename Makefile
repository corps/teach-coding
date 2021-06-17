.image: Dockerfile
	docker build --tag teach-coding .
	touch .image

bash: .image
	docker run --rm -it -v $PWD:/app teach-coding bash

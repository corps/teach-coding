FROM ubuntu
RUN apt-get update
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y wget nodejs unzip npm python3
RUN wget https://github.com/joewalnes/websocketd/releases/download/v0.4.1/websocketd-0.4.1-linux_amd64.zip
RUN unzip websocketd*
RUN mv websocketd /bin/
RUN mkdir -p /app

WORKDIR /app
COPY . /app/
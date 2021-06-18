FROM ubuntu
RUN apt-get update
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y wget nodejs unzip npm python3 
RUN npm install npm@latest -g
RUN wget https://github.com/joewalnes/websocketd/releases/download/v0.4.1/websocketd-0.4.1-linux_amd64.zip
RUN unzip websocketd*
RUN mv websocketd /bin/
RUN mkdir -p /app

WORKDIR /app
COPY package.json /app/
COPY package-lock.json /app/
RUN npm install
COPY src /app/src
COPY index.html /app/
COPY babel.config.js /app/
COPY webpack.config.js /app/

ENV PATH=/app/node_modules/.bin:$PATH
RUN webpack

COPY app.py /app/
COPY tsconfig.json /app/

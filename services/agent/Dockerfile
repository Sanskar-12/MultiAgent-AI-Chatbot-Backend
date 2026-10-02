FROM node

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN mkdir -p ./services/agent

COPY ./services/agent/package*.json ./services/agent/

RUN cd ./services/agent && npm install

COPY services/agent ./services/agent

COPY shared ./shared

WORKDIR /app/services/agent

EXPOSE 8003

CMD ["npm", "start"]
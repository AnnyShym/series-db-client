FROM node:8
WORKDIR /main
COPY package.json /main
RUN npm install
COPY . /main
CMD [ "npm", "start" ]
EXPOSE 3000
FROM node:8.9.4
ADD ./ /opt/app/
WORKDIR /opt/app
RUN npm install
RUN node create-release-branches.js
CMD node 

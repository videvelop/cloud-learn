#!/bin/bash
yum update -y 
curl --silent --location https://rpm.nodesource.com/setup_14.x |bash - 
yum install yarn nodejs -y 
yum install git -y 
npm i -g pm2 
PORT=3004 pm2 start server_app1.js -i 4
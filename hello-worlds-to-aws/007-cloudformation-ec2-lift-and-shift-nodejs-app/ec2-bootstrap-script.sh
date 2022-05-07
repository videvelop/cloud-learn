#!/bin/bash
yum update -y 
 curl --silent --location https://rpm.nodesource.com/setup_14.x |bash - 
 yum install yarn nodejs -y 
 yum install git -y 
 git clone https://github.com/videvelop/cloud-learn.git 
 cd cloud-learn/hello-worlds/001-nodejs-microservice-restapi-noauth/ 
 npm install 
 npm run start
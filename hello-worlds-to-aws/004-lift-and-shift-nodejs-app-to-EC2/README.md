# Lift-and-Shift (Rehost) Nodejs app from On-prem to EC2
You have learnt to create ec2 instance.  In this exercise, let's run a nodejs web app in that instance.

To lift and shift nodejs webapp, you need to create an EC2 instance and install all the required software there.  The steps involed are:
  
   1. Create an EC2 instance
   2. Install nodejs in it
   3. Clone the application package into EC2 instance
   4. Configure security group to open up the port the web app is using
   5. Send requests from browser client to access the webapp

## AWS-PRICE
`AWS-PRICE` for this hands-on exercise:
  1. EC2 instance price applies here.

## Create EC2 instance
Follow the instructions given in [003-create-ec2-on-demand-instance](../003-create-ec2-on-demand-instance) to create EC2 instance and ssh into it.
  

Get the public DNS name of the running instance
```
$ aws ec2 describe-instances --query 'Reservations[*].Instances[*].PublicDnsName' --output text --filters Name=instance-state-name,Values=running
```

SSH into that instance.  Remember to substitue the pubcli dns name of the instance you created for the following command.
```
$ ssh -i ~/.ssh/id_rsa_aws ec2-user@ec2-3-87-251-3.compute-1.amazonaws.com
```

## Install nodejs in ec2
```
$ curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash
$ . ~/.nvm/nvm.sh
$ nvm install node
$ node --version
$ nvm --version
```

## Copy nodejs web app to EC2
Git clone the sample app code or use your own app code.  Copy the source from your machine to ec2 instance. The below steps are to be run in your desktop / laptop machine. 
```
$ cd cloud-learn/hello-worlds
$ scp -r -i ~/.ssh/id_rsa_aws 001-nodejs-microservice-restapi-noauth ec2-user@ec2-3-89-254-202.compute-1.amazonaws.com:~/wrk/
```

In the ec2 instance, npm install and run the app
```
$ cd ~/wrk/001-nodejs-microservice-restapi-noauth
$ npm i
$ node server-app-noauth.js 
$ curl http://localhost:9001
```
You have created a linux machine in cloud and ran your own web app in it.

## Configure Security Group to access nodejs app port
In order to achieve this, you need to change the secuirty group.  Similar to exposing port 22, you need to expose port 9001 where the web app runs.

```
aws ec2  authorize-security-group-ingress \
  --group-name  myawsec2secgroup \
  --port 9001 \
  --protocol tcp \
  --cidr 0.0.0.0/0
```

# Access the nodejs app
Now, access the app from internet by running curl in your machine outside ec2 or use your browser in your laptop.
```
curl http://ec2-52-205-231-166.compute-1.amazonaws.com:9001
```
A web app from on-prem is lifted and shifted to the Cloud.

# Delete Services
Delete EC2 instance, security group and keypairs.
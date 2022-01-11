# Lift-and-Shift Nodejs app from On-prem to EC2
You have learnt to create ec2 instance by now.  In this exercise, let's run a node web app in that instance.
To lift and shift nodejs webapp, you need to create an EC2 instance and install all the required software there.  The steps involed are:
  
   1. Create an EC2 instance
   2. Install nodejs in it
   3. Clone the source code in EC2 instance
   4. Configure security group to open up the port the node app is using
   5. Send requests from browser client to access the webapp

## AWS-PRICE
`AWS-PRICE` for this hands-on exercise:
  1. EC2 instance price applies here.

## Create EC2 instance
Follow the instructions given in [0-1-create-ec2](../0-1-crea6te-ec2) to create EC2 instance and ssh into it.

Get the public DNS name of the running instance
```
aws ec2 describe-instances --query 'Reservations[*].Instances[*].PublicDnsName' --output text --filters Name=instance-state-name,Values=running
```

SSH into that instance.  Remember to substitue the pubcli dns name of the instance you created for the following command.
```
 ssh -i ~/.ssh/id_rsa_aws ec2-user@ec2-3-87-251-3.compute-1.amazonaws.com
```

## Install nodejs in ec2
```
$ curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash
$ . ~/.nvm/nvm.sh
$ nvm install node
$ node --version
$ nvm --version
```

## Copy nodejs app to EC2
Git clone the sample app code or use your own app code.  Copy the source from your machine to ec2 instance. The below steps are to be run in your desktop / laptop machine. 
```
git clone https://github.com/videv-periyarit/cloud-learn-hello-worlds.git
cd cloud-learn-hello-worlds
scp -r -i ~/.ssh/id_rsa_aws 1-nodejs-webapp ec2-user@ec2-3-89-254-202.compute-1.amazonaws.com:~/wrk/
```

In the ec2, npm install and run the app
```
cd ~/wrk/1-nodejs-webapp
npm i
node server-app.js &
curl http://localhost:9001
```
You have created a linux machine in cloud and ran your own web app in it.

## Configure Security Group to access web app
In order to achieve this, you need to change the secuirty group.  Similar to exposing port 22, you need to expose port 9001 where the web app runs.

```
aws ec2  authorize-security-group-ingress \
  --group-name  myawsec2secgroup \
  --port 9001 \
  --protocol tcp \
  --cidr 0.0.0.0/0
```

# Access the web app
Now, access the app from internet by running curl in your machine outside ec2 or use browser.
```
curl http://ec2-52-205-231-166.compute-1.amazonaws.com:9001
```
A web app from on-prem is lifted and shifted to Cloud.

# Destroy Services
Destroy EC2 instance, security group and keypairs
# AWS ElasticBeanstalk (EB)
AWS Elastic Beanstalk is an orchestration service. It orchestrates various AWS services, including EC2, S3, Simple Notification Service, CloudWatch, autoscaling, and Elastic Load Balancers. 

# Installation for Elastic Beanstalk CLI
`eb` cli is to be installed to create and manage EB application.  The installation steps are simple.  You need to have python 3.6+ and pip.  The following commands can setup eb cli in your laptop if you are using Ubuntu.
```
$ sudo apt install python3 -y
$ sudo ln -s  /usr/bin/python3 python
$ pip install awsebcli --upgrade --user
$ ls ~/.local/bin
$ ~/.local/bin/eb --version
```

The --upgrade option tells pip to upgrade any requirements that are already installed. The --user option tells pip to install the program to a subdirectory of your user directory to avoid modifying libraries that your operating system uses. So, you find the eb executable inside ~/.local/bin .

# Create Elastic Beanstalk application

# Deploying Nodejs app using Elastic Beanstalk
When a package.json file is present, Elastic Beanstalk runs npm install to install the dependencies. It also uses the start command to start your application.

There are several options to start your application. You can add a Procfile to your source bundle to specify the command that starts your application. When you don't provide a Procfile, Elastic Beanstalk runs npm start if you provide a package.json file. If you don't provide that either, Elastic Beanstalk looks for the file app.js or server.js, in this order, and runs it.

We have rehosted nodejs app so far by 
1. directly installing in ec2 instance 
2. use cloudformation to automate the installation at ec2.

In this exercise we'll use Elastic Beanstalk to set it up.
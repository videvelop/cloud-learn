# AWS Cloudformation for lift-and-shift (Rehost) nodejs app 
We have looked through an example of cloudformation template, stack and change-set.  In this exercise, we'll create a cloudformation template for migrating nodejs app from on-prem to AWS cloud.

We need to bring the following steps into cloud formation template.
1. Create security group required by ec2.
2. Create keypair required to access ec2.
3. Create bootstrap mechanism to install nodejs and nodejs in ec2.
4. Run the app so that the users can use the application services

To import an existing key pair, include the PublicKeyMaterial property in the template.

If the PublicKeyMaterial is not specified, Amazon will create its own new keypair. When Amazon EC2 creates a new key pair, the private key is saved to an AWS Systems Manager Parameter Store. The name of the Systems Manager parameter follows the format /ec2/keypair/{key_pair_id}. Just copy the keymaterial from the parameter store and use that to connect with ec2 instance.

We are supplying keypair PublicKeyMaterial in our cloudformation template in this exercise.

Create the ssh key first in your local machine in pem format. Use the below commands to create the required ssh keypair.
```
$ ssh-keygen -f chwcfec2nodejsrehost
$ ssh-keygen -f chwcfec2nodejsrehost -e -m pem
$ cd ~/.ssh
$ ls chwcfec2nodejsrehost chwcfec2nodejsrehost.pub
$ cp chwcfec2nodejsrehost chwcfec2nodejsrehost.pem

Copy your public key material (the content of the file chwcfec2nodejsrehost.pub) into the cloudformation template before running the below command.
```
$ aws cloudformation create-stack --stack-name chwcfnodejsrehost --template-body file://chw-cf-nodejs-rehost.json 

```
Monitor the stack creation events using the below command.
```
 $ aws cloudformation describe-stack-events --stack-name chwcfnodejsrehost --query 'StackEvents[*].{StackName:StackName,ResourceType:ResourceType,ResourceStatus:ResourceStatus}'
```

 You can pass two types of user data to Amazon EC2: shell scripts and cloud-init directives. 
 
 This user data data can be passed in the launch instance wizard in the following forms:
 - as plain text, 
 - as a file (this is useful for launching instances using the command line tools), or 
 - as base64-encoded text (for API calls).

 Scripts executed through user data are run as the root user, so "sudo" should not be added to the commands. 
 
 Remember that any files you create through these scripts will be owned by root; if you need non-root users to have file access, you should modify the permissions accordingly in the script. Also, because the script is not run interactively, you cannot include commands that require user inputs (such as yum update without the -y flag).

 We use "user data" script in the cloudformation template to install npm, copy nodejs app from git and start the nodejs app.  The below commands are executed through cloudformation when ec2 is created.
 ```
 #!/bin/bash
 yum update -y 
 curl --silent --location https://rpm.nodesource.com/setup_14.x |bash - 
 yum install yarn nodejs -y 
 yum install git -y 
 git clone https://github.com/videvelop/cloud-learn.git 
 cd cloud-learn/hello-worlds/001-nodejs-microservice-restapi-noauth/ 
 npm install 
 npm run start &
 ```

Get the public ip of the running instance using the following command.
 ```
 $ aws ec2 describe-instances  --query 'Reservations[*].Instances[*].{ImageId:ImageId,InstanceId:InstanceId,State:State,PublicDnsName:PublicDnsName}'
 ```

 Then run the below in your machine to check whether the nodejs app is rehosted.
 ```
$ curl http://publicdns-of-ec2:9001
 ```

# Delete the resources
 Destroy the services by deleting the cloudformation stack.
 ```
$ aws cloudformation delete-stack --stack-name chwcfnodejsrehost 
```

# Additional info
The bootstrap script (ec2-bootstrap-script.sh) for EC2 is passed as UserData property in cloudformation for ec2 resource. This script installs nodejs, copies the app using git clone.   Better way is to keep the app package in some s3 bucket and copy the app from that s3 bucket. 

The cloud-init output log file (/var/log/cloud-init-output.log) captures console output so it is easy to debug your scripts if the instance does not behave the way you intended. ssh into the instance and check this log file.

Stopping and Starting the instance back will have a new public IP. If you try hitting the nodejs service with this new public IP/ DNS name, your service will not be available.  It is because, the UserData method used to execute the script is done at instance initial setup time. When an instance is stopped and restarted, the instance(VM) can get started in a new physical host. 

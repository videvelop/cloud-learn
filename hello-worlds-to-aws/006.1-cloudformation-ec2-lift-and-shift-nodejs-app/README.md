# AWS Cloudformation for lift-and-shift (Rehost) nodejs app 
We have looked through an example of cloudformation template, stack and change-set.  In this exercise, we'll create a cloudformation template for migrating nodejs app from on-prem to AWS cloud.

We need to bring the following steps into cloud formation template.
1. Create security group required by ec2.
2. Create keypair required to access ec2.
3. Create bootstrap mechanism to install nodejs and nodejs in ec2.
4. Run the app so that the users can use the application services

To import an existing key pair, include the PublicKeyMaterial property in the template.

If the PublicKeyMaterial is not specified, Amazon will create its own new keypair. When Amazon EC2 creates a new key pair, the private key is saved to an AWS Systems Manager Parameter Store. The name of the Systems Manager parameter follows the format /ec2/keypair/{key_pair_id}. Just copy the keymaterial from the parameter store and use that to connect with ec2 instance.

We are supplying keypair PublicKeyMaterial in our cloudformation template for now.

Create the ssh key first in your local machine in pem format. Ensure the required ssh keypair is created.
```
$ ssh-keygen -f id_rsa_aws_cf -e -m pem
$ cd ~/.ssh
$ ls id_rsa_aws_cf id_rsa_aws_cf.pub
```

Copy the public key material (the content of the file id_rsa_aws_cf.pub) into the cloudformation template. Then run the below.
```
$ aws cloudformation create-stack --stack-name chwcfnodejsrehost --template-body file://chw-cf-nodejs-rehost.json 

$ aws cloudformation delete-stack --stack-name chwcfnodejsrehost 
```

 You can pass two types of user data to Amazon EC2: shell scripts and cloud-init directives. You can also pass this data into the launch instance wizard as plain text, as a file (this is useful for launching instances using the command line tools), or as base64-encoded text (for API calls).
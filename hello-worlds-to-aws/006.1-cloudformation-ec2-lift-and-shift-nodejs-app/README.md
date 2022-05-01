# AWS Cloudformation for lift-and-shift (Rehost) nodejs app 
We have looked through an example of cloudformation template, stack and change-set.  In this exercise, we'll create a cloudformation template for migrating nodejs app from on-prem to AWS cloud.

We need to bring the following steps into cloud formation template.
1. Create security group required by ec2.
2. Create keypair required to access ec2.
3. Create bootstrap mechanism to install nodejs and nodejs in ec2.
4. Run the app so that users can use the application services

To import an existing key pair, include the PublicKeyMaterial property in the template.

If the PublicKeyMaterial is not specified, Amazon will create its own new keypair. When Amazon EC2 creates a new key pair, the private key is saved to an AWS Systems Manager Parameter Store. The name of the Systems Manager parameter follows the format /ec2/keypair/{key_pair_id}. Just copy the keymaterial from the parameter store and use that to connect with ec2 instance.

We are supplying keypair PublicKeyMaterial in our cloudformation template for now.
```
$ aws cloudformation create-stack --stack-name chwcfnodejsrehost --template-body file://chw-cf-nodejs-rehost.json 

$ aws cloudformation delete-stack --stack-name chwcfnodejsrehost 
```
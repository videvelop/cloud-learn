# AWS Cloudformation for lift-and-shift (Rehost) nodejs app 
We have looked through an example of cloudformation template, stack and change-set.  In this exercise, we'll create a cloudformation template for migrating nodejs app from on-prem to AWS cloud.

We need to bring the following steps into cloud formation template.
1. Create security group required by ec2.
2. Create keypair required to access ec2.
3. Create bootstrap mechanism to install nodejs and nodejs in ec2.
4. Run the app so that users can use the application services
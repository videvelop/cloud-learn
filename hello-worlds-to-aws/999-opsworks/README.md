# AWS OpsWorks
Amazon EC2 instances or even on-premises instances can incorporate into OpsWorks stack. AWS OpsWorks Stacks can manage all related instance as a group.

AWS OpsWorks Stacks instances can be launched in any AWS region except AWS GovCloud (US-West) and the China (Beijing) Region. 

`AWS-PRICE` for this hands-on exercise:
  1. AWS OpsWrks is free.  The resources (ec2 instance, s3, etc.) created by OpsWorks stack will be charged as per the rates applicable to those resources.AWS 
  
  
# Create OpsWorks Stack for Nodejs

From access security point of view, the below are needed.
1. Access permissions for OpsWorks stack: OpsWorks Stacks interact with Amazon EC2 to create instances and CloudWatch monitoring statistics. A "service role" is needed for OpsWorks Stacks to access other services.

2. Access permissions for EC2 instances created via OpsWorks stack. It requires an instance profile,  which is an IAM role. Applications running on the instance can assume that role to access AWS resources.

## Create service-role for OpsWorks
There is a managed policy existing with the ARN `arn:aws:iam::aws:policy/AWSOpsWorks_FullAccess`

Using this policy, let's create a role.

Create service role first and then attach this managed policy. Also verify the policy is attached successfully by verifying the same.
```
$ aws iam create-role --role-name chwopsworks_role --assume-role-policy-document file://opsworks-service-role.json
$ aws iam attach-role-policy --role-name chwopsworks_role --policy-arn arn:aws:iam::aws:policy/AWSOpsWorks_FullAccess
$  aws iam list-attached-role-policies --role-name chwopsworks_role
```
## Create instance profile
An instance profile must have a trust relationship and an attached policy that grants permissions to access AWS resources. Instance profiles created by AWS OpsWorks Stacks have the following trust relationship.

```
$  aws iam create-role --role-name chw-opsworks-ec2-trust-role --assume-role-policy-document file://opsworks-ec2-trust-role.json
$ aws iam create-policy --policy-name chw-opsworks-ec2-trust-role-policy --policy-document file://policy-for-opsworks-ec2-trust-role.json

Get the ARN of the policy created
```
$  aws iam list-policies --query 'Policies[?PolicyName ==`chw-opsworks-ec2-trust-role-policy`]
.[Arn]' --output text
``` 

Attach this policy arn to the trust role. List it to check.

```
$ aws iam attach-role-policy --role-name chw-opsworks-ec2-trust-role --policy-arn  arn:aws:iam::024172920014:policy/chw-opsworks-ec2-trust-role-policy
$  aws iam list-attached-role-policies --role-name chw-opsworks-ec2-trust-role 
```
# hello-worlds-to-aws - AWS Setup
You'll setup Accounts and IAM users as mentioned in this section.

You'll need one AWS account to do most of the exercises.  For some exercises, you'll need multiple AWS accounts.  It is recommended that you setup 3 AWS Accounts (not all at once.. you can create one now and create others when the exercises need those.) The Accounts, Users that are referred in this exercise are as given in this table.

| Account  | User            | Description                                                                |
| -------- | --------------- | -------------------------------------------------------------------------- |
| chw-org  |                 | organization Account                                                       |
|          | chw-org-root    | organization account's root user                                           |
|          | chw-org-admin1  | admin user with all privileges                                             |
|          | chw-org-admin1  | another admin user                                                         |
|          | chw-org-usr1    | non-admin user with privileges set as and when required for the exercises. |
|          | chw-org-usr2    | another non-admin user                                                     |
|          |                 |
| chw-acc1 |                 | Another account with similar details of chw-org Account                    |
|          | chw-acc1-root   |                                                                            |
|          | chw-acc1-admin1 |                                                                            |
|          | chw-acc1-admin1 |                                                                            |
|          | chw-acc1-usr1   |                                                                            |
|          | chw-acc1-usr2   |                                                                            |
|          |                 |
| chw-acc2 |                 | Another Account                                                            |
|          | chw-acc2-root   |                                                                            |
|          | chw-acc2-admin1 |                                                                            |
|          | chw-acc2-admin1 |                                                                            |
|          | chw-acc2-usr1   |                                                                            |
|          | chw-acc2-usr2   |                                                                            |
|          |                 |

## Desktop/ Laptop requirement
I use a custom built desktop with the following configuration.  
Ryzen 7 
16 GB RAM
1 GB SSD
OS: Ubuntu 20.04.3 LTS x86_64
CPU: AMD Ryzen 7 3700U with Radeon Vega Mobile Gfx (8) @ 2.300GHz
Memory: 8GB


`AWS-PRICE` for this setup:
  - IAM is free.  It does not cost any money to create users, user groups and permissons for the users.


  
  ### Register and Create Users
  The learner is expected to setup the following:
  1. Register in [AWS](https://aws.amazon.com).  
  2. The email you first give for registration is the root account and it has all the privileges.  Let's say this root account's name is `chw-org-root`.
  3. Create an [IAM](https://console.aws.amazon.com/iam/home#/users$new?step=details) user after logging-in using the root account used for Registration. Let's call this IAM user `chw-org-admin1`.  Enable AWS management console and programmatic access for this user.
  ![console screen shot][iam-programmatic-access]

  [iam-programmatic-access]: ../common/images/aws-chw-org-admin1-programmatic-access.png  "iam-programmatic-access"

  4. Attach Permissions for this `chw-org-admin1` user. You need to give full admin privilege for this user.  Choose `AdministratorAccess` permission which provides all the admin access on all services.
  
  ![console screen shot][iam-permission]

  [iam-permission]: ../common/images/aws-chw-org-admin1-user-permissions.png "iam-programmatic-access"


### Setup AWS CLI

  1. Setup AWS CLI. I'm using aws-cli/2.4.5 version. Refer [AWS Documentaion for installation/upgrade](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html).
    
  2. Setup AWS CLI credentials for `chw-org-admin1`.  Follow these steps:
    
      a) Create ".aws" folder under home directory.
      b) create two files namely "credentials" and "config"
      c) In "credentials" file add the following and substitue the values with your credentials.
      ```
      [default]
      aws_access_key_id = AKXXXXXXXXXXRTPV34
      aws_secret_access_key = mvxxxxxxxxxxxxwKKY7tM3P7dA2IYtkFVNSqm9Mp
      ```

      You can create your credentials under AWS IAM service -> Dashboard -> Users -> Security Credentials -> Create access key
        
  ![console screen shot][iam-credential]

  [iam-credential]: ../common/images/aws-chw-org-admin1-user-credentials.png "iam-programmatic-access"
  
   d) In "config" file, add the following.
      
      ```
      [default]
      region = us-east-1
      output = json
      ```

What the above means is that, when we use cli, we are going to use us-east-1 (N. Virginia, US East) AWS region as default.  We are going to create our services in the AWS servers and storage in this geographical region by default.  aws cli commands will generate the output in json format by default.

### Verify AWS CLI Setup

  1. Run Security Token Service (STS) CLI command to see whether the user 'chw-org-admin1 ' you created is used for AWS CLI also. 
  ```
  $ aws sts get-caller-identity
  {
    "UserId": "AIXXXXXXXXXX4RTPI6X26",
    "Account": "045XXXXXXX43",
    "Arn": "arn:aws:iam::045XXXXXXX43:user/chw-org-admin1"
  }
  ```

That is the setup required to continue with this tutorial.


# Additional info

## Controlling costs

### Monitor Freetier usage

https://console.aws.amazon.com/billing/home?region=us-east-1#/freetier

### Set budget

### Set Alarms

## Outside AWS configurations for enriched learning
  1. It helps to learn if you have a domain registered for yourself.  Register in any of the domain registrars such as GoDaddy, Namecheap or in AWS itself under [Route 53 serivce](https://console.aws.amazon.com/route53/home#DomainListing:).


## Some useful things to note
  1. AWS' has a concept of "region", which is a geographical area.  Within region, AWS has data ceters that are termed as "Availability Zones".  This tutorial will use "us-east-1" as default region.  If you created one service using cli (say ec2 instance) and don't find it in the console, check whether you are using same region in both the places. Also, check whether you are using the same account in case you have multiple AWS accounts.
  3. AWS CLI gives output in json, yaml, text formats.  By default, this tutorial uses json output format.  AWS uses JMESPath query language to filter out json output at client side using "--query" option.  This tutorial uses --query option in aws cli commands to make the output shorter and easier to read. You can remove that option and run the queries for full blown output.  
  It is highly recommended to pickup JMESPath skill.  Refer https://jmespath.org/ .
  4. There may be more than one way to do things in AWS cloud.  What is covered in this tutorial is "one" of those ways, not necessarily the "best" or the "easy" way.  The purpose is to understand the functionality.  As long as this "one" way helps you to understand the cloud service functionality, mission accomplished.  Feedbacks welcome to improvise the solutions.  
  4. Free-Tier will not apply when an AWS account is under AWS Organization.  If your Free-Tier disappears, this could be a reason.
  4. Send feedback to <<TBD>>



//

  5. Likewise create chw-org-admin2 with full admin privileges. Also create chw-org-usr1 and chw-org-usr2 without admin privileges.  We'll create additional privileges as and when needed for later.
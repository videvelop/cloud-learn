# AWS Cloudformation
We did few exercises so far and created resources in AWS such as ec2 instance and S3 bucket.  These were done using AWS Cli commands primarily and AWS Console can also be used to manage resources.

Cloudformation is an AWS service that makes creating and destroying AWS resources easy.  That helps in replicating environments very easy.

In this exercise, we'll create S3 bucket, IAM roles for the EC2 to access that S3 bucket, EC2 instance with that instance role using cloudformation.

Cloudformation  terminologies.
Template - JSON or YAML declarative code file that describes the intended state of all resources user wants to create. 
Stack - AWS creates cloudformation stack as per the resources outlined in the json or yaml template file.
Change set - if any changes are required by the user on the stack, those can be specified as json or yaml file. User can preview and execute the same.
Stack set - a group of stacks

`AWS-PRICE` for this hands-on exercise:
  1. AWS cloudformation is free.  The resources (ec2 instance, s3, etc.) created by cloudformation template will be charged as per the rates applicable to those resources.
  
# Some basics on creating cloudformation template
For the resources you want to create, start with the json or yaml script like below.
```
Resources:
  reschwcfs3bucket:
    Type: 'AWS::S3::Bucket'
```

You may want to add properties for the resources such as access control permissions, tags, names, etc. https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-template-resource-type-ref.html is reference for properties for each AWS resource. For e.g., you add bucket name like below.

```
Resources:
  reschwcfs3bucket:
    Type: 'AWS::S3::Bucket'
    Properties:
      BucketName: "chwcfs3bucket"
```

Below is a complete cloudformation template to create bucket with a policy giving permission for all to read.  It uses some intrinsic function such as `!Join`  (used as `Fn::Join` in json).  `!Join` joins a given list of parameters with delimiter.  The intrinsic function `Ref` returns the value of the specified parameter or resource.

```
Resources:
  reschwcfs3bucket:
    Type: 'AWS::S3::Bucket'
    Properties:
      BucketName: "chwcfs3bucket"
      Tags: 
        - Key: "CHWCREATOR"
          Value: "CHWTUTORIAL"
        - Key: "CHWDELETETIME"
          Value: "immediate"
  chwcfs3bucketpolicy:
    Type: 'AWS::S3::BucketPolicy'
    Properties:
      Bucket: !Ref reschwcfs3bucket
      PolicyDocument:
        Id:  chwcfpolicy
        Version: 2012-10-17
        Statement:
          - Sid: ChwCfPublicRead
            Effect: Allow
            Principal: '*'
            Action: 's3:GetObject'
            Resource: !Join 
              - ''
              - - 'arn:aws:s3:::'
                - !Ref reschwcfs3bucket 
                - /*
```

The above is already saved in the file chw-cf-s3.yaml.  Use that file to create cloudformation stack with the command below.

Run this in your laptop.
```
$ aws cloudformation create-stack --stack-name chwcfstack --template-body file://chw-cf-s3.yaml
{
    "StackId": "arn:aws:cloudformation:us-east-1:024172920014:stack/chwcfstack/4a21a0e0-c866-11ec-b719-120afc2c634b"
}
```
Check the stack and its resources from the console `Services > CloudFormation > Stacks`.
Check the stack using console https://us-east-1.console.aws.amazon.com/cloudformation/home?region=us-east-1#/stacks
Verify using console the bucket and the policy are created as per the cloudformation definition.

Use the below command to delete the stack and along with that the resources should have been deleted.
```
$  aws cloudformation delete-stack --stack-name chwcfstack
```
Verify using console whether the stack and as part of that the bucket, bucket policy are all deleted.

# Change set
Let us say we need to change something.  We change the principal from anyone to AWS logged in users.  It requires the principal to be modified as below.
```
            Principal:
              AWS: '*'
```

Create change-set and execute this change-set to make the changes effective.  When you need to update a stack, understanding how your changes will affect running resources before you implement them can help you update stacks with confidence. Change sets allow you to preview how proposed changes to a stack might impact your running resources
```
$ aws cloudformation create-change-set --stack-name chwcfstack --change-set-name chwcfstackchangeset --template-body file://chw-cf-s3-change-set.yaml
{
    "Id": "arn:aws:cloudformation:us-east-1:0nnnnnnnnn14:changeSet/chwcfstackchangeset/6nnnnnnn-n10f-443f-bf90-fbb20fa8ef42",
    "StackId": "arn:aws:cloudformation:us-east-1:0nnnnnnnnn14:stack/chwcfstack/d5nnnnn0-c867-11ec-87fe-0e7616266ea7"
}
$ aws cloudformation execute-change-set --change-set-name chwcfstackchangeset --stack-name chwcfstack
```

Check the bucket permission and note that the principal is changed.

# Additional samples
There are some more json or yaml cloudformation files given.  Those can be used to create/destroy stacks.

For e.g., to create keypair and destroy the same use the following commands.
```
$ aws cloudformation create-stack --stack-name chwcfkp --template-body file://chw-cf-ec2-keypair.json 
$ aws cloudformation delete-stack --stack-name chwcfkp 
```
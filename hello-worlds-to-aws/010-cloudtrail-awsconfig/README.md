# AWS Services - Cloudtrail, AWS Config
This exercise is meant for understanding introduction information about some services that will be used in later exercises.

We will look at:
1. CloudTrail -  AWS CloudTrail enables auditing, security monitoring, and operational troubleshooting by tracking your user activity and API usage.
2. AWS Config

# CloudTrail
All the AWS services accessed through AWS Cosole, SDK and CLI are logged using CloudTrail.  CloudTrail is enabled on the AWS account when the account is created.

AWS CloudTrail logs management events (management events are: CRUD on all the AWS services, for e.g., ec2 instances create/delete/modify/list) across AWS services by default for all regions. 

## `AWS-PRICE` for CloudTrail
1. The management events are delivered for free in S3 bucket by default.  
2. If you create additonal trail and log the same management events in another bucket, it'll cost you money.
3. You can view 90-day history of your account’s management events for free using AWS console or the AWS CLI Lookup API.
4. This exercise does not cost any money as we're looking at management events only.

## AWS cli commands to see AWS Cloudtrail events
```
$ aws cloudtrail lookup-events --max-items 50

$# to filter some fields
$ aws cloudtrail lookup-events --max-items 50  --query 'Events[*].{EventId:EventId,EventName:EventName,EventSource:EventSource,EventTime:EventTime}'
```

# AWS Config
AWS Config helps to record and check compliance of AWS resource configurations. For e.g., 
- if your organization's compliance rule is that all the EC2 instances must start with an instance profile, but if an instance is created without an instance profile, AWS Config can identify that non-compliant instance and flag that for correction.
- if your organization requires all ec2 instances to have some specific tags and if those tags are not found, then those non-compliant instances can be identified and corrected.

AWS Config does the following:
1. Monitors and records AWS resource configurations
2. Evaluates the current configurations against desired configurations 
3. Shows configuration histories 

There are primarily two concepts within AWS Config:
1. AWS Config recording is used for getting a repository of all the AWS resources and their configurations.
2. AWS Config rule evaluation or conformance pack evaluation is meant to audit or compliance checking of the resource configurations.

## `AWS-PRICE` for AWS Config
Two areas of charging are there.  One is AWS Config recording and another is AWS Config rule evaluation.

1. AWS Config recording - $0.003 per configuration item recorded in your AWS account per AWS Region. Whenever a resource undergoes a configuration change or a relationship change, configuration item is recorded. By default, AWS configuration recorder records all supported resources in the region where AWS Config is running.
2. A conformance pack evaluation is defined as an evaluation of one resource by one Config rule within the conformance pack. 
$0.0012 per conformance pack evaluation per Region for the first 1Million evaluations. We are doing only tags checking in couple of instances.  

It'll cost less than 20cents for this exercise assuming that you have kept your AWS account clean - meaning whatever resources you created including IAM roles, S3 buckets, ec2 instances, SNS topic, etc., deleted then and there.

AWS Config is expensive and it is not straight forward to understand. Give attention to pricing.  

If you leave the AWS Configuration recording "on", you may easily incur expenses as AWS Config recording charges 0.003 per configuration item.  

## AWS Config recording
Use Console: `AWS Config > Settings`
Enable recording.  Go to Dashboard under AWS Config and check all the configurations of all your resources.

After checking the configurations, stop recording.

Check AWS Config recording on or off using console or cli as below and remember to switch off.

Console: `AWS Config > Settings`
CLI:
```
$ aws configservice describe-configuration-recorders
```


## AWS Config Rule evaluation exercise steps
In this exercise, we'll create a Config rule to check whether EC2 instances have the expected tags.

``` 
$ aws configservice put-config-rule --config-rule file://aws-config-rule-for-tags.json 
```

Create couple of instances.  One with the expected tags CHW, CHW_CWAGENT; One without.  

Then run the below command to know the compliant and non-compliant configurations.  One instance will be reported as compliant and another will be reported as non-compliant.
```
$ aws configservice describe-compliance-by-resource
``` 

To view the history of changes in config of a resource, use the console with this navigation `AWS Config > Resources > i-0rnnnnd281062a3d0 > Timeline`.  Choose your resource id.

If you want to check using cli, use the below one after changing the resource id.
```
$ aws configservice get-resource-config-history --resource-type AWS::EC2::Instance --resource-id i-01rnnnd281062a3d0
```

Destroy the rule with the following cli command.
```
$ aws configservice delete-config-rule --config-rule-name CHWTagsForInstances
```

## AWS Config conformance packs
Conformance pack is a set of rules - combinations of either managed rules or custom created ones.

There is a good list of AWS provided best practices based conformance packs published in https://github.com/awslabs/aws-config-rules/tree/master/aws-config-conformance-packs .  

Conformance pack is an easy way to check AWS configurations for conformity around security, general best practices and organization policies.

Choose these conformace packs carefully.  Some of these can do too many conformance evalation and if it gets validated on many types of resources it could escalate the costs.
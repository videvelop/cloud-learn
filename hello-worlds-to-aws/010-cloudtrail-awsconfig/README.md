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

## `AWS-PRICE` for AWS Config
1. Charges are based on per rule, per resource evaluation.  A conformance pack evaluation is defined as an evaluation of a resource by a Config rule within the conformance pack.
2. $0.0012 per conformance pack evaluation per Region for the first 1Million evaluations. We are doing only tags checking in couple of instances.  It'll cost less than 10cents for this exercise.

## AWS Config exercise steps
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

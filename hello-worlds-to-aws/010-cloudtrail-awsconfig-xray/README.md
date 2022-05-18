# AWS Services - Cloudtrail, AWS Config, X-Ray 
This exercise is meant for understanding introduction information about some services that will be used in later exercises.

We will look at:
1. CloudTrail -  AWS CloudTrail enables auditing, security monitoring, and operational troubleshooting by tracking your user activity and API usage.
2. AWS Config
3. X-Ray

# CloudTrail
All the AWS services accessed through AWS Cosole, SDK and CLI are logged using CloudTrail.  CloudTrail is enabled on the AWS account the account is created.

AWS CloudTrail logs management events (It means CRUD on all the AWS services, for e.g., ec2 instances create/delete/modify/list) across AWS services by default for all regions. 

# `AWS-PRICE` for this exercise
1. The management events are delivered for free in S3 bucket by default.  
2. If you create additonal trail and log the same management events in another bucket, it'll cost you money.
3. You can view 90-day history of your account’s management events for free using AWS console or the AWS CLI Lookup API.

# AWS cli commands to see AWS Cloudtrail events
```
$ aws cloudtrail lookup-events --max-items 50

$# to filter some fields
$aws cloudtrail lookup-events --max-items 50  --query 'Events[*].{EventId:EventId,EventName:EventName,EventSource:EventSource,EventTime:EventTime}'
```
# CloudTrail
All the AWS services accessed through AWS Cosole, SDK and CLI are logged using CloudTrail.

AWS CloudTrail logs management events (It means CRUD on all the AWS services, for e.g., ec2 instances create/delete/modify/list) across AWS services by default for all regions. These management events are delivered for free in S3 bucket by default.  If you create additonal trail and log the same management events in another bucket, it'll cost you money.

You can view 90-day history of your account’s management events for free using AWS console or the AWS CLI Lookup API.

```
 $ aws cloudtrail lookup-events --max-items 50

 $# to filter some fields
$aws cloudtrail lookup-events --max-items 50  --query 'Events[*].{EventId:EventId,EventName:EventName,EventSource:EventSource,EventTime:EventTime}'
```
whenever you call any AWS service through CLI or console or SDK, check whether an equivalent event is found in cloudtrail.
# AWS CloudWatch
CloudWatch collects monitoring and operational data in the form of 
- logs 
- metrics
- events 

CloudWatch helps to gain complete visibility of your AWS resources, applications, and services running on AWS and on-premises.

## `AWS-PRICE` for this exercise
1. EC2 Basic monitoring is free.  EC2 Detailed monitoring costs money.  Detailed monitoring gives data points on metrics every 1 min and basic monitoring gives every 5min.
2. Cloudwatch pricing is bit complex and costly too.   EC2 Detailed Monitoring is charged at $2.10 per instance per month (assumes 7 metrics per instance) and goes down to $0.14 per instance at the lowest priced tier. 
3. Metrics collected by the CloudWatch agent are billed as custom metrics. custom metric costs 0.30 per metric per month. i.e., to collect memory used percentage, there is 30c per month per instance.
4. Metrics used in "alarm" costs 30c per alarm per metric per month.
4. The logs processed in cloudwatch is charged for amount of data transferred out, storing data and analysis (logs insight queries).
5. SNS topic costs money. It is based on the number of monthly API requests made, and the number of deliveries to various endpoints (the cost of the delivery depends on the endpoint type). 1000 email notifications free in free-tier and it costs $2 for 100,000 email notifications.
6. Since we are using EC2 instance, that'll will also cost money.

The usage from Billing Dashboard for this exercise are given below. This exercise is developed in 6 hours and costed nothing. 
$0.00 per alarm metric month - first 10 alarm metrics - 0.164 Alarms
$0.00 per metric-month - first 10 metrics - 0.831 Metrics
$0.00 per request - first 1,000,000 requests - 5,714.000 Requests
$0.30 per alarm metric month (high resolution) - US East (Northern Virginia) - 0.025 Alarms

AmazonCloudWatch PutLogEvents-First 5GB per month of log data ingested is free - 0.000001 GB

AmazonCloudWatch StartQuery - First 5GB per month of log data scanned by CloudWatch Logs Insights queries is free-  0.010 GB

AmazonCloudWatch USE1-TimedStorage-ByteHrs First 5GB-mo per month of logs storage is free - 0.000002 GB-Mo

## Monitoring EC2
Some terminologies and defintions to note are given below. For the details, Ref https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/cloudwatch_concepts.html .

1. Amazon EC2 sends metrics to Amazon CloudWatch. Metrics are the fundamental concept in CloudWatch. 
    - Metric is a variable to monitor. For example, the CPU usage of an EC2 instance is one metric. 
    - By default, many AWS services provide free metrics for resources (such as Amazon EC2 instances, Amazon EBS volumes, and Amazon RDS DB instances).  
    - You can also publish your own custom metrics (such as number of transactions, sales amount, etc.).  Custom metrics costs money. 
    - Metrics exist only in the Region in which they are created. 
    - Metrics cannot be deleted, but they automatically expire after 15 months if no new data is published to them. 
    - Data points older than 15 months expire on a rolling basis; as new data points come in, data older than 15 months is dropped.  "Data point" refers to the time order set of values.  "CPU Usage" is a metric and the values are referred as "data points".
    - Metrics are uniquely defined by a name, a namespace, and zero or more dimensions. Each data point in a metric has a time stamp, and (optionally) a unit of measure. You can retrieve statistics from CloudWatch for any metric.
2. EC2 instance standard metrics are: CPUUtilization, Disk Read/Write Ops, Disk Read/Write Bytes, Network Packets In/Out,  Network In/Out,  MetadataNoToken; Note the obvious one missing.  AWS does not provide Memory usage metric for free :( . Memory usage collection requires some additional steps that this exercise will cover.  Ref this for some explanation around this: https://stackoverflow.com/questions/57369025/why-memory-utilization-of-ec2-instance-is-not-default-metric-of-amazon-cloudwatc 
3. EC2 metric dimensions are: ImageId, InstanceId, Instance type, and AutoScalingGroupName.
4. Statistics are metric data aggregations such as minimum, maximum, sum, average, over specified periods of time.
5. Namespace is a container for CloudWatch metrics. The AWS namespaces convention is: AWS/service.  E.g., namespaces are AWS/EC2, AWS/RDS.
6. Alarms : alarms initiate some actions based on metrics. For e.g., if CPU usage stays above 80% for 5minutes, alarm gets generated and it triggers one or more specified actions.
7. Action is a notification sent to an Amazon SNS topic or an Auto Scaling policy. You can also add alarms to dashboards.  Alarms invoke actions for sustained state changes only. CloudWatch alarms do not invoke actions simply because they are in a particular state. The state must have changed and been maintained for a specified number of periods.

When creating an alarm, select an alarm monitoring period that is greater than or equal to the metric's resolution. For example, basic monitoring for Amazon EC2 provides metrics for your instances every 5 minutes. When setting an alarm on a basic monitoring metric, select a period of at least 300 seconds (5 minutes). Detailed monitoring for Amazon EC2 provides metrics for your instances with a resolution of 1 minute. When setting an alarm on a detailed monitoring metric, select a period of at least 60 seconds (1 minute).

If you set an alarm on a high-resolution metric, you can specify a high-resolution alarm with a period of 10 seconds or 30 seconds, or you can set a regular alarm with a period of any multiple of 60 seconds. There is a higher charge for high-resolution alarms. 


## Create EC2 and watch for CPU utilization above 10%
The steps involved are:
1. Create AWS EC2 instance
2. Enable detailed monitoring so that we get data points every one minute rather than the default 5min
3. Create SNS topic to notify alarm.  
2. Create Alarm for the EC2 instance's CPU crossing 10% consistently for 1 minute

### Create EC2 instance
This is same as how ec2 on-demand amazon-linux instance was created. Commands are given for easy copy paste here.  One change in `aws ec2 run-instances` command to to enable detailed monitoring, which will give data points every 1min. Otherwise, you need to wait for 5min.
```
$ export CHW_AMI_IMAGE_ID=ami-0f9fc25dd2506cf6d
$ export CHW_SECURITY_GROUP=myawsec2secgroup
$ aws ec2 create-security-group \
           --group-name ${CHW_SECURITY_GROUP} \
             --description "My AWS EC2 Security Group"

$ aws ec2 import-key-pair \
    --key-name id_rsa_aws \
    --public-key-material fileb://~/.ssh/id_rsa_aws.pub

$ #Set monitoring enabled so that data poings come every 1min to reduce delay in running this exercise.
$ aws ec2 run-instances \
           --image-id ${CHW_AMI_IMAGE_ID} \
             --security-groups ${CHW_SECURITY_GROUP} \
               --instance-type t2.micro \
                 --key-name id_rsa_aws \
                 --monitoring 'Enabled=true'

$ aws ec2  authorize-security-group-ingress \
           --group-name  ${CHW_SECURITY_GROUP} \
             --port 22 \
               --protocol tcp \
                 --cidr 0.0.0.0/0

$ aws ec2 describe-instances \
        --query 'Reservations[*].Instances[*].{ImageId:ImageId,InstanceId:InstanceId,State:State,PublicDnsName:PublicDnsName}' \
        --filters Name=instance-state-name,Values=running

$ #get the public dns name of the running instance
$ aws ec2 describe-instances \
        --query 'Reservations[*].Instances[*].{ImageId:ImageId,InstanceId:InstanceId,State:State,PublicDnsName:PublicDnsName}' \
        --filters Name=instance-state-name,Values=running
```
### Make the ec2 instance load CPU and memory
SSH into the instance and load the CPU.  'dd' is a standard unix command that takes input from "if" and outputs to "of".  Running the below dd command loads the CPU to be above 20% in the t2.micro type instance.
```
$ ssh -i ~/.ssh/id_rsa_aws ec2-user@ec2-public-ip
$ dd if=/dev/zero of=/dev/null
```

### Create SNS topic
Amazon Simple Notification Service (SNS) is a fully managed messaging service.

When Alarm happens, the users may want some action to be taken automatically.  This automatic action can be of wide range such as sending email notification, SMS notification, hitting HTTP(s) end points, hitting AWS lambda function, auto scaling and such.

In this exercise, when alarm gets triggered we'll initiate automatic e-mail.  In order to do that, the steps to be done are:
1. Create SNS topic.
2. Subscribe e-mail to it.
3. Verify the e-mail notification received

The below commands will help to achive that.
```
$ aws sns create-topic --name chwcwalarmtopic

$# verify whether the topic is created successfully and make note of the ARN
$ aws sns list-topics

$# substitute with your account number and your e-mail before executing this step
$ aws sns subscribe --topic-arn arn:aws:sns:us-east-1:811111111110:chwcwalarmtopic --protocol email --notification-endpoint chwalarm@example.com
```
Manually confirm the e-mail using the notification received in the email.

You can send test messages to this topic and check whether you receive that message in your email.  Use console for that purpose.

Access console with this navigation. Remember to substitue with your ARN you noted earlier using `aws sns list-topics`.
https://us-east-1.console.aws.amazon.com/sns/v3/home?region=us-east-1#/publish/topic/arn:aws:sns:us-east-1:811111111110:chwcwalarmtopic
`Amazon SNS > Topics > chwcwalarmtopic > Publish message`

### Create Alarm for CPUUtilization
Alarm is on a single metric.  Each metric is associated with a namespace such as AWS/EC2, AWS/RDS.
```
$# create alarm
$# by the name chw_cpu_mon
$# on the --metric-name CPUUtilization
$# metric from --namespace  AWS/EC2
$# take Average "--statistic" 
$# of datapoints coming for a --period of 60s
$# for --threshold crossing 5 units
$# with --unit being percentage
$# alarm action is to end message to sns topic

$ aws cloudwatch put-metric-alarm --alarm-name chw-cpu-mon --alarm-description "Alarm when CPU exceeds specified percent" --metric-name CPUUtilization --namespace AWS/EC2 --statistic Average --period 120 --threshold 5 --comparison-operator GreaterThanThreshold  --dimensions "Name=InstanceType,Value=t2.micro" --evaluation-periods 2 --alarm-actions arn:aws:sns:us-east-1:811111111140:chwcwalarmtopic --unit Percent
```

### Create Alarm for Memory utilization
Memory utilization monitoring requires more setup.  We have to install cloudwatch agent in EC2 instances so that it can look into the ec2 and get ther required metrics.

This requires below steps.
1. Create a role for EC2 instance so that the EC2 can use cloudwatch API services.
2. Install cloudwatch agent in EC2.
3. Create config file for the cloudwatch agent.
4. Start cloudwatch agent.
5. Create alarm for the memory related metric

### Create role, instance profile for EC2 instance and create instance
Create role, instance profile to make ec2 instance run cloudwatch agent successfully.

Run the following in your laptop.
```
$ # create the role with trust policy
$ cat chw-ec2-trust-policy.json
{
  "Version": "2012-10-17",
  "Statement": [ {
      "Effect": "Allow",
      "Principal": {
        "Service": "ec2.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    } ] }

$  aws iam create-role --role-name chw-ec2-role-cloud-watch --assume-role-policy-document file://chw-ec2-trust-policy.json 

$ # attach managed policy to it
$ aws iam attach-role-policy --role-name chw-ec2-role-cloud-watch --policy-arn arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy

$ # Create instance profile and add role to the instance profile.
$ aws iam create-instance-profile --instance-profile-name chw-ec2-instance-profile-for-cloudwatch-agent
$ aws iam add-role-to-instance-profile --instance-profile-name chw-ec2-instance-profile-for-cloudwatch-agent --role-name chw-ec2-role-cloud-watch 

$ # run the instance with this profile
$ aws ec2 run-instances\
    --image-id ${CHW_AMI_IMAGE_ID} \
    --security-groups ${CHW_SECURITY_GROUP}\
    --iam-instance-profile 'Name=chw-ec2-instance-profile-for-cloudwatch-agent'\            
    --instance-type t2.micro\
    --key-name id_rsa_aws\
    --monitoring 'Enabled=true'

$ # add permission for log retention policy. This is related to monitoring log messages
$ aws iam put-role-policy --role-name chw-ec2-role-cloud-watch  --policy-name chw-cw-log-retention --policy-document file://cloudwatchlogs-retention-policy-inline.json 

```

### install cloudwatch agent in ec2 instance and collect metrics using that
Login to ec2 instance and install cloudwatch agent.
```
$ sudo yum install amazon-cloudwatch-agent -y
```
In your ec2 instance, you'll see the amazon cloudwatch-agent installed in the /opt/aws folder.

CloudWatch agent is used to collect system metrics and application log files based metrics.  It can run on on-premises servers and aws instances. This agent can run on Windows Server and Linux.

Before starting to run the cloudwatch agent, we need to create a configuration file for it.  This configuration file is a JSON file and it specifies details like what metrics to collect and which application log files to process.

This json file can be created from scrtach manually, however it is easier to do using the wizard. Create a json file using the wizard. 
```
$  sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-config-wizard
```
The config.json thus created is available for your reference here.  Instead of using the wizard, you can copy this config.json under `/opt/aws/amazon-cloudwatch-agent/bin` and use it.  This config file specifies the metrics on which the data points are to be collected with the specified interval.

Run the cloudwatch agent in command line in ec2 instance
Run the commad to fetch the config file if you are updating config file after an intial start/stop.
```
$ sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -s -c file:/opt/aws/amazon-cloudwatch-agent/bin/config.json
```

Start the agent
```
$ sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -m ec2  -l DEBUG -a start
```
Check the status
```
$ sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -m ec2 -a status
```
"status" should be "running". If not, there is some error somewhere and you need to debug.  The right location to start with the debugging is cloudwatch agent's log which can be located under `/opt/aws/amazon-cloudwatch-agent/logs/`.

## Create Alarm for cloudwatch agent's metric on memory

Substitue your instance ID and SNS topic ARN before executing the below command in your laptop.
```
$ aws cloudwatch put-metric-alarm --alarm-name chw-mem-mon --alarm-description "Alarm for Mem for each instance" --metric-name "mem_used_percent"  --namespace CWAgent --statistic Average --period 60 --threshold 5 --comparison-operator GreaterThanThreshold  --dimensions "Name=InstanceId,Value=i-09bc985467425bfff" --evaluation-periods 1 --alarm-actions arn:aws:sns:us-east-1:811111111140:chwcwalarmtopic --unit Percent
```

Load the ec2 instance's memory with the following unix command.
Run this in ec2 instance.
```
 $ dd if=/dev/zero bs=512M of=/dev/null
```
In a couple of minitues you should get an alarm on memory crossing the threshold of 5%.

## Log file monitoring
A part of the cloudwatch agent's config.json file, we configured that cloudwatch needs to process /var/log/yum.log

This log can be viewed in console using this link.
https://us-east-1.console.aws.amazon.com/cloudwatch/home?region=us-east-1#logsV2:log-groups

Further analysis can be done using this log.  For e.g., if you want to create an alarm for any newly installed software in ec2 instances, you can create metric for a pattern "Installed" and use that metric in the alarm.

# Destroy the services

1. Destroy ec2 instance.  
2. You can also delete the instance profile, roles and security groups created - though these don't cost money, deleting resources will keep the environment clean.
3. Delete SNS topic
4. Delete alarms
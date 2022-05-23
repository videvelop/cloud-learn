# AWS CloudWatch Agent with Systems Manager
CloudWatch exercise done in the last exercise required installing Cloudwatch Agent manually in each instance and creating the required configuration using wizard or copying from somewhere.  It is not scalable when there are 100s (even 10s) of instances.

We'll use Cloudformation and Systems Manager (Run command and Parameter store) to automate the same.

## Systems Manager
Using Systems Manager console, you can view operational data from multiple AWS services and automate operational tasks across your AWS resources.

Systems Manager is vast with many tools.  Ref https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-best-practices.html for more details.

In this exercise, we'll use two features of Systems Manager.  Those are: 
- Run Command and 
- Parameter Store.

Parameter store is for managing global configuration settings. The Cloudwatch agent's configuration file is something we'll store in a central area and download it across many instances.

AWS Systems Manager's Run command 
- allows you to run remote commands on instances (or groups of instances using tags) in a controlled and auditable manner.
- You can control Run Command access through standard IAM roles and policies
- You can define documents to take input parameters
- You can use S3 bucket to return the command output 
- You can share your documents with other AWS accounts, or with the public

Run Command provides a nice set of remote management features.  That makes installing and configuring Cloudwatch agent at scale easy.

Let's go hands-on in using these.

## `AWS-PRICE` for this exercise
1. Systems Manager Run command does not incur any charges.  However rate limits apply.
2. Systems Manager Parameter store does not incur charges for standard parameters.  In this exercise standard parameter is used.  Standard parameters are less than 4KB size (Advanced is 8kb).  Advance option also allows higher rate limit and parameter policies.
3. Systems Manager agent does not incur any charges.
4. Systems Manager Patch Manager does not incur charges for supported operating systems in ec2 instance and on-prem instances.  "Advance tier" option is required for cases such as servers/VMs having windows applications.
5. EC2 instance costs and the cloudwatch costs apply.

## AWS Systems Manager Run Command for Cloudwatch Agent
This requires below steps.
1. Create AWS Role for ec2 instance's cloudwatch agent to use.  This is required as the instance needs to have permission to write to cloudwatch.  The managed policy "CloudWatchAgentServerPolicy" has the necessary permission for it. 
2. EC2 instances need to run systems manager agent in order to accept systems manager "run commands".  We use Systems Manager "run command" to install and run cloudwatch agent.  Systems Manager agent is by default installed in Amazon Linux 2 instances.  So, we are not covering steps on how to install Systems Manager in this exercise. However, instances need to run with required permissions to make the systems manager agent call AWS API successfully. "AmazonSSMManagedInstanceCore" managed policy contains the required permissions.
3.  AWS Systems Manager document (SSM document) defines the actions that Systems Manager performs on your managed instances. Systems Manager includes more than 100 pre-configured documents that you can use by specifying parameters at runtime.
4. The cloudwatch agent config file has to be created and should be available in the parameter store.  The name in the parameter store must start with "AmazonCloudWatch-" as the managed policies CloudWatchAgentServerPolicy and CloudWatchAgentAdminPolicy mandate that.


### Create an ec2 instance 
1. create ec2 instance with the required permissions(CloudWatchAgentServerPolicy and AmazonSSMManagedInstanceCore) in the instance role for cloudwatch agent and ssm agent to successfully use AWS APIs. 
2. Resource tag is to be fixed with ec2 instance as RUN command can pick up all the instances based on the tag name and value.  This option helps to install cloudwatch agent at scale in all the required instances.

The cloudformation template given in this folder can create ec2 instance with above requirements. Create cloudformation stack using the following command.

```
$ aws cloudformation create-stack --stack-name chwcwstack --template-body file://chw-cf-ec2-sm.json  --capabilities CAPABILITY_NAMED_IAM
```
When IAM related resources are created using cloudformation (such as AWS::IAM::Role), the "--capabilities" option is to be given.  CAPABILITY_NAMED_IAM is used for custom resources and CAPABILITY_IAM is used for standard resources.

### Check systems manager agent
Log into the ec2 instance and check whether ssm agent is running.
``` 
 sudo systemctl status amazon-ssm-agent 
```
`AWS Systems Manager > Fleet Manager` should list the instance if the ec2 instance has AmazonSSMManagedInstanceCore permission and the agent installed in it.
https://us-east-1.console.aws.amazon.com/systems-manager/managed-instances?region=us-east-1

### Install cloudwatch agent using run command
Use the console for run command. Access the following the console.
`AWS Systems Manager > Run Command > Run a command`.

You can also use this link: https://us-east-1.console.aws.amazon.com/systems-manager/run-command/send-command?region=us-east-1

AWS has a reusable repository of "Documents" that can be utilized to install cloudwatch agent. 

The Document to be used for installing cloudwatch agent is "AWS-ConfigureAWSPackage" with command parameter for "name" set to "AmazonCloudWatchAgent".

Use the console by choosing the Document(AWS-ConfigureAWSPackage) and give value for the "name" parameter ("AmazonCloudWatchAgent").  Select "Specify instance tags" for target and give the tag name, value (CHW, CHWCW).

Or, you can run the below command which is same as the console operation.
```
$ aws ssm send-command --document-name "AWS-ConfigureAWSPackage" --document-version "1" --targets '[{"Key":"tag:CHW","Values":["CHWCW"]}]' --parameters '{"action":["Install"],"installationType":["Uninstall and reinstall"],"version":[""],"additionalArguments":["{}"],"name":["AmazonCloudWatchAgent"]}' --timeout-seconds 600 --max-concurrency "50" --max-errors "0" --region us-east-1
```

### Makesure cloudwatch agent configuration file exist in Paramstore
The cloud agent configuration file given in this folder - "chw-cloudwatch-config.json", is an edited configuration file that was originally created by cloudwatch wizard.

You can use the console directly or run a aws cli command to upload this file to parameter store.   Use `AWS Systems Manager > Parameter Store`.  Same can be accessed using this link.
https://us-east-1.console.aws.amazon.com/systems-manager/parameters/?region=us-east-1&tab=Table 

To upload the cloudagent config file to paramstore, run the following command.  
```
$ aws cloudformation create-stack --stack-name chwcfssmparamstore     --template-body file://chw-cf-ssm-paramstore.json     --parameters ParameterKey=cwconfig,ParameterValue=$(jq '.|tostring' chw-cloudwatch-config.json)
```
Note the name of the parameter - "AmazonCloudWatch-CHW-AmazonLinux2".

### Start cloudwatch agent with the configuration file in Paramstore
Once the configuration file is in the Paramstore, the cloudwatch agent can be started by another run command in all the instances identified with a tag.

Use AWS management console and use Systems Manager Run Command with below inputs.

Choose the document : AmazonCloudWatch-ManageAgent
Optional Configuration Location: AmazonCloudWatch-CHW-AmazonLinux2
Targets: Specify instance tags
Tag: CHW, CHWCW

```
$ aws ssm send-command --document-name "AmazonCloudWatch-ManageAgent" --document-version "6" --targets '[{"Key":"tag:CHW","Values":["CHWCW"]}]' --parameters '{"action":["configure"],"mode":["ec2"],"optionalConfigurationSource":["ssm"],"optionalConfigurationLocation":["AmazonCloudWatch-CHW-AmazonLinux2"],"optionalOpenTelemetryCollectorConfigurationSource":["ssm"],"optionalOpenTelemetryCollectorConfigurationLocation":[""],"optionalRestart":["yes"]}' --timeout-seconds 600 --max-concurrency "50" --max-errors "0" --region us-east-1
```

### Check the instances are giving datapoints for metrics
Check whether the ec2 instances in which cloudwatch agent is installed and configured gives datapoints for the metrics.
```
$ aws cloudwatch list-metrics --namespace CWAgent --metric-name mem_used_percent --query "Metrics[*].Dimensions[?Name=='InstanceId'].*"
```

# Destroy AWS resources
Run the following steps in your laptop.
1. Delete the cloudformation stack that created the stack with the role and security group.
```
$ aws cloudformation delete-stack --stack-name chwcwstack
```

2. Delete the SSM Paramstore item for cloudwatch agent config file.
```
$ aws cloudformation delete-stack --stack-name chwcfssmparamstore 
```

# Additional Information
As and when new ec2 instances are launched, the requirement may be that cloudwatch agent is installed and data points are collected on metrics.

The following code in User Data of ec2 can help to do the initial installation, provided python is installed and the config file is in some accessible S3 bucket.
```
#!/bin/bash 
curl https://s3.amazonaws.com//aws-cloudwatch/downloads/latest/awslogs-agent-setup.py -O 
chmod +x ./awslogs-agent-setup.py 
python ./awslogs-agent-setup.py -n -r <AWS_REGION> -c s3://<S3_BUCKET_NAME>/<CLOUDWATCH_AGENT_CONFIG_FILE>
```

 For ongoing updates to cloudwatch agent config file at scale, another tool that comes handy is Systems Manager's Patch Manager tool. It can pick up all the instances with the specified tags and apply configuration updates at scheduled time.
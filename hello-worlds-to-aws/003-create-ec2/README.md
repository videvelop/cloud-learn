# Create EC2 instance
The objective of this sample is to create ec2 instance using AWS CLI and access it using ssh.

The instance created here is of type On-Demand from billing perspective.  Something about different billing options here.

| EC2 billing options | Use Cases| Description                                                                                                                                                                                                                                                                                                                                                                                                     |
| ------------------- | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| On-Demand           |  Suitable for near real-time, mission critical workloads.   For e.g., your ecommerce sites, running your databases for transactional apps, etc.                                               | Most expensive of all.  No commitment needed from your part.                                                                                                                                                                                      |
| Spot           | Suitable for batch processing workloads that do not have time pressure, that can withstand failures.  For e.g., running AI application to categorize millions of image files.     | Very cheap as AWS uses unused compute resources for this purpose.    No commitment needed from your part.  Instances will be abruptly reclaimed by AWS with 2min notice if AWS needs to use the compute power for other customers. Variations exist such as you can use spot instances for a defined period of time; You can hibernate spot instance and reinitiate the same.|
| Reserved           | When usage of instances is sporadic, but overall capacity is known for a period of 1 to 3 years.  For e.g., you'll need large amount of compute during projects performance testing; your business is event based and you'll need servers at the time of event launches; you have multiple AWS accounts and you want to share capactiy among the accounts| Your commitment is needed for the capacity you'll use in a period of time.                                                                                                                                                                                                                                                                                                                                                                                                                |
|   |   |  |
|   |   |  |



`AWS-PRICE` for this hands-on exercise:
  1. EC2 instances cost money.  However, t2.micro instance type is available free for 750hours per month for the first 12months under free tier. If not under Free-Tier, On-Demand EC2 t2.micro instance is USD 0.0116 per hour.
  2. You need to use key pair to connect to ec2 instance using SSH.  AWS does not charge for creation and storage of key pairs.  However AWS charges for the API calls.  Free tier allows 20,000 requests/month and this exercise will be well below this limit.  Refer [AWS KMS Pricing](https://aws.amazon.com/kms/pricing/) for further details.
  3. Creating security group does not cost money.  It is not a resource per se. It is a configuration.

## Something to note
It is important to note that some of the AWS services are global and some are regional.  EC2 service is regional.  If you don't see the ec2 instance that you created using CLI in the AWS console, check the region first. ```aws configure list``` will show the region used by aws cli and AWS console will also show the region on the top bar.  If you still don't see the ec2 instance you created, check whether you are using the same account and same user.


## EC2 creation Steps
EC2 instance creation involves below conceptual steps.
  1. Create keypair to use for ssh into ec2 instance
  2. Create security group and open ssh port 22 to allow ssh access to ec2 instance from outside world
  3. Create ec2 instance



### Create SSH Key Pair
Create ssh key locally using ssh-keygen.  Later, you'll use this key while creating EC2 instance and for ssh-ing to the instance.
```
$ ssh-keygen -f ~/.ssh/id_rsa_aws
```
Run the below to know the principal invoking the aws cli.

```
$ aws sts get-caller-identity
{
    "UserId": "AIDAQXXX2D7XBVYBU6JP3D",
    "Account": "098765815043",
    "Arn": "arn:aws:iam::098765815043:user/chw-org-admin1"
}

``` 

Import the keypair into AWS.  Note that the public key material is to be uploaded as base64 encoded blob.
```
$ aws ec2 import-key-pair \
    --key-name id_rsa_aws \
    --public-key-material fileb://~/.ssh/id_rsa_aws.pub
{
    "KeyFingerprint": "f6:c2:43:a3:54:e1:f1:bd:51:11:aa:9b:e7:16:11:b5",
    "KeyName": "id_rsa_aws",
    "KeyPairId": "key-02e32d41b98769876"
}

```

Validate whether the key is successfully imported.
```
$ aws ec2 describe-key-pairs --query 'KeyPairs[*].KeyName'
[
    "id_rsa_aws"
]
```

You can see thus created key in AWS console under  `Services > EC2 > Network & Security > Key Pairs`.

### Create Security Group

1. Create security group as below.  Security group is an equivalent of "ufw".  ufw (uncomplicated firewall) can be run as a unix command to do host level control for ports and IPs.  AWS EC2 uses security groups instead of setting firewall rules within ec2 instance using ufw.  It is possible to set ufw firewall rules as well, but it is totally uncessary.  
```
$ aws ec2 create-security-group \
  --group-name myawsec2secgroup \
  --description "My AWS EC2 Security Group"
{
    "GroupId": "sg-014492d7ebfa3540a"
}

```

2. Check whether the security group is created
```
$ aws ec2 describe-security-groups --group-names  myawsec2secgroup --query 'SecurityGroups[*].GroupName'
[
    "myawsec2secgroup"
]
```

3. Open up ssh port 22 in the security group. ssh uses tcp protocol.
```
$ aws ec2  authorize-security-group-ingress \
  --group-name  myawsec2secgroup \
  --port 22 \
  --protocol tcp \
  --cidr 0.0.0.0/0
{
    "Return": true,
    "SecurityGroupRules": [
        {
            "SecurityGroupRuleId": "sgr-0cea013ebf66de99a",
            "GroupId": "sg-014492d7ebfa3540a",
            "GroupOwnerId": "099999915043",
            "IsEgress": false,
            "IpProtocol": "tcp",
            "FromPort": 22,
            "ToPort": 22,
            "CidrIpv4": "0.0.0.0/0"
        }
    ]
}

```
CIDR 0.0.0.0/0 indicates ingress connection from all IP.  If CIDR terminology is new to you, recommend you going through some learning material in internet such as [CIDR on geeksforgeeks](https://www.geeksforgeeks.org/classless-inter-domain-routing-cidr/).

Check whether the ssh port is open
```
$ aws ec2 describe-security-groups --group-names  myawsec2secgroup --query 'SecurityGroups[*].[IpPermissions,GroupName]'
[
    [
        [
            {
                "FromPort": 22,
                "IpProtocol": "tcp",
                "IpRanges": [
                    {
                        "CidrIp": "0.0.0.0/0"
                    }
                ],
                "Ipv6Ranges": [],
                "PrefixListIds": [],
                "ToPort": 22,
                "UserIdGroupPairs": []
            }
        ],
        "myawsec2secgroup"
    ]
]
```


### Create EC2 instance
You need to choose an EC2 image in order to create EC2 instance.  Choose one of the free tier eligible images.  You can look for free tier images by looking at AWS console `Services > EC2 > EC2 Dashboard > Launch Instance`

  ![console screen shot][ec2-image]

  [ec2-image]: ../common/images/aws-ec2-image.png "ec2-images"

Get to know the details of the image.
```
 $ aws ec2 describe-images --image-ids ami-0ed9277fb7eb570c9 --query 'Images[*].[ImageLocation,PlatformDetails,Description]'

[
    [
        "amazon/amzn2-ami-kernel-5.10-hvm-2.0.20211201.0-x86_64-gp2",
        "Linux/UNIX",
        "Amazon Linux 2 Kernel 5.10 AMI 2.0.20211201.0 x86_64 HVM gp2"
    ]
]
```

Now, you are ready to create an instance.  You'll need to use the ssh key you created, the security group you created, the image you identified to run this command.

```
$ aws ec2 run-instances \
  --image-id ami-0ed9277fb7eb570c9 \
  --security-groups myawsec2secgroup \
  --instance-type t2.micro \
  --key-name id_rsa_aws
  
  {
    "Groups": [],
    "Instances": [
        {
            "AmiLaunchIndex": 0,
            "ImageId": "ami-0ed9277fb7eb570c9",
            "InstanceId": "i-0e932ccea172665d8",
...
```

It usually takes about 2 minutes time to bring up the instance after successfully running the above command.  
Get the instance id, instance state and public IP as follows.
```
$ aws ec2 describe-instances  --query 'Reservations[*].Instances[*].{InstanceId:InstanceId,State:State,PublicIpAddress:PublicIpAddress}'
[
    [
        {
            "InstanceId": "i-0e932ccea172665d8",
            "State": {
                "Code": 16,
                "Name": "running"
            },
            "PublicIpAddress": "54.167.68.108"
        }
    ]
]

```

# SSH to the instance
SSH to the newly created instance with the public IP you got from the above step after the state turns "running".  You can view the instance in the console by accessing `Services > EC2 > EC2 Dashboard`
```
ssh -i id_rsa_aws ec2-user@52.87.158.51
```

Voila!! EC2 instance created!!

## Destroy the resources created

### Terminate the instance
1. Get the instance id and then destroy using that.
```
$ aws ec2 describe-instances  --output text --query 'Reservations[*].Instances[*].InstanceId'

i-0e932ccea172665d8

```

1. Issue terminate instance command using the instance id.
```
aws ec2 terminate-instances --instance-ids i-072bf79f71d1f02ed
```

3. Alternatively, you can run this piped command to terminate all the running instances in one go.
```
$ aws ec2 describe-instances --output text --query 'Reservations[*].Instances[*].InstanceId' --filters Name=instance-state-name,Values=running | xargs aws ec2 terminate-instances --instance-ids 

{
    "TerminatingInstances": [
        {
            "CurrentState": {
                "Code": 32,
                "Name": "shutting-down"
            },
            "InstanceId": "i-0dee8008761bd4747",
            "PreviousState": {
                "Code": 16,
                "Name": "running"
            }
        }
    ]
}

```
Terminated instances will be there in AWS for sometime and then they disappear.

### Destroy key pair


```
aws ec2 delete-key-pair --key-name id_rsa_aws 
```

### Destroy the security group

```
 aws ec2 delete-security-group --group-name myawsec2secgroup
```

## Additional info

### How to use AWS Key pair instead of your own?
You can create key pair within AWS also using below command and get the key locally to connect to ec2 via ssh.
```
$ aws ec2 create-key-pair --key-name myawssshkey --query 'KeyMaterial' --output text > myawssshkey.pem

# To check whether the key is created
$ aws ec2 describe-key-pairs --query 'KeyPairs[*].KeyName'
[
    "myawssshkey"
]

# To delete the key
$ aws ec2 delete-key-pair --key-name myawssshkey
```



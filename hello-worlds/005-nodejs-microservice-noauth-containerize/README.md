# S3 - How to store/retrieve your backup files in S3?
You have learnt to create ec2 instance by now. Let's get into an important storage service now - S3.

In this sample we'll store RDS (say MariaDB) backup taken from onprem server in S3, and retrieve from S3 to EC2. This is one easy lift-and-shift (Rehost) way to migrate DB from onprem to cloud.  This requires DB downtime to have perfectly sync'ed data.  Later, we'll have sample using AWS Database Migration Service that'll avoid DB downtime. 

S3 is of "object" storage type. It is suitable for storing backups, hosting static/dynamic web sites, media files.  S3 is NOT suitable (not possible) for installing applications and run from this storage by attaching to EC2; Not suitable as DB installation storage.

S3 doesn't have a concept of directory/folder and files. It has "objects" with "key" and "contents".  It also has "metadata" for objects. What appears to be a folder is actualy an object without any contents.  What appears to be folder path is the "key".

Elastic Block Storage (EBS) and Elastic File Storage (EFS) are to be used for binary installations and database data files.  More on EFS and EBS later in other samples.

S3 storage is regional.  However, S3 bucket name must be unique globally.

S3 is stored in different classes and each class offers some price related benefits. Refer: https://aws.amazon.com/s3/storage-classes/

Following factors influence AWS pricing for S3.
1. Size of the objects stored in S3
2. S3 storage class.  For e.g., 
- S3 Glacier Deep Archive is the cheapest (USD 0.00099 per GB per month) and it takes the longest (may take upto 12 hours) to retrieve.  
- S3 Standard costs more (USD 0.023 per GB per month) because it offers low latency, high throughput storage.
3. Transferring data in and out of S3 (whether it is from outside AWS cloud or within AWS cloud costs money.  For e.g., replicating S3 bucket from one region to the other costs transfer-out rate and also transfer-in (PUT request) rates.)
Refer: https://aws.amazon.com/s3/pricing/
4. Some monitoring can be enabled on S3 Storage to intelligently move objects across storage classes.  This monitoring incurs cost. 

In sum, S3 storage type, amount of data stored, amount of data transferred-in and out, monitoring S3 objects for life cycle management all cost money.


## `AWS-PRICE` for this sample

  1.  AWS Free-tier customers get 5GB of Amazon S3 storage in the S3 Standard storage class; 20,000 GET Requests; 2,000 PUT, COPY, POST, or LIST Requests; and 100 GB of Data Transfer Out each month.  If you are in free-tier, it costs nothing.
  2.  If you are not in free tier, since this exercise just requires few PUT/GET/LIST request and 2 or 3 sample files with 1MB (assuming your sample RDB backup file is small) or less content size, the cost will be few cents.  
  3.  You'll need to use an EC2 instance to restore the backup and install RDB in that EC2.  For Free Tier, t2.micro instance can be used free of cost. Otherwise, it'd cost USD 0.0116 per hour.
  4.  If you are not in Free Tier and if you finish this exercise within an hour, this exercise would cost less than USD 0.03.
   
## Create, List S3 bucket
```
$ aws s3api create-bucket --bucket chw-sample-bkt1
{
    "Location": "/chw-sample-bkt1"
}
$ aws s3api list-buckets --query 'Buckets[*].Name'
[
    "chw-sample-bkt1"
]
```

## Upload objects to bucket from your laptop

```
$# upload single file
$ aws s3 cp file1.txt s3://chw-sample-bkt1
upload: ./file1.txt to s3://chw-sample-bkt1/file1.txt

$# upload folder with subfolders and files as objects to S3
$ mkdir folder
$ touch folder/file1.txt
$ mkdir folder/subfolder
$ touch folder/subfolder/file2
$ aws s3 cp folder s3://chw-sample-bkt1 --recursive
upload: folder/file1.txt to s3://chw-sample-bkt1/file1.txt
upload: folder/subfolder/file2 to s3://chw-sample-bkt1/subfolder/file2


```

## Retrieve objects from bucket to your laptop

```
$ cd /tmp/
$ mkdir s3-retrieve
$ cd s3-retrieve/
$ aws s3 cp s3://chw-sample-bkt1 ./ --recursive
download: s3://chw-sample-bkt1/subfolder/file2 to subfolder/file2
download: s3://chw-sample-bkt1/file1.txt to ./file1.txt
$ ls -R .
.:
file1.txt  subfolder

./subfolder:
file2
/tmp/s3-retrieve$ 

```
## Migrate RDB (something like mariadb)
The steps involved are:
1. Create mariadb backup using mysqldump in on-prem server.
2. Upload the backup to S3
3. Download the backup into ec2
4. Restore the backup to ec2's mariadb.  Get the DB up and running in EC2.  
RDB (e.g., mariadb) installation, backup, restore commands are not covered in this sample.  The only step unknown to you after finishing all the prior exercises is how to download the backup from s3 to ec2.  We shall go through that here.

## How to get S3 object into EC2
Simply put, EC2 instance should have some permissions to access the S3 bucket.  Tha permission is given to EC2 through IAM "Role" that the EC2 needs to assume.  

In the same way laptop OS accesses S3, EC2 can also be provided with AWS user credentials to access the S3 buckets and the objects.  But it is bad for the following reasons.
1. You need to create IAM user account with programmatic access credentials for EC2 to use.  It is not secure as the credentials are to be shared with multiple users using ec2.  Accountability is lost.
2. It is difficult to manage also.  If the credentials change, then all the users are to be notified with those credentials and/or all the EC2 are to be reconfigured with the changed credentials if any automatic config set up is there.

The better way is to create a role and make EC2 assume that role.  This role will have read-only permission to the required S3 bucket alone.


### How to create S3 bucket in EC2 to download the backup?
The steps for this are:
1. Create instance profile that you can attach to an instance.  You can use this instance profile at the time of creating the instance or attach it when instance is running.
2. This instance profile will need to have a "role" and that role will have the required S3 bucket read permissions.
3. For an AWS Service (such as EC2) to assume a role, the role has to be defined with "trust relationship".  Trust relationship  specifies which principals (EC2 in this case) can assume the role, and under which conditions. "trust relationship" is sometimes referred to as a resource-based policy for the IAM role. We’ll refer to this policy simply as the ‘trust policy’.

1. So, let's first create "trust policy".
  ```
  $ vi ec2-trust-policy.json
  {
    "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "trust-policy1",
      "Effect": "Allow",
      "Principal": {
        "Service": "ec2.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

1. Create a "role" with the above trust policy attached.
```
$ aws iam create-role --role-name ec2-read-s3-backup-role --assume-role-policy-document file://ec2-trust-policy.json
```
3. Associate S3 bucket read permissions to this role.  

Note that you cannot have a space before the beginning curly braces "{" in this document you edit.  There seems a bug yet to be fixed in aws cli. Ref: https://github.com/99designs/iamy/issues/65 
```
$ vi s3-bucket-read-permission.json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "VisualEditor0",
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::chw-sample-bkt1/*"
            ]
        }
    ]
}
$ aws iam put-role-policy --role-name ec2-read-s3-backup-role --policy-name s3-backup-read-policy --policy-document file://s3-bucket-read-permission.json
```

4. create instance profile (If you are using AWS console, this instance profile creation is not needed because AWS implicitly creates this instance profile when you create role.)
```
$ aws iam create-instance-profile --instance-profile-name ec2-instance-profile-s3-read-backup
```

5. Add role to the instance profile.
```
aws iam add-role-to-instance-profile --instance-profile-name ec2-instance-profile-s3-read-backup --role-name ec2-read-s3-backup-role

```
6. Attach this instance profile while creating instance or to a running instance.  Here, it attaches to a running instance.
```
$ # find out if any instance profile associates are already there
$ aws ec2 describe-iam-instance-profile-associations
$ aws ec2 describe-iam-instance-profile-associations --output text --query 'IamInstanceProfileAssociations[*].AssociationId'

$ #if you find any associations, remove that.  Replace the association-id with your id
$  aws ec2 disassociate-iam-instance-profile --association-id iip-assoc-0e265bf8bc6da664a

$ # Associate the instance profile you created for reading s3.  SSH to the instance and see whether the bucket is accessible
$ aws ec2 associate-iam-instance-profile --iam-instance-profile Name=ec2-instance-profile-s3-read-backup --instance-id i-067f48b0a6498d76a

```

7.  ssh to the ec2 instance.
```
$ # get the caller identity. You'd see the role you assciated. EC2 is associated with this role and that helps EC2 to get a token from STS (Simple Token Service) and that token provides permissions for executing other aws cli commands such as "aws s3 cp".
$  aws sts get-caller-identity 
{
    "Account": "099999915043", 
    "UserId": "AROAQVI987659876598YTJ:i-067f48b0a6498d76a", 
    "Arn": "arn:aws:sts::099999915043:assumed-role/ec2-read-s3-backup-role/i-067f48b0a6498d76a"
}

$ # copy the RDB backup locally and use that to restore the DB
$ aws s3 cp s3://chw-sample-bkt1/m.backup .
download: s3://chw-sample-bkt1/m.backup to ./m.backup   
```

Now that the backup file is available in EC2, use that to set up your RDB with on-prem database copy.

## Destroy the services using AWS console
  1. Stop & terminate the instance 
  2. Delete the instance profile
  3. Delete policy
  4. Delete role
  5. Empty the s3 bucket and Delete s3 bucket

## Additional info
Your database size for real projects' dev/test/prod needs may  be higher.  In that case, there is an option to use multi-part-load in S3.  Explore it further.  Starting point is given here. 
```
$# For large files, use multi-part load
$ aws s3api create-multipart-upload --bucket chw-sample-bkt1 --key large_test_file
```

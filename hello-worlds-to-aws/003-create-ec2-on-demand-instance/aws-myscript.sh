#!/bin/bash
set -x

. ./aws-service.env
echo  AMI image id to be used is $AMI_IMAGE_ID
echo EC2 Security group is $SECURITY_GROUP
. ../common/scripts/aws-myscript-common.sh

Help()
{
   # Display Help
   echo
   echo "Syntax: $0 [--help|--create|--list|--delete]"
   echo "options:"
   echo "create  - creates, configures required aws resoruces and lists the same"
   echo "list - lists the aws resources created/available"
   echo "delete - deletes the aws resources created; user inputs may be needed"
   echo
}

Create() 
{

    echo "Create AWS resources"
    echo

    echo "===="
    echo "Create ssh key locally using ssh-keygen. Don't give pass phrase for this exercise."
    echo  "ssh-keygen -f ~/.ssh/id_rsa_aws"
    ssh-keygen -f ~/.ssh/id_rsa_aws
    if [ $? != 0 ] ; then echo "Some error..." >&2 ; GetYN ; fi

    echo
    echo "====="
    echo "import keypair to aws"
    echo "    aws ec2 import-key-pair \
    --key-name id_rsa_aws \
    --public-key-material fileb://~/.ssh/id_rsa_aws.pub"
    aws ec2 import-key-pair \
    --key-name id_rsa_aws \
    --public-key-material fileb://~/.ssh/id_rsa_aws.pub
    if [ $? != 0 ] ; then echo "Some error..." >&2 ; GetYN ; fi


    echo
    echo "===="
    echo "Create security group"
    echo "    aws ec2 create-security-group \
        --group-name ${SECURITY_GROUP} \
        --description "My AWS EC2 Security Group""
    aws ec2 create-security-group \
        --group-name ${SECURITY_GROUP} \
        --description "My AWS EC2 Security Group"
    if [ $? != 0 ] ; then echo "Some error..." >&2 ; GetYN ; fi


    echo
    echo "====="
    echo "Open SSH port for TCP protocol in the security group"
    echo "    aws ec2  authorize-security-group-ingress \
        --group-name  ${SECURITY_GROUP} \
        --port 22 \
        --protocol tcp \
        --cidr 0.0.0.0/0"
    aws ec2  authorize-security-group-ingress \
        --group-name  ${SECURITY_GROUP} \
        --port 22 \
        --protocol tcp \
        --cidr 0.0.0.0/0
    if [ $? != 0 ] ; then echo "${RED}Some error...${NC}" >&2 ; GetYN ; fi

    echo 
    echo "====="
    echo "Create EC2 instance"
    echo "   aws ec2 run-instances \
        --instance-type t2.micro \
        --image-id ${AMI_IMAGE_ID} \
        --security-groups ${SECURITY_GROUP} \
        --instance-type t2.micro \
        --key-name id_rsa_aws \
        --query 'Instances[*].{InstanceId:InstanceId,InstanceType:InstanceType,NetworkInterfaces:NetworkInterfaces[*].{Groups:Groups}}'

"

        aws ec2 run-instances \
        --instance-type t2.micro \
        --image-id ${AMI_IMAGE_ID} \
        --security-groups ${SECURITY_GROUP} \
        --instance-type t2.micro \
        --key-name id_rsa_aws \
        --query 'Instances[*].{InstanceId:InstanceId,InstanceType:InstanceType,NetworkInterfaces:NetworkInterfaces[*].{Groups:Groups},PublicDnsName:PublicDnsName}'

}

Delete() 
{
    echo "Delete AWS resources"

    echo "===="
    echo "Terminate all the  instances"
    echo "    aws ec2 describe-instances  \
        --output text \
        --query 'Reservations[*].Instances[*].InstanceId'\
        --filters Name=instance-state-name,Values=running | xargs aws ec2 terminate-instances --instance-ids"
    aws ec2 describe-instances  \
        --output text \
        --query 'Reservations[*].Instances[*].InstanceId'\
        --filters Name=instance-state-name,Values=running | xargs aws ec2 terminate-instances --instance-ids

    if [ $? != 0 ] ; then echo "Some error..." >&2 ; GetYN ; fi

    echo sleep for 60sec to terminate all the instances
    sleep 60

    echo "===="
    echo "Delete keypair"
    echo "  aws ec2 delete-key-pair --key-name id_rsa_aws"

    aws ec2 delete-key-pair --key-name id_rsa_aws 
    if [ $? != 0 ] ; then echo "Some error..." >&2 ; GetYN ; fi

    echo "===="
    echo "Delete security group"
    echo "aws ec2 delete-security-group --group-name ${SECURITY_GROUP}"
    aws ec2 delete-security-group --group-name ${SECURITY_GROUP}
    if [ $? != 0 ] ; then echo "Some error..." >&2 ; GetYN ; fi
}

List() 
{
    echo "List AWS resources"

    echo "====="
    echo "EC2 Instances"
   aws ec2 describe-instances \
        --query 'Reservations[*].Instances[*].{ImageId:ImageId,InstanceId:InstanceId,State:State,PublicDnsName:PublicDnsName}' \
        --filters Name=instance-state-name,Values=running
    
    echo "===="
    echo "KeyPair"
    aws ec2 describe-key-pairs \
        --query 'KeyPairs[*].KeyName'

    echo "===="
    echo "Security Group"
    aws ec2 describe-security-groups \
        --group-names  ${SECURITY_GROUP} \
        --query 'SecurityGroups[*].{GroupName:GroupName,GroupId:GroupId}'
    echo
}


if [ "$HELP" = true ] ; then Help  ; fi
if [ "$DELETE" = true ] ; then Delete  ;   fi
if [ "$CREATE" = true ] ; then Create  ;   fi
if [ "$LIST" = true ] ; then List ;   fi
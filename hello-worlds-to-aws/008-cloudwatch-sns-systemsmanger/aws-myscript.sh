 #!/bin/bash
. ./aws-service.env
 aws ec2 create-security-group \
           --group-name ${CHW_SECURITY_GROUP} \
             --description "My AWS EC2 Security Group"

 aws ec2 run-instances \
           --image-id ${CHW_AMI_IMAGE_ID} \
             --security-groups ${CHW_SECURITY_GROUP} \
               --instance-type t2.micro \
                 --key-name id_rsa_aws

 aws ec2  authorize-security-group-ingress \
           --group-name  ${CHW_SECURITY_GROUP} \
             --port 22 \
               --protocol tcp \
                 --cidr 0.0.0.0/0

aws ec2 describe-instances  \
        --output text \
        --query 'Reservations[*].Instances[*].InstanceId'\
        --filters Name=instance-state-name,Values=running | xargs aws ec2 terminate-instances --instance-ids

# Auto Scale nodejs app in EC2

Create a security group that'll be used by instances within auto scale group.  Allow port 22 for ssh access and port 9001 for nodejs app access.
```
$ aws ec2 create-security-group --group-name nodejsapp-autoscale-sg1 --description 'My AWS EC2 Security Group'
{
    "GroupId": "sg-0c4087493cc20cc89"
}
$ aws ec2 authorize-security-group-ingress --group-name nodejsapp-autoscale-sg1 --port 22 --protocol tcp --cidr 0.0.0.0/0
{
    "Return": true,
    "SecurityGroupRules": [
        {
            "SecurityGroupRuleId": "sgr-0c520aa550f1d95a4",
            "GroupId": "sg-0c4087493cc20cc89",
            "GroupOwnerId": "099999915043",
            "IsEgress": false,
            "IpProtocol": "tcp",
            "FromPort": 22,
            "ToPort": 22,
            "CidrIpv4": "0.0.0.0/0"
        }
    ]
}
$ aws ec2 authorize-security-group-ingress --group-name nodejsapp-autoscale-sg1 --port 9001 --protocol tcp --cidr 0.0.0.0/0
{
    "Return": true,
    "SecurityGroupRules": [
        {
            "SecurityGroupRuleId": "sgr-00e1ffa6d57d94975",
            "GroupId": "sg-0c4087493cc20cc89",
            "GroupOwnerId": "099999915043",
            "IsEgress": false,
            "IpProtocol": "tcp",
            "FromPort": 9001,
            "ToPort": 9001,
            "CidrIpv4": "0.0.0.0/0"
        }
    ]
}
```

# Cloudformation for nodejs app rehost with loadbalancer and autoscale
We had done exercises on:
1. Rehosting nodejs app to ec2 instance
2. Rehosting nodejs app to ec2 instance with cloudformation

In this exercise, we'll add load balancer and auto scaling for the rehosted nodejs application using cloudformation template.

# AWS Elastic Load Balancer (ELB)
Load balancers sit infront of applications to distribute traffic to multiple instances of the application.  That helps in application availability, scalability and performance.

Elastic Load Balancing (ELB) supports four types of load balancers.  The use case of each type is below.
1. Application Load Balancer (ALB) - For apps using HTTP, HTTPS, gRPC, WebSocket
2. Network Load Balancer (NLB) - For TCP/UDP level load balancing for extreme performance, low latency applications.
3. Classic Load Balancer (CLB) - This is for EC2 Classic network.  EC2 Classic is going to be retired in Aug 2022.  This is a legacy.  Old EC2 Classic network is to be migrated to VPC and CLB is to be migrated to ALB.
4. Gateway Load Balancer (GLB) - For third-party virtual appliances.

In this exercise, we'll use ALB for the sample HTTP based nodejs application.

## Public/Private connection to ALB
Your workloads may be a private workload accessible within your corporate network or a public workload reachable from internet.  Both are supported by ALB.

ALB can be privately accessed using something called VPC Endpoints.  We'll cover exercises on VPC endpoints after doing some exercises on networking, VPC, Subnet, etc.

ALB can be publicly accessed through internet gateway. 

# `AWS-PRICE` for ALB exercise

# Steps to create ALB 
The steps involved in this exercise are as below.
1. To see load
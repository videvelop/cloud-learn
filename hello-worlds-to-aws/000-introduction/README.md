# hello-worlds-to-aws - Introduction

This is a tutorial to learn AWS.  The learning approach is hands-on and sequential.  

Some exercises will require you to deploy hello world programs/scripts from the repository "hello-worlds" folder.

## Who can use this tutorial?
This tutorial is for experienced software developers and architects who already know how to develop, test and deploy web and non-web business applications on-prem environments.  

I found it very time consuming to follow voluminous instructions when I started learning AWS cloud services.  So, created these samples to learn the technicalities hands-on quickly!!! 

Once basics are understood, it is easier to understand deeper technicalities and you'll be able to evaluate the pros and cons of various cloud service options and deployment architectures.  

## What is covered? What is not covered?
This tutorial does NOT cover best practices.  The objective is to give you a foundational idea and hands-on experience on:
  
  - What is a cloud service?
  - how to create cloud services for a workload?
  - how to destroy the services of a workload ?


## Important things to note
  
  1. This tutorial is meant to be followed sequentially.
  2. CLI commands will be used extensively in this tutorial.  Unix scripting skill is necessary to continue.
  3. Monitor your free tier usage using https://console.aws.amazon.com/billing/home?region=us-east-1#/freetier . Note that region used by default is us-east-1 in this tutorial.  You may use any region of your choice, remember to replace the region appropriately. 
  4. Monitor your overall service usage and billing amounts uing https://console.aws.amazon.com/billing/home?region=us-east-1#/   
  5. Using AWS resources cost money.  Some of this tutorial exercises will cost money.  Before creating AWS services, make sure you understand how to delete it.  After issuing commands to delete, verify again whether the service is deleted.  Everyone who has started learning cloud services will tell a story of losing money because they left the services up and running inadvertently...  This tutorial covers steps for deleting services, however it is your responsibility to understand the price implications for you.
  6. The cost to run the tutorial is highlighted as `AWS-PRICE` under each section. The prices are indicative (might have changed since this tutorial is written..).  You need to verify again before running the services.
  7. If any of the abbreviations or terms are alien to you, refer AWS Glossary https://docs.aws.amazon.com/general/latest/gr/glos-chap.html
  8. If you have any feedbacks to improvise the content or to correct the errors, write to cloud-learn-feedback@everapptech.com.  You can also give pull requests.

# AWS Cloudformation 
AWS Systems Manager, helps to view operational data and automate operational tasks such as patch application across machines.

Thus, Systems Manager helps you maintain security and compliance by scanning your managed nodes and reporting on (or taking corrective action on) any policy violations it detects.

A managed node is any machine configured for Systems Manager. Systems Manager supports 
-  Amazon Elastic Compute Cloud (Amazon EC2) instances, - edge devices, 
- on-premise servers 
- on-premise virtual machines (VMs), including VMs in other cloud environments. 

For operating systems, Systems Manager supports 
- Windows Server, 
- macOS, 
- Raspberry Pi OS (formerly Raspbian), and 
- multiple distributions of Linux.

With Systems Manager, you can associate AWS resources by assigning resource tags. You can then view operational data for these resources as a resource group. Resource groups help you monitor and troubleshoot your resources.

For example, you can assign a resource tag of "CHWPATCH=CHW_UPTO_DATE_PATCH" to the following resources:
    - A group of AWS IoT Greengrass core devices

    - A group of Amazon EC2 instances

    - A group of on-premises servers in your own facility

A Systems Manager patch baseline that specifies which patches to apply to your managed instances.

An Amazon Simple Storage Service (Amazon S3) bucket to store patching operation log output.

A Systems Manager maintenance window that specifies the schedule for the patching operation.

After tagging your resources, you can view the patch status of those resources in a Systems Manager consolidated dashboard. If a problem arises with any of the resources, you can take corrective action immediately. 

Systems Manager is comprised of individual capabilities, which are grouped into five categories: 
- Operations Management, 
- Application Management, 
- Change Management, 
- Node Management, and 
- Shared Resources.

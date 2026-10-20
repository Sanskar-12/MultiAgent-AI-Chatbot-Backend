Step 1 : Generate images of all the services with the help of Dockerfile
code - docker build -f ./services/agent/Dockerfile -t agent-service .

Step 2 : Upload the generated images into AWS ECR (Elastic Container Registry)
In this step you have to download AWS CLI to authenticate with AWS via CLI

Step 3 : Create VPC (Virtual Private Cloud)
VPC is a private network in which we can create EC2 instance, databases and servers without exposing to the outside internet

Step 4 : Inside VPC the subnets are also created

Step 5 : Create Inbound rules Security group for Load balancer, ECS, Redis

Step 6 : Create Load balancer (ALB) and assign the security group of load balancer

Step 7 : While Creating ALB you have to create Target group also

Step 8 : Create ElastiCache for redis config and assign it to the Redis Security group

Step 9 : Now time to create ECS
So Create Task and assign it the image of service from ECR and security group and upload all the ENVs
and for generating logs, Enable CloudWatch

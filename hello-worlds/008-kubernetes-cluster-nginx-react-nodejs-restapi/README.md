# ReactJS frontend and Nodejs microservice backend in kubernetes using multipass

The objective of this sample is to run nodejs micro service and react front end in kubernetes cluster.

This is not a tutorial on nodejs, reactjs or kubernetes.  The commands that are used to run this small hello world are given just for your reference.

I use:
- ubuntu 20.04 
- npm --version #8.1.4
- node --version #v14.18.1

The below commands may be different for your OS and other installations.

# Run the nodejs microservice and react frontend locally

## Run nodejs microservice
Start the nodejs micro service.
```
$ cd nodejs-microservice
$ npm i
$ npm run start
```
Call the micro service as http://localhost:9001/

If you get to see some hello world text, good to progress.

## Run react frontend
```
$ cd react-fe/src/

$ # NODE_MS_API must be set to let react front end know the end point of nodejs microservice

$ export NODE_MS_API=http://localhost:9001/
$ npm i
$ npm run start
```
Call the react front end as http://localhost:9000/

If you get to see some hello world text and alos the response from nodejs microservice api, all good so far.

# Install multipass in host machine
Multipass is an awesomely simple, easy to use virtual machine tool for development purposes.  

```
$ sudo apt update -y
$ sudo snap install multipass
```

# Kubernets cluster - prepare nodes
We'll create three multipass vm.  One for kubernetes control plane master and two for worker nodes.

## create 3 multipass virtual machines
```
$ multipass launch --name k8s-m --cpus 2 --mem 2048M --disk 10G
$ multipass launch --name k8s-w1 --cpus 2 --mem 2048M --disk 5G
$ multipass launch --name k8s-w2 --cpus 2 --mem 2048M --disk 5G
```
k8s-m will be the control-plane master in the kubernetes cluster.

## Setup kubernetes

hello-worlds/008-kubernetes-cluster-nginx-react-nodejs-restapi-postgres/kubernetes-conf-setup/setup-docker-k8s.sh is a script you can run to automate docker, k8s installation.  It contains the below steps.

### Install docker

docker installation ref: https://docs.docker.com/engine/install/ubuntu/

```
$ # login to the control plane master
$ multipass shell k8s-m

ubuntu@k8s-m:~$ sudo apt update -y

ubuntu@k8s-m:~$ sudo apt-get install  -y ca-certificates  curl gnupg lsb-release apt-transport-https ca-certificates curl 


ubuntu@k8s-m:~$ curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

ubuntu@k8s-m:~$ echo  "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null


ubuntu@k8s-m:~$ sudo apt-get update -y


ubuntu@k8s-m:~$ sudo apt-get install -y docker-ce docker-ce-cli containerd.io

$ ## ensure the following is set to avoid kubeadm throwing errors 

ubuntu@k8s-m:~$ echo "{\"exec-opts\":[\"native.cgroupdriver=systemd\"]}" | sudo tee /etc/docker/daemon.json


ubuntu@k8s-m:~$ sudo systemctl restart docker

$ ## below step adds current user to docker group so that you don't need to do sudo to run docker commands
ubuntu@k8s-m:~$ sudo usermod -aG docker $USER

```

### Install kubelet, kubeadm, kubectl

```

ubuntu@k8s-m:~$  sudo curl -fsSLo /usr/share/keyrings/kubernetes-archive-keyring.gpg https://packages.cloud.google.com/apt/doc/apt-key.gpg 

ubuntu@k8s-m:~$ echo "deb [signed-by=/usr/share/keyrings/kubernetes-archive-keyring.gpg] https://apt.kubernetes.io/ kubernetes-xenial main" | sudo tee /etc/apt/sources.list.d/kubernetes.list 
deb [signed-by=/usr/share/keyrings/kubernetes-archive-keyring.gpg] https://apt.kubernetes.io/ kubernetes-xenial main


ubuntu@k8s-m:~$ sudo apt-get update  -y

ubuntu@k8s-m:~$ sudo apt-get install -y kubelet kubeadm kubectl 

```

### kubeadm init - intialize the cluster

#### kubernetes control-plane setup in master
```
$ ## pull the images required for setting up control-plane
ubuntu@k8s-m:~$ kubeadm config images pull

ubuntu@k8s-m:~$ sudo kubeadm init 

$ ## install add on for pod network.  Our choice here is weave
ubuntu@k8s-m:~$ kubectl apply -f "https://cloud.weave.works/k8s/net?k8s-version=$(kubectl version | base64 | tr -d '\n')"
```
notedown the kubeadm output to join the worker nodes.
```
sudo kubeadm join 10.67.189.225:6443 --token ndnbbt.9wa3xsdll043bshf --discovery-token-ca-cert-hash sha256:0fbf0989ff1a29c9a25963eaf412e0ec93dab5a2cb37970937cb989f82feb8c0

```

#### kubernetes worker node setup
Similar to master node, setup docker and kubectl, kubeadm, kubelet installation.

Instead of "kubeadm init", on a worker node, you need to run "kubeadm join".  NOTE: the "kubeadm join" given here will not work for you.  You need to run with the parameters as given while running your "kubeadm init".

hello-worlds/008-kubernetes-cluster-nginx-react-nodejs-restapi-postgres/kubernetes-conf-setup/setup-docker-k8s.sh is a script you can run to automate docker, k8s installation.
```
$ # install docker
$ # install kubectl kubelet
$ # join the kubernetes cluster
ubuntu@k8s-w1:~$ sudo kubeadm join 10.67.189.225:6443 --token ndnbbt.9wa3xsdll043bshf --discovery-token-ca-cert-hash sha256:0fbf0989ff1a29c9a25963eaf412e0ec93dab5a2cb37970937cb989f82feb8c0
```

Check the node status in control-plane node.  If the role is missing, assign it.  If the status is something like "NotReady,SchedulingDisabled",  those need to be fixed as well so that pods can be created in worker nodes. 
```
ubuntu@k8s-m:~$ kubectl get nodes -o wide
ubuntu@k8s-m:~$ kubectl uncordon k8s-w2 # to change from unscheduled to scheduled state so that pods can be deployed in worker
ubuntu@k8s-m:~$ kubectl label node k8s-w2 node-role.kubernetes.io/worker=worker

```

## Run nodejs microservice under the kubernetes cluster created

### Prepare nodejs microservice docker image
In the host machine, where the nodejs app source exist, build the docker image.  You need to have account setup in https://hub.docker.com to push and pull images using that.

```
$ docker build . -t nodejs-ms1:v1
$ docker image ls
REPOSITORY   TAG              IMAGE ID       CREATED         SIZE
nodejs-ms1   v1               2e8b698d463c   2 minutes ago   111MB
```
Tag your image for pushing to public docker hub repository and push it.  Kubernetes cluster will pull the image from public repo.  

```
$ docker image tag nodejs-ms1:v1 vlinet2002/nodejs-ms1:v1
$ docker login
$ docker push vlinet2002/nodejs-ms1:v1
```

Check whether image is successfully pushed to docker hub by logging into https://hub.docker.com .  Also, run the image locally pulling from docker hub and check whether you can hit the nodejs microservice end point.
```
$ docker run -p 9001:9001 vlinet2002/nodejs-ms1:v1
```

### Create kubernetes deployment and service

Before creating the yaml files for pod and services, get to know the api versions of your installation using the below command.
```
ubuntu@k8s-m:~$ kubectl api-resources 
```

Update the api version in the yaml file and apply it to create kubernetes resources.
```
ubuntu@k8s-m:~$ kubectl apply -f cloud-learn/hello-worlds/008-kubernetes-cluster-nginx-react-nodejs-restapi-postgres/kubernetes-conf-setup/k8s-deployment-nodejs-ms.yaml

ubuntu@k8s-m:~$ kubectl get all
NAME                         TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)          AGE
service/kubernetes           ClusterIP   10.96.0.1        <none>        443/TCP          16h
service/nodejs-ms1-service   NodePort    10.106.170.108   <none>        9001:30630/TCP   10m

ubuntu@k8s-m:~$ curl http://10.106.170.108:9001/healthcheck
```

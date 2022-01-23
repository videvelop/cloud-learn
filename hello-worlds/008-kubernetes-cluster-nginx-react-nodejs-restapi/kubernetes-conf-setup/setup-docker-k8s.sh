set -x
# install basic utils, docker and kubectl, kubelet, kubeadm

sudo apt-get update -y
sudo apt-get install -y  ca-certificates  curl gnupg lsb-release apt-transport-https ca-certificates curl

curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg


echo  "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update -y
sudo apt-get install -y docker-ce docker-ce-cli containerd.io

echo "{\"exec-opts\":[\"native.cgroupdriver=systemd\"]}" | sudo tee /etc/docker/daemon.json

sudo systemctl restart docker

sudo usermod -aG docker $USER

sudo apt-get update -y
sudo curl -fsSLo /usr/share/keyrings/kubernetes-archive-keyring.gpg https://packages.cloud.google.com/apt/doc/apt-key.gpg

echo "deb [signed-by=/usr/share/keyrings/kubernetes-archive-keyring.gpg] https://apt.kubernetes.io/ kubernetes-xenial main" | sudo tee /etc/apt/sources.list.d/kubernetes.list
sudo apt-get update -y

sudo apt-get install -y kubelet kubeadm kubectl

##sudo kubeadm init 
##sudo kubeadm join 10.67.189.225:6443 --token ndnbbt.9wa3xsdll043bshf --discovery-token-ca-cert-hash sha256:0fbf0989ff1a29c9a25963eaf412e0ec93dab5a2cb37970937cb989f82feb8c0

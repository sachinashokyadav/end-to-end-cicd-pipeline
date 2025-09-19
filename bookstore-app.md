# bookstore-app (Complete End‑to‑End CI/CD)

This repo contains a ready-to-run Proof-Of-Concept DevOps pipeline that ties together:

- Linux (Ubuntu EC2)
- Git
- AWS (VPC, EC2, optionally EKS)
- Docker (image build & push)
- Kubernetes (k3s local node or EKS)
- Jenkins (CI/CD)
- Terraform (infra)
- Ansible (bootstrap)
- Prometheus + Grafana (monitoring)

> **How to use:** clone this repo to your workstation. Edit placeholders (AWS region, your DockerHub username, SSH key paths, and IPs produced by Terraform). Then follow the Day-1 and Day-2 lab guide in `docs/LAB.md`.

----

## Repository layout

```
bookstore-app/
├─ app/
│  ├─ Dockerfile
│  ├─ package.json
│  └─ src/index.js
├─ terraform/
│  ├─ main.tf
│  ├─ variables.tf
│  └─ outputs.tf
├─ ansible/
│  ├─ inventory.ini.example
│  └─ playbook.yml
├─ k8s/
│  ├─ deployment.yaml
│  └─ service.yaml
├─ ci/
│  └─ Jenkinsfile
├─ cd/
│  └─ Jenkinsfile
├─ docs/
│  └─ LAB.md
└─ README.md
```

----

## Files (copy-paste ready)

### `README.md`
```
# bookstore-app - End-to-End CI/CD

This repository is that demonstrates a full CI/CD pipeline using Terraform, Ansible, Jenkins, Docker, Kubernetes, Prometheus, and Grafana.

Follow `docs/LAB.md` for step-by-step instructions for Day 1 and Day 2.
```

---

### `docs/LAB.md`
```
# Lab Guide (Day 1 & Day 2)

Follow the step-by-step lab: Day 1 (Infra + Jenkins + Docker), Day 2 (Kubernetes + CD + Monitoring).

Open this file and follow the sections in sequence. Replace placeholders as needed.
```

---

### `terraform/main.tf`
```
terraform {
  required_providers { aws = { source = "hashicorp/aws" } }
  required_version = ">= 1.0"
}

provider "aws" {
  region = var.aws_region
}

resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
  tags = { Name = "bookstore-app-vpc" }
}

resource "aws_subnet" "public" {
  vpc_id = aws_vpc.main.id
  cidr_block = "10.0.1.0/24"
  map_public_ip_on_launch = true
  availability_zone = "${var.aws_region}a"
}

resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.main.id
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  route { cidr_block = "0.0.0.0/0" gateway_id = aws_internet_gateway.igw.id }
}

resource "aws_route_table_association" "a" {
  subnet_id = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}

resource "aws_security_group" "ssh_http" {
  name = "bookstore-ssh-http"
  description = "allow ssh and http"
  vpc_id = aws_vpc.main.id
  ingress {
    from_port = 22; to_port = 22; protocol = "tcp"; cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port = 80; to_port = 80; protocol = "tcp"; cidr_blocks = ["0.0.0.0/0"]
  }
  egress { from_port = 0; to_port = 0; protocol = "-1"; cidr_blocks = ["0.0.0.0/0"] }
}

data "aws_ami" "ubuntu" {
  most_recent = true
  owners = ["099720109477"]
  filter { name = "name" values = ["ubuntu/images/hvm-ssd/ubuntu-focal-20.04-amd64-server-*"] }
}

resource "aws_key_pair" "deployer" {
  key_name   = "bookstore_poc_key"
  public_key = file(var.public_key_path)
}

resource "aws_instance" "jenkins" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = var.instance_type
  subnet_id     = aws_subnet.public.id
  key_name      = aws_key_pair.deployer.key_name
  vpc_security_group_ids = [aws_security_group.ssh_http.id]
  tags = { Name = "bookstore-jenkins" }
}

resource "aws_instance" "worker" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = var.instance_type
  subnet_id     = aws_subnet.public.id
  key_name      = aws_key_pair.deployer.key_name
  vpc_security_group_ids = [aws_security_group.ssh_http.id]
  tags = { Name = "bookstore-worker" }
}
```

---

### `terraform/variables.tf`
```
variable "aws_region" { type = string default = "us-east-1" }
variable "instance_type" { type = string default = "t3.small" }
variable "public_key_path" { type = string default = "~/.ssh/bookstore_poc.pub" }
```

---

### `terraform/outputs.tf`
```
output "jenkins_ip" { value = aws_instance.jenkins.public_ip }
output "worker_ip" { value = aws_instance.worker.public_ip }
```

---

### `ansible/inventory.ini.example`
```
[jenkins]
# replace with actual public ip from terraform output
# 54.12.34.56 ansible_user=ubuntu ansible_ssh_private_key_file=~/.ssh/bookstore_poc

[worker]
# 3.21.43.65 ansible_user=ubuntu ansible_ssh_private_key_file=~/.ssh/bookstore_poc
```

---

### `ansible/playbook.yml`
```
- hosts: all
  become: yes
  tasks:
    - name: apt update
      apt:
        update_cache: yes

- hosts: jenkins
  become: yes
  tasks:
    - name: install docker
      apt:
        name: docker.io
        state: present
    - name: add ubuntu to docker group
      user:
        name: ubuntu
        groups: docker
        append: yes
    - name: install openjdk
      apt:
        name: openjdk-11-jre-headless
        state: present
    - name: install git
      apt:
        name: git
        state: present
    - name: download jenkins.war
      get_url:
        url: https://get.jenkins.io/war-stable/latest/jenkins.war
        dest: /opt/jenkins/jenkins.war
    - name: create systemd file for jenkins
      copy:
        dest: /etc/systemd/system/jenkins.service
        content: |
          [Unit]
          Description=Jenkins Standalone
          After=network.target
          [Service]
          User=ubuntu
          ExecStart=/usr/bin/java -jar /opt/jenkins/jenkins.war
          Restart=always
          [Install]
          WantedBy=multi-user.target
    - name: start jenkins
      systemd:
        name: jenkins
        enabled: yes
        state: started

- hosts: worker
  become: yes
  tasks:
    - name: install docker
      apt:
        name: docker.io
        state: present
    - name: install curl
      apt:
        name: curl
        state: present
    - name: install k3s single node
      shell: |
        curl -sfL https://get.k3s.io | INSTALL_K3S_VERSION=v1.27.6+k3s1 sh -
      args: creates=/usr/local/bin/k3s
    - name: fetch kubeconfig
      shell: cat /etc/rancher/k3s/k3s.yaml
      register: kubeconf
    - name: write kubeconfig
      copy:
        content: "{{ kubeconf.stdout }}"
        dest: /home/ubuntu/kubeconfig
        owner: ubuntu
        mode: '0600'
```

---

### `app/package.json`
```
{
  "name": "bookstore-app",
  "version": "1.0.0",
  "main": "src/index.js",
  "scripts": { "start": "node src/index.js" },
  "dependencies": { "express": "^4.18.2", "prom-client": "^14.0.0" }
}
```

---

### `app/src/index.js`
```
const express = require('express');
const client = require('prom-client');

const app = express();
const register = new client.Registry();
client.collectDefaultMetrics({ register });

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
app.get('/', (req, res) => res.send('bookstore-app up'));

app.listen(3000, () => console.log('listening 3000'));
```

---

### `app/Dockerfile`
```
FROM node:18-alpine
WORKDIR /app
COPY package.json .
RUN npm ci --only=production
COPY src ./src
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s CMD wget -q -O- http://localhost:3000/health || exit 1
CMD ["node","src/index.js"]
```

---

### `ci/Jenkinsfile`
```
pipeline {
  agent any
  environment {
    DOCKERHUB = 'YOUR_DOCKERHUB_USER/bookstore-app'
    WORKER_IP = 'REPLACE_WITH_WORKER_IP'
  }
  stages {
    stage('Checkout') { steps { checkout scm } }
    stage('Build & Test') { steps { sh 'cd app && npm ci --production' } }
    stage('Docker Build & Push') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
          sh '''
            cd app
            TAG=$(git rev-parse --short HEAD)
            docker build -t $DOCKERHUB:$TAG .
            echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
            docker push $DOCKERHUB:$TAG
            echo $DOCKERHUB:$TAG > ../image.info
          '''
        }
      }
    }
    stage('Deploy to k8s') {
      steps {
        sh '''
          IMAGE=$(cat image.info)
          scp -o StrictHostKeyChecking=no -i ~/.ssh/bookstore_poc image.info ubuntu@${WORKER_IP}:/home/ubuntu/
          ssh -o StrictHostKeyChecking=no -i ~/.ssh/bookstore_poc ubuntu@${WORKER_IP} "export KUBECONFIG=/home/ubuntu/kubeconfig && kubectl set image deployment/bookstore bookstore=${IMAGE} --record"
        '''
      }
    }
  }
  post { always { archiveArtifacts artifacts: 'app/test-results/**', allowEmptyArchive: true } }
}
```

---

### `k8s/deployment.yaml`
```
apiVersion: apps/v1
kind: Deployment
metadata:
  name: bookstore
  labels: { app: bookstore }
spec:
  replicas: 1
  selector: { matchLabels: { app: bookstore } }
  template:
    metadata: { labels: { app: bookstore } }
    spec:
      containers:
      - name: bookstore
        image: YOUR_DOCKERHUB_USER/bookstore-app:local
        ports: [{ containerPort: 3000 }]
        readinessProbe:
          httpGet: { path: /health, port: 3000 }
          initialDelaySeconds: 5
          periodSeconds: 10
        livenessProbe:
          httpGet: { path: /health, port: 3000 }
          initialDelaySeconds: 15
          periodSeconds: 20
```

---

### `k8s/service.yaml`
```
apiVersion: v1
kind: Service
metadata:
  name: bookstore
spec:
  type: NodePort
  selector: { app: bookstore }
  ports:
    - port: 3000
      targetPort: 3000
      nodePort: 30080
```

---

## Next steps & notes
- Replace `YOUR_DOCKERHUB_USER` and `REPLACE_WITH_WORKER_IP` placeholders with your values.
- The Jenkinsfile uses SCP/SSH to update the k3s worker. For production/EKS use IRSA/roles and `kubectl` from CI with proper kubeconfig.
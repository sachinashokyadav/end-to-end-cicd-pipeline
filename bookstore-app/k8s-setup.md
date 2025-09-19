# Kubernetes Cluster Setup Guide

## Current Configuration Analysis
- **Cluster**: K3s single-node (lightweight Kubernetes)
- **Deployment**: 1 replica, health checks enabled
- **Service**: NodePort (30080) for external access
- **Image**: DockerHub registry integration

## Setup Requirements

### 1. Infrastructure (Already Automated)
```bash
# Terraform provisions AWS EC2 worker node
# Ansible installs K3s automatically
```

### 2. Manual Configuration Steps

#### A. Update Image Reference
```bash
# Edit k8s/deployment.yaml
sed -i 's/YOUR_DOCKERHUB_USER/your-actual-username/g' k8s/deployment.yaml
```

#### B. Deploy to Cluster
```bash
# SSH to worker node
ssh -i ~/.ssh/bookstore_poc ubuntu@WORKER_IP

# Apply manifests
export KUBECONFIG=/home/ubuntu/kubeconfig
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
```

#### C. Verify Deployment
```bash
kubectl get pods
kubectl get svc
kubectl rollout status deployment/bookstore
```

## Access Points
- **Internal**: `http://bookstore:3000`
- **External**: `http://WORKER_IP:30080`
- **Health**: `http://WORKER_IP:30080/health`

## Cluster Features
- ✅ **K3s**: Lightweight, production-ready
- ✅ **Health Checks**: Readiness + Liveness probes
- ✅ **NodePort**: Direct external access
- ✅ **Auto-restart**: Kubernetes manages pod lifecycle
- ✅ **Rolling Updates**: Zero-downtime deployments

## Scaling (Optional)
```bash
# Scale replicas
kubectl scale deployment bookstore --replicas=3

# Load balancer (replace NodePort)
kubectl patch svc bookstore -p '{"spec":{"type":"LoadBalancer"}}'
```
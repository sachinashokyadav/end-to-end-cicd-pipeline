# DevOps Product Store - Complete CI/CD Pipeline

End-to-end CI/CD pipeline with Terraform, Ansible, Jenkins, Docker, and Kubernetes.

## Quick Setup
1. `cd terraform && terraform apply`
2. Update `ansible/inventory.ini` with IPs from terraform output
3. `ansible-playbook -i ansible/inventory.ini ansible/playbook.yml`
4. Configure Jenkins with DockerHub credentials
5. Update Jenkinsfile with your DockerHub username and worker IP
6. Deploy: `kubectl apply -f k8s/`

## Architecture
- **Infrastructure**: AWS VPC, EC2 (Terraform)
- **CI/CD**: Jenkins pipeline
- **Container**: Docker + DockerHub
- **Orchestration**: K3s Kubernetes
- **App**: Node.js DevOps product store

Access: Jenkins (port 8080), App (port 30080)
#!/bin/bash
# K8s Initial Deployment Script

set -e

echo "🚀 Initializing Kubernetes deployment..."

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl not found. Ensure K3s is installed."
    exit 1
fi

# Set kubeconfig
export KUBECONFIG=/home/ubuntu/kubeconfig

# Apply manifests
echo "📦 Applying Kubernetes manifests..."
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml

# Wait for deployment
echo "⏳ Waiting for deployment to be ready..."
kubectl rollout status deployment/bookstore --timeout=300s

# Show status
echo "✅ Deployment complete!"
echo "📊 Cluster status:"
kubectl get pods,svc -l app=bookstore

# Get access info
NODE_IP=$(kubectl get nodes -o jsonpath='{.items[0].status.addresses[?(@.type=="ExternalIP")].address}')
if [ -z "$NODE_IP" ]; then
    NODE_IP=$(kubectl get nodes -o jsonpath='{.items[0].status.addresses[?(@.type=="InternalIP")].address}')
fi

echo "🌐 Access your app at: http://$NODE_IP:30080"
echo "❤️  Health check: http://$NODE_IP:30080/health"
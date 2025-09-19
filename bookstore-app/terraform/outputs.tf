output "jenkins_ip" { value = aws_instance.jenkins.public_ip }
output "worker_ip" { value = aws_instance.worker.public_ip }
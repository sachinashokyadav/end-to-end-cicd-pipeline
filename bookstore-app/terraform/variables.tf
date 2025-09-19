variable "aws_region" {
  type    = string
  default = "ap-south-1"
}

variable "instance_type" {
  type    = string
  default = "t3.small"
}

variable "public_key_path" {
  type    = string
  default = "~/Downloads/ci-cd-end-to-end.pem"
}
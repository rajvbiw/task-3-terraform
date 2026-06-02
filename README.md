# TicTacToe CI/CD + Terraform DevOps Project

## 📌 Project Overview

This project is a TicTacToe web application that demonstrates:

* Docker containerization for the application
* Terraform automation for Docker image and container management

The project includes a Terraform configuration in `terraform-docker/` and screenshots of Terraform command results in `screenshot/`.

---

## 🚀 Technologies Used

* Docker
* Terraform
* DockerHub
* Node.js

---

## 📂 Project Structure

```bash
tictactoe/
│
├── public/
├── server.js
├── Dockerfile
├── package.json
├── README.md
├── terraform-docker/
│   └── main.tf
└── screenshot/
    ├── terraform init.png
    ├── terraform plan.png
    ├── Terraform Apply.png
    ├── terraform state list.png
    ├── Terraform Destory.png
    ├── docker ps.png
    ├── Docker run.png
    └── Docker image.png
```

---

## 🔧 Terraform Setup

The Terraform configuration is located in `terraform-docker/main.tf` and uses the Docker provider to create a Docker image and container.

### Terraform Commands

```bash
cd terraform-docker
terraform init
terraform plan
terraform apply
terraform state list
terraform destroy
```

### What these commands do

* `terraform init` - initializes Terraform and downloads required providers
* `terraform plan` - creates an execution plan for Docker resource changes
* `terraform apply` - deploys the Docker image and container defined in Terraform
* `terraform state list` - shows Terraform-managed resources
* `terraform destroy` - removes the created Docker resources

---

## 🐳 Docker Setup

### Build Docker Image manually

```bash
docker build -t tictactoe-app .
```

### Run Docker Container manually

```bash
docker run -p 3000:3000 tictactoe-app
```

### View running containers

```bash
docker ps
```

### List Docker images

```bash
docker image ls
```

### Open Application

```bash
http://localhost:3000
```

---

##  Screenshots for Terraform Commands

Screenshot files are available in `screenshot/` for the following steps:

* `terraform init`
* `terraform plan`
* `terraform apply`
* `docker ps`
* `Docker run`
* `Docker image`
* `terraform state list`
* `terraform destroy`

---

## 📖 Useful Documentation

* Docker: https://docs.docker.com/
* Terraform: https://www.terraform.io/docs
* Node.js: https://nodejs.org/en/docs

---

## 🎯 What I Learned

* Containerizing a web application using Docker
* Managing infrastructure with Terraform and the Docker provider
* Running a Terraform workflow: init, plan, apply, state list, destroy

---

## ✅ Project Outcome

Successfully implemented a DevOps workflow for a TicTacToe app with:

* Docker containerization
* Terraform-managed Docker resources

---

## 👨‍💻 Author

Raj Birari

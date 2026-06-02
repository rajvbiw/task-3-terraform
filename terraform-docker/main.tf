terraform {
  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0.1"
    }
  }
}

provider "docker" {}

resource "docker_image" "myapp" {
  name = "myapp:latest"
}

resource "docker_container" "mycontainer" {
  name  = "terraform-container"
  image = docker_image.myapp.image_id

  ports {
    internal = 3000
    external = 3000
  }
}
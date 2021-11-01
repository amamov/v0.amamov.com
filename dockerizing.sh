#!/bin/sh

echo "Docker Image Version : " $1

docker build -t "amamov/amamov":$1 .
docker push "amamov/amamov":$1
docker rmi "amamov/amamov":$1


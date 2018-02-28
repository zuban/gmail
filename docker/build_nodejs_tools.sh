#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
IMGNAME=gmail_nodejs_tools

cd $IMGNAME

docker rmi $IMGNAME

docker build -t $IMGNAME .



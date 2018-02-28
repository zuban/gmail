#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
IMGNAME=gmail_nginx

#cd $DIR/../docker/$IMGNAME
cd $DIR/$IMGNAME
#cd $HOME/docker_script/uat/compose/$IMGNAME

docker rmi $IMGNAME

docker build -t $IMGNAME .



#!/bin/sh

docker run -it --rm \
    -v /root/gmail:/app \
	slink_nodejs_tools \
	$@


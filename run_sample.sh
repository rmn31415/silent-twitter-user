#!/bin/sh

TWITTER_CONSUMER_KEY=""
TWITTER_CONSUMER_SECRET=""
TWITTER_ACCESS_TOKEN_KEY=""
TWITTER_ACCESS_TOKEN_SECRET=""

NODE_HOST="teatime.rmn-web.net"
NODE_PORT="3000"

export TWITTER_CONSUMER_KEY
export TWITTER_CONSUMER_SECRET
export TWITTER_ACCESS_TOKEN_KEY
export TWITTER_ACCESS_TOKEN_SECRET
export NODE_HOST
export NODE_PORT

node main.js

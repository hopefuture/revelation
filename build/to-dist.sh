#!/usr/bin/env bash

echo 'script:\\cp -R ./client/images ./dist/images/ & \\cp -R ./client/css/lib ./dist/css/lib/'
\cp -R ./client/images ./dist/images/ & \cp -R -P ./client/css/lib ./dist/css/lib

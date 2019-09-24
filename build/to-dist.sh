#!/usr/bin/env bash

echo 'script:\\cp -R -P ./client/images ./dist/images & \\cp -R -P ./client/css/lib ./dist/css/lib & \\cp -R -P ./client/data ./dist/data & \\cp -R -P ./client/scripts/news ./dist/scripts/news'
\cp -R ./client/images ./dist/images & \cp -R -P ./client/css/lib ./dist/css/lib & \cp -R -P ./client/data ./dist/data & \cp -R -P ./client/scripts/news ./dist/scripts/news

echo '清理 ./dist/scripts/news 目录下无用的文件， script: \\rm -rf ./dist/scripts/news/index.js dist/scripts/news/scroll-top.js'
\rm -rf ./dist/scripts/news/index.js dist/scripts/news/scroll-top.js

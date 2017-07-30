#!/bin/sh

zipfile="api-album"

extension=".zip"

functionName="api-album"

s3url="https://s3-eu-west-1.amazonaws.com/zm-lambda-zip-bucket/"

if [ -z "$1" ]
  then
    echo "Uploading in uncommit mode"
  else

    if [ "$#" -ne 1 ]
      then
        echo "Please wrap your description in quotes: \"...\""
        exit 1
    fi

    git add -A
    git commit -m "$1"
fi

zip -q -r $zipfile$extension \
node_modules/* \
package.json \
index.js

aws s3 cp $zipfile$extension s3://zm-lambda-zip-bucket/$zipfile$extension

#echo $s3url$zipfile$extension | pbcopy
#echo "Copied S3 path to clipboard!"

aws lambda update-function-code --function-name $functionName --s3-bucket zm-lambda-zip-bucket --s3-key $zipfile$extension

#aws s3 rm s3://zm-lambda-zip-bucket/$zipfile$extension

#!/usr/bin/env bash

set -o errexit

pip install -r requirements.txt

py manage.py collectstatic --no-input
py manage.py migrate
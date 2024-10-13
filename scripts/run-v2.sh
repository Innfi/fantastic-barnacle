#!/bin/sh
docker compose -f compose/basic-backend.yaml -f compose/workload-handler.yaml up --build 

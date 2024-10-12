#!/bin/sh
docker compose --build -f compose/basic-backend.yaml -f compose/workload-handler.yaml up

#!/bin/sh
kubectl apply -f https://raw.githubusercontent.com/cyclops-ui/cyclops/v0.17.1/install/cyclops-install.yaml && kubectl apply -f https://raw.githubusercontent.com/cyclops-ui/cyclops/v0.17.1/install/demo-templates.yaml

#!/bin/sh
helm install cilium oci://quay.io/cilium/charts/cilium \
  --version 1.19.2 \
  --namespace kube-system
  --set kubeProxyReplacement=true
  --set k8sServiceHost=127.0.0.1
  --set k8sServicePort=6443

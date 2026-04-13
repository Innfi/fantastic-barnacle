#!/bin/sh
helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts
helm repo update

helm install my-otel-collector open-telemetry/opentelemetry-collector \
  --set mode=daemonset

#!/bin/sh
PASSWORD=$(kubectl get secret barnacle-es-elastic-user -o go-template='{{.data.elastic}}')
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Secret
metadata:
  name: barnacle-es-elastic-user
  namespace: barnacle
data:
  elastic: $PASSWORD
type: Opaque
EOF
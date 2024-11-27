#!/bin/sh
PASSWORD=$(kubectl -n elasticsearch get secret elasticsearch-es-elastic-user -o go-template='{{.data.elastic}}')
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
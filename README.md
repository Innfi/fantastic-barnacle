[![basic-backend action](https://github.com/Innfi/fantastic-barnacle/actions/workflows/action.basic-backend.yaml/badge.svg)](https://github.com/Innfi/fantastic-barnacle/actions/workflows/action.basic-backend.yaml)
[![workload-handler action](https://github.com/Innfi/fantastic-barnacle/actions/workflows/action.workload-handler.yaml/badge.svg)](https://github.com/Innfi/fantastic-barnacle/actions/workflows/action.workload-handler.yaml)

## fantastic-barnacle

simple services for deployment exercises: implementing a coupon managing service
 (generate, issue, expire, etc)

# TODO
## replace bullmq with kafka 
## replace workload-handler nest project to golang based kafka client
## performance check

## watch and fix the service components as request rates scaling up 

## look up possible alternatives of tool in terms of key elements:
  - consistency
  - availability
  - observability

# DONE
define top level behavior:
  - generate coupons
  - issue a coupon
define actors to handle request:
  - basic-backend: serve http request / forward each message as event
  - workload-handler: receive and handle event
set up the vehicles:
  - nestjs for backend services
  - bullmq and redis for message queue
  - mysql for relational data
infrastructure
  - docker compose
  - elasticsearch / kibana metricbeat for logging

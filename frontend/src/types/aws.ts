export type ResourceType = 'vpc' | 'subnet' | 'internet_gateway' | 'ec2' | 'alb' | 'rds' | 'security_group'

export interface AwsResource {
  id: string
  type: ResourceType
  name: string
  region: string
  // basis = networking layer (vpc, subnet, igw, sg)
  // compute = top layer (ec2, alb, rds)
  layer: 'basis' | 'compute'
  parentId?: string  // e.g. subnet id for ec2
  metadata: Record<string, string>
}

export interface AwsTopology {
  resources: AwsResource[]
  region: string
  fetchedAt: string
}

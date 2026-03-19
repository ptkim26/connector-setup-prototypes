// Shared data model across all directions

export const CONNECTORS = {
  aws: {
    id: 'aws', name: 'Amazon Web Services', shortName: 'AWS', authType: 'cloudformation',
    categories: [
      { id: 'identity-access', name: 'Identity & Access', description: 'IAM users, roles, policies, MFA status, access keys',
        objects: [{ id: 'iam-users', name: 'IAM Users', fields: 23 }, { id: 'iam-roles', name: 'IAM Roles', fields: 15 }, { id: 'iam-policies', name: 'IAM Policies', fields: 12 }, { id: 'mfa-devices', name: 'MFA Devices', fields: 8 }] },
      { id: 'storage-databases', name: 'Storage & Databases', description: 'S3 buckets, RDS instances, DynamoDB tables, encryption',
        objects: [{ id: 's3-buckets', name: 'S3 Buckets', fields: 18 }, { id: 'rds-instances', name: 'RDS Instances', fields: 24 }, { id: 'dynamodb-tables', name: 'DynamoDB Tables', fields: 14 }] },
      { id: 'logging-monitoring', name: 'Logging & Monitoring', description: 'CloudTrail logs, CloudWatch metrics, GuardDuty findings',
        objects: [{ id: 'cloudtrail', name: 'CloudTrail Trails', fields: 11 }, { id: 'cloudwatch', name: 'CloudWatch Alarms', fields: 9 }, { id: 'guardduty', name: 'GuardDuty Findings', fields: 16 }] },
      { id: 'compute', name: 'Compute', description: 'EC2 instances, Lambda functions, EKS clusters',
        objects: [{ id: 'ec2', name: 'EC2 Instances', fields: 31 }, { id: 'lambda', name: 'Lambda Functions', fields: 14 }, { id: 'eks', name: 'EKS Clusters', fields: 19 }] },
      { id: 'networking', name: 'Networking', description: 'VPCs, security groups, Route 53, load balancers',
        objects: [{ id: 'vpcs', name: 'VPCs', fields: 12 }, { id: 'security-groups', name: 'Security Groups', fields: 10 }, { id: 'route53', name: 'Route 53 Zones', fields: 8 }] },
      { id: 'serverless', name: 'Serverless', description: 'SQS queues, SNS topics, API Gateway',
        objects: [{ id: 'sqs', name: 'SQS Queues', fields: 9 }, { id: 'sns', name: 'SNS Topics', fields: 7 }] },
    ],
  },
  checkr: {
    id: 'checkr', name: 'Checkr', shortName: 'Checkr', authType: 'api_key',
    categories: [
      { id: 'background-checks', name: 'Background Check Results', description: 'Completed checks, status, adjudication',
        objects: [{ id: 'checks', name: 'Check Results', fields: 14 }] },
      { id: 'candidates', name: 'Candidate Records', description: 'Profiles, SSN verification, identity data',
        objects: [{ id: 'candidates', name: 'Candidates', fields: 11 }] },
      { id: 'packages', name: 'Screening Packages', description: 'Package configs, screening types, pricing',
        objects: [{ id: 'packages', name: 'Packages', fields: 8 }] },
    ],
  },
}

export const PRODUCTS = {
  automated_compliance: { id: 'automated_compliance', name: 'Automated Compliance', requiredCategories: { aws: ['identity-access', 'storage-databases', 'logging-monitoring'] } },
  data_cloud: { id: 'data_cloud', name: 'Data Cloud', requiredCategories: {} },
  background_checks: { id: 'background_checks', name: 'Background Checks', requiredCategories: { checkr: ['background-checks', 'candidates', 'packages'] } },
}

export const PRODUCTS_LIST = [
  { id: 'automated_compliance', name: 'Automated Compliance', short: 'AC', requiredCategories: { aws: ['identity-access', 'storage-databases', 'logging-monitoring'] } },
  { id: 'universal_search', name: 'Universal Search', short: 'US', requiredCategories: { aws: ['identity-access', 'storage-databases'] } },
  { id: 'reports', name: 'Reports', short: 'RP', requiredCategories: {} },
  { id: 'workflows', name: 'Workflows', short: 'WF', requiredCategories: {} },
  { id: 'background_checks', name: 'Background Checks', short: 'BC', requiredCategories: { checkr: ['background-checks', 'candidates', 'packages'] } },
]

export const CHECKS = [
  'S3 bucket encryption at rest',
  'IAM password policy enforces MFA',
  'CloudTrail enabled in all regions',
  'Root account MFA enabled',
  'VPC flow logs enabled',
  'RDS encryption enabled',
  'IAM access keys rotated within 90 days',
]

export const CROSS_PRODUCTS = {
  aws: ['Automated Compliance', 'Universal Search', 'Reports', 'Workflows'],
  checkr: ['Background Checks', 'Reports', 'Workflows'],
}

export const SCENARIOS = [
  { id: 'ac-aws', label: 'Managed Setup', sublabel: 'Automated Compliance \u2192 AWS', origin: 'automated_compliance', connector: 'aws', existing: false },
  { id: 'dc-aws', label: 'Flexible Setup', sublabel: 'Data Cloud \u2192 AWS', origin: 'data_cloud', connector: 'aws', existing: false },
  { id: 'dc-aws-reuse', label: 'Cross-Product Reuse', sublabel: 'Data Cloud \u2192 AWS (already connected)', origin: 'data_cloud', connector: 'aws', existing: true, existingCategories: ['identity-access', 'storage-databases', 'logging-monitoring'], existingProduct: 'Automated Compliance' },
  { id: 'bc-checkr', label: 'Simple Connector', sublabel: 'Background Checks \u2192 Checkr', origin: 'background_checks', connector: 'checkr', existing: false },
]

export function getDataPlan(connectorId, origin, existingCats = []) {
  const connector = CONNECTORS[connectorId]
  const product = PRODUCTS[origin]
  const required = product?.requiredCategories?.[connectorId] || []
  return connector.categories.map(cat => ({
    ...cat,
    required: required.includes(cat.id),
    requiredBy: required.includes(cat.id) ? [product.name] : [],
    locked: required.includes(cat.id),
    enabled: required.includes(cat.id) || existingCats.includes(cat.id),
    existing: existingCats.includes(cat.id),
    optional: !required.includes(cat.id),
  }))
}

export const EASE_OUT = [0.25, 1, 0.5, 1]

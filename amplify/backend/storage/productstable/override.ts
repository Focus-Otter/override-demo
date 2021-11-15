import { AmplifyDDBResourceTemplate } from '@aws-amplify/cli-extensibility-helper'
export function override(resources: AmplifyDDBResourceTemplate) {
	resources.dynamoDBTable.timeToLiveSpecification = {
		attributeName: 'ttl',
		enabled: true,
	}
}

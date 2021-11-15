import { AmplifyAuthCognitoStackTemplate } from '@aws-amplify/cli-extensibility-helper'
export function override(resources: AmplifyAuthCognitoStackTemplate) {
	resources.userPool.policies = {
		passwordPolicy: {
			...resources.userPool.policies.passwordPolicy,
			temporaryPasswordValidityDays: 1,
		},
	}
}

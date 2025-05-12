// aws.ts
import { fromCognitoIdentityPool } from '@aws-sdk/credential-provider-cognito-identity';
import { CognitoIdentityProviderClient, GetUserCommand, UpdateUserAttributesCommand } from '@aws-sdk/client-cognito-identity-provider';

import { DynamoDBClient, ScanCommand, PutItemCommand, AttributeValue } from '@aws-sdk/client-dynamodb';
import { type BorrowRecord, type Token } from './types';

const region = 'us-east-2';
const userPoolId = 'us-east-2_UbVB9dHVM';
const identityPoolId = 'us-east-2:fe8b1af6-470c-458e-815a-79a6549d96e0';

export async function getUserAttributes(accessToken: string) {
	const client = new CognitoIdentityProviderClient({ region });

	const command = new GetUserCommand({
		AccessToken: accessToken
	});

	return client.send(command);
}

export async function updateUserAttributes(accessToken: string, userAttributes: { [key: string]: string }) {
	const client = new CognitoIdentityProviderClient({ region });

	const command = new UpdateUserAttributesCommand({
		AccessToken: accessToken,
		UserAttributes: Object.keys(userAttributes)
			.map(key => ({ Name: key, Value: userAttributes[key] }))
		// { Name: 'given_name', Value: 'John' },
		// { Name: 'family_name', Value: 'Doe' }
	});

	return client.send(command);
}

export function getDynamoClient(idToken: string) {
	const credentials = fromCognitoIdentityPool({
		identityPoolId,
		clientConfig: { region },
		logins: {
			[`cognito-idp.${region}.amazonaws.com/${userPoolId}`]: idToken,
		},
	});

	return new DynamoDBClient({ region, credentials });
}

// ------ EarbudBorrows ------
export async function putBorrowRecord(client: DynamoDBClient, item: BorrowRecord) {
	const command = new PutItemCommand({
		TableName: 'EarbudBorrows',
		Item: {
			name: { S: item.name },
			checkout_date: { S: item.checkout_date },
			return_date: { S: item.return_date },
			earbud_type: { S: item.earbud_type },
		},
	});

	return client.send(command);
}

export async function fetchRecentBorrows(client: DynamoDBClient) {
	let fiveDaysAgo = new Date();
	fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

	const command = new ScanCommand({
		TableName: 'EarbudBorrows',
		FilterExpression: 'checkout_date > :start',
		ExpressionAttributeValues: {
			':start': { S: fiveDaysAgo.toJSON() },
		},
	});

	return client.send(command);
}


// ------ Tokens ------
export async function fetchTokens(client: DynamoDBClient) {
	let fiveDaysAgo = new Date();
	fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

	const command = new ScanCommand({
		TableName: 'EarbudBorrows',
		FilterExpression: 'date_created > :start',
		ExpressionAttributeValues: {
			':start': { S: fiveDaysAgo.toJSON() },
		},
	});

	return client.send(command);
}

export async function putToken(client: DynamoDBClient, item: Token) {
	const command = new PutItemCommand({
		TableName: 'Tokens',
		Item: {
			token: { S: item.token },
			date_created: { S: item.date_created },
			created_by_id: { S: item.created_by_id },
			created_by_name: { S: item.created_by_name }
		},
	});

	return client.send(command);
}


export function flattenDBItem<T = Record<string, any>>(
	item: Record<string, AttributeValue>
): T {
	const result: Record<string, any> = {};

	for (const key in item)
		result[key] = parseAttributeValue(item[key]);

	return result as T;
}

function parseAttributeValue(value: AttributeValue): any {
	if ('S' in value) return value.S;
	if ('N' in value) return Number(value.N);
	if ('BOOL' in value) return value.BOOL;
	if ('NULL' in value) return null;
	if ('M' in value) {
		const map: Record<string, any> = {};
		for (const key in value.M) {
			map[key] = parseAttributeValue(value.M[key]);
		}
		return map;
	}
	if ('L' in value) return value.L?.map(parseAttributeValue);
	if ('SS' in value) return value.SS;
	if ('NS' in value) return value.NS?.map(Number);
	if ('BS' in value) return value.BS;
	if ('B' in value) return value.B; // Typically Uint8Array
	return undefined; // fallback
}
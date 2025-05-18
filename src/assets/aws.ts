// aws.ts
import { fromCognitoIdentityPool } from '@aws-sdk/credential-provider-cognito-identity';
import { CognitoIdentityProviderClient, ListUsersCommand, GetUserCommand, UpdateUserAttributesCommand, type AttributeType } from '@aws-sdk/client-cognito-identity-provider';
import { DynamoDBClient, ScanCommand, PutItemCommand, AttributeValue } from '@aws-sdk/client-dynamodb';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';

import type { BorrowRecord, Token, UserAttributes } from './types';

import { region, userPoolId, identityPoolId } from './security';
import type { AwsCredentialIdentity } from "@aws-sdk/types";

export async function getUsers(credentials: AwsCredentialIdentity) {
	const client = new CognitoIdentityProviderClient({ region, credentials });

	const command = new ListUsersCommand({
		UserPoolId: userPoolId,
		Limit: 60 // Optional: max is 60
	});

	return client.send(command);
}

export async function getUserAttributes(accessToken: string) {
	const client = new CognitoIdentityProviderClient({ region });

	const command = new GetUserCommand({
		'AccessToken': accessToken
	});

	return client.send(command);
}

export async function updateUserAttributes(accessToken: string, userAttributes: { [key: string]: string }) {
	const client = new CognitoIdentityProviderClient({ region });

	const command = new UpdateUserAttributesCommand({
		'AccessToken': accessToken,
		'UserAttributes': Object.keys(userAttributes).map(key => ({
			'Name': key,
			'Value': userAttributes[key]
		}))
	});

	return client.send(command);
}

export async function invokeCheckoutEIMs(credentials: AwsCredentialIdentity, payload: object) {
	const lambdaClient = new LambdaClient({ region, credentials });

	// Prepare the command
	const command = new InvokeCommand({
		'FunctionName': 'checkout-iems', // Replace with your Lambda function's name
		'Payload': new TextEncoder().encode(JSON.stringify(payload)),
	});

	// Call the Lambda
	try {
		const response = await lambdaClient.send(command);
		const responsePayload = JSON.parse(new TextDecoder().decode(response.Payload));
		return responsePayload;
	} catch (err) {
		console.error('Error calling Lambda:', err);
		return {
			statusCode: 400
		};
	}
}

function getCredentials(idToken: string) {
	return fromCognitoIdentityPool({
		identityPoolId,
		clientConfig: { region },
		logins: {
			[`cognito-idp.${region}.amazonaws.com/${userPoolId}`]: idToken,
		},
	});
}

export function getDynamoClient(idToken: string) {
	return new DynamoDBClient({ region, credentials: getCredentials(idToken) });
}

export function getDynamoClientCreds(credentials: AwsCredentialIdentity) {
	return new DynamoDBClient({ region, credentials });
}

// ------ EarbudBorrows ------
export async function putBorrowRecord(client: DynamoDBClient, item: BorrowRecord) {
	const command = new PutItemCommand({
		'TableName': 'EarbudBorrows',
		'Item': {
			'name': { S: item.name },
			'checkout_date': { S: item.checkout_date },
			'return_date': { S: item.return_date },
			'earbud_type': { S: item.earbud_type },
		},
	});

	return client.send(command);
}

export async function fetchRecentBorrows(client: DynamoDBClient) {
	let fiveDaysAgo = new Date();
	fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 10);

	const command = new ScanCommand({
		TableName: 'EarbudBorrows',
		FilterExpression: 'checkout_date > :start',
		ExpressionAttributeValues: {
			':start': { S: fiveDaysAgo.toJSON() },
		},
	});

	return client.send(command);
}


export async function fetchUserBorrows(client: DynamoDBClient, user_id: string) {

	const command = new ScanCommand({
		TableName: 'EarbudBorrows',
		FilterExpression: 'checkout_user_id = :user_id',
		ExpressionAttributeValues: {
			':user_id': { S: user_id },
		},
	});

	return client.send(command);
}

// ------ Tokens ------
export async function fetchTokens(client: DynamoDBClient) {
	let createdAfter = new Date();
	createdAfter.setDate(createdAfter.getDate() - 1);

	const command = new ScanCommand({
		TableName: 'Tokens',
		FilterExpression: 'date_created > :start',
		ExpressionAttributeValues: {
			':start': { S: createdAfter.toJSON() },
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



export function parseAttributes(arr: Array<AttributeType> | undefined): UserAttributes {

	let attributes: UserAttributes = {};
	if (arr) {
		arr.forEach((attr: AttributeType) => {
			if (attr.Name)
				attributes[attr.Name] = attr.Value;
		});
	}
	return attributes;
}
// aws.ts
import { fromCognitoIdentityPool } from '@aws-sdk/credential-provider-cognito-identity';
import { DynamoDBClient, ScanCommand, PutItemCommand } from '@aws-sdk/client-dynamodb';

const region = 'us-east-2';
const userPoolId = 'us-east-2_UbVB9dHVM';
const identityPoolId = 'us-east-2:fe8b1af6-470c-458e-815a-79a6549d96e0';

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


export function flattenDBStringObject(item: object) {
	const flat = {};
	for (const key in item)
		flat[key] = item[key].S; // only handles string values
	return flat;
}
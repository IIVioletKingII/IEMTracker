import { useState, useEffect, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import Record from './Record';
import './HomePage.css'
import { useAuth } from "react-oidc-context";
import { fromCognitoIdentityPool } from '@aws-sdk/credential-provider-cognito-identity';
import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';

type BorrowRecord = {
	name: string,
	checkout_date: string,
	return_date: string,
	earbud_type: string
}

const region = 'us-east-2';
const userPoolId = 'us-east-2_UbVB9dHVM';
const identityPoolId = 'us-east-2:fe8b1af6-470c-458e-815a-79a6549d96e0';

function flattenDBStringObject(item: object) {
	const flat = {};
	for (const key in item)
		flat[key] = item[key].S; // only handles string values
	return flat;
}

export default memo(function Page() {
	const auth = useAuth();
	const navigate = useNavigate();
	const [items, setItems] = useState<BorrowRecord[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(true);

	useEffect(() => {
		if (!auth.isAuthenticated) {
			navigate('/');
			return;
		}

		// Proceed only if authenticated
		if (auth.isAuthenticated && auth.user?.id_token) {
			const idToken = auth.user.id_token;

			const credentials = fromCognitoIdentityPool({
				identityPoolId: identityPoolId,
				clientConfig: {
					region: region,
				},
				logins: {
					[`cognito-idp.${region}.amazonaws.com/${userPoolId}`]: idToken, // Your Cognito User Pool ID
				},
			});

			// Instantiate DynamoDB Client with the provided credentials
			const dynamoDBClient = new DynamoDBClient({
				region: region,
				credentials,
			});

			let fiveDaysAgo = new Date();
			fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

			const command = new ScanCommand({
				TableName: 'EarbudBorrows',
				FilterExpression: 'checkout_date > :start',
				ExpressionAttributeValues: {
					':start': { S: '2024-01-01' }
				}
			});

			dynamoDBClient.send(command)
				.then(response => {
					const condensed: BorrowRecord[] = response.Items?.map(flattenDBStringObject) ?? [];
					setItems(condensed);
					setIsLoading(false); // Set loading to false when data is fetched
				})
				.catch(error => {
					console.error('DynamoDB error:', error);
					setIsLoading(false); // Set loading to false in case of error
				});
		}
	}, [auth.isAuthenticated, auth.user?.id_token, navigate]); // Only run if authentication state changes

	return (
		<div className="home-page">
			<div className="header flex gap align-items-center">
				<img src="/NL-IEM-Tracker.png" alt="NL IEM Tracker" className="home-hero" />
			</div>
			<div className="block">
				<div className="flex margin-vertical align-items-center">

					<div className="title">Please blah blah blah</div>
					<button className="button">Checkout</button>
				</div>

				{isLoading ? (
					<span>Loading...</span>
				) : items.map((item, index) => (
					<Record key={index} {...item} />
				))}
			</div>
		</div>
	);
});

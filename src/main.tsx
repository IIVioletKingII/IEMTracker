import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from "react-oidc-context";
import 'material-icons/iconfont/material-icons.css';
import { cognitoAuthConfig, region, userPoolId, userPoolWebClientId, identityPoolId } from './assets/security.ts';

import './css/index.css'
import Router from './Router.tsx'

import { Amplify } from 'aws-amplify';
import awsconfig from './assets/aws-exports';
Amplify.configure({
	Auth: {
		Cognito: {
			userPoolId: userPoolId,
			userPoolClientId: userPoolWebClientId,
			identityPoolId: identityPoolId,
			loginWith: {
				email: true,
			},
			signUpVerificationMethod: "code",
			userAttributes: {
				email: {
					required: true,
				},
			},
			allowGuestAccess: false,
			passwordFormat: {
				minLength: 8,
				requireLowercase: true,
				requireUppercase: true,
				requireNumbers: true,
				requireSpecialCharacters: true,
			},
		},
	},
});

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		{/* <AuthProvider {...cognitoAuthConfig}> */}
		<Router />
		{/* <App /> */}

		{/* </AuthProvider> */}
	</StrictMode>
)

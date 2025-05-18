import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'material-icons/iconfont/material-icons.css';
import { userPoolId, userPoolWebClientId, identityPoolId } from './assets/security.ts';

import './css/index.css'
import Router from './Router.tsx'

import { Amplify } from 'aws-amplify';

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

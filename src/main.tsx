import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './css/index.css'
import Router from './Router.tsx'
import { AuthProvider } from "react-oidc-context";
import 'material-icons/iconfont/material-icons.css';

const URI = import.meta.env.VITE_PUBLIC_URI;

const cognitoAuthConfig = {
	authority: "https://cognito-idp.us-east-2.amazonaws.com/us-east-2_UbVB9dHVM",
	client_id: "2pl4ha6s3afos3vfcqbcifg4b2",
	redirect_uri: `${URI}home`,
	response_type: "code",
	scope: "email openid phone",
};

console.log('redirect_uri', cognitoAuthConfig.redirect_uri);


createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<AuthProvider {...cognitoAuthConfig}>
			<Router />
		</AuthProvider>
	</StrictMode>
)

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from "react-oidc-context";
import 'material-icons/iconfont/material-icons.css';
import { cognitoAuthConfig } from './assets/security.ts';

import './css/index.css'
import Router from './Router.tsx'

console.log('redirect_uri', cognitoAuthConfig.redirect_uri);

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<AuthProvider {...cognitoAuthConfig}>
			<Router />
		</AuthProvider>
	</StrictMode>
)

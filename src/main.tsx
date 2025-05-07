import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './css/index.css'
import App from './App.tsx'
import { AuthProvider } from "react-oidc-context";
import 'material-icons/iconfont/material-icons.css';


const cognitoAuthConfig = {
	authority: "https://cognito-idp.us-east-2.amazonaws.com/us-east-2_UbVB9dHVM",
	client_id: "2pl4ha6s3afos3vfcqbcifg4b2",
	redirect_uri: "http://localhost:5173/home",
	response_type: "code",
	scope: "email openid phone",
};

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<AuthProvider {...cognitoAuthConfig}>
			<App />
		</AuthProvider>
	</StrictMode>,
)

import { region, userPoolId, userPoolWebClientId } from './security.ts';
const URI = import.meta.env.VITE_PUBLIC_URI;


export interface AmplifyAuthConfig {
	region: string;
	userPoolId: string;
	userPoolWebClientId: string;
	mandatorySignIn: boolean;
	authenticationFlowType?: string;
	oauth?: {
		domain: string;
		scope: string[];
		redirectSignIn: string;
		redirectSignOut: string;
		responseType: string;
	};
}

export interface AmplifyConfig {
	aws_project_region: string;
	Auth: AmplifyAuthConfig;
	// other config sections can be added here (e.g. API, Storage)
}

const awsmobile: AmplifyConfig = {
	aws_project_region: region,
	Auth: {
		region: region,
		userPoolId: userPoolId,
		userPoolWebClientId: userPoolWebClientId,
		mandatorySignIn: true,
		// oauth: {
		// 	domain: "your-auth-domain.auth.us-east-1.amazoncognito.com",
		// 	scope: ["email", "openid", "profile"],
		// 	redirectSignIn: `${URI}/home`,
		// 	redirectSignOut: `${URI}/signout`,
		// 	responseType: "code",
		// },
	},
	// other categories...
};

export default awsmobile;

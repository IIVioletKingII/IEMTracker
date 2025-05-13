
const URI = import.meta.env.VITE_PUBLIC_URI;


export const region = 'us-east-2';
// export const userPoolId = 'us-east-2_UbVB9dHVM';
// export const userPoolId = 'us-east-2_VcAaN5TPB';
export const userPoolId = 'us-east-2_bzEvjHlih';
export const identityPoolId = 'us-east-2:fe8b1af6-470c-458e-815a-79a6549d96e0';


// export const cognitoAuthConfig = {
// 	authority: "https://cognito-idp.us-east-2.amazonaws.com/us-east-2_UbVB9dHVM",
// 	client_id: "2pl4ha6s3afos3vfcqbcifg4b2",
// 	redirect_uri: `${URI}home`,
// 	response_type: "code",
// 	scope: "email openid phone",
// };

// export const cognitoAuthConfig = {
// 	authority: "https://cognito-idp.us-east-2.amazonaws.com/us-east-2_VcAaN5TPB",
// 	client_id: "5s7gs8a6trifc6318f001d60gs",
// 	redirect_uri: `${URI}home`,
// 	response_type: "code",
// 	scope: "phone openid email",
// };



export const cognitoAuthConfig = {
	authority: `https://cognito-idp.us-east-2.amazonaws.com/${userPoolId}`,
	client_id: "7or71c2o1m4ji460vpkf52ae15",
	redirect_uri: `${URI}/home`,
	response_type: "code",
	scope: "phone openid email",
};

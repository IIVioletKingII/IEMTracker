// ProtectedRoute.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "react-oidc-context";
import { type ComponentProps } from '../assets/types';
import HeroPage from '../pages/HeroPage';


export default function AuthPage({ children }: ComponentProps) {
	const auth = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		if (!auth.isAuthenticated && !auth.isLoading)
			navigate('/', { 'state': { 'fromInsideApp': true } });
	}, [auth.isAuthenticated, auth.isLoading]);

	if (!auth.isAuthenticated && auth.isLoading) {

		return (
			<HeroPage>
				<span>Authenticating...</span>
			</HeroPage>
		);
	}

	return children;
};

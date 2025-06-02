import { BrowserRouter as HashRouter, Routes, Route } from 'react-router-dom';
import "./css/Router.css"
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useMemo } from 'react';

import Auth from "./components/Auth.tsx";
import HeroPage from './pages/HeroPage.tsx'
import HomePage from './pages/HomePage.tsx';
import AdminPage from './pages/AdminPage.tsx';
import NotFoundPage from './pages/NotFoundPage.tsx';
import ProtectedRoute from './components/ProtectedRoute';
import ProfilePage from './pages/ProfilePage.tsx';
import CheckoutPage from './pages/CheckoutPage.tsx';
import SignInPage from './pages/SignInPage.tsx';
import SignUpPage from './pages/SignUpPage.tsx';
import SignOutPage from './pages/SignOutPage.tsx';
import UsersPage from './pages/UsersPage.tsx';

export default function Router() {

	const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

	const theme = useMemo(() =>
		createTheme({
			palette: {
				mode: prefersDarkMode ? 'dark' : 'light',
			},
		}), [prefersDarkMode]);

	return (
		<ThemeProvider theme={theme}>
			<HashRouter basename='/IEMTracker'>
				<Routes>
					<Route
						path='/'
						element={
							<HeroPage>
								<Auth />
							</HeroPage>
						}
					/>
					<Route
						path='/home'
						element={
							<ProtectedRoute>
								<HomePage />
							</ProtectedRoute>
						}
					/>
					<Route
						path='/checkout'
						element={
							<ProtectedRoute>
								<CheckoutPage />
							</ProtectedRoute>
						}
					/>
					<Route
						path='/admin'
						element={
							<ProtectedRoute>
								<AdminPage />
							</ProtectedRoute>
						}
					/>
					<Route
						path='/users'
						element={
							<ProtectedRoute>
								<UsersPage />
							</ProtectedRoute>
						}
					/>
					<Route
						path='/profile'
						element={
							<ProtectedRoute>
								<ProfilePage />
							</ProtectedRoute>
						}
					/>
					<Route path='/signin' element={<SignInPage />} />
					<Route path='/signup' element={<SignUpPage />} />
					<Route path='/signout' element={<SignOutPage />} />
					<Route path='*' element={<NotFoundPage />} />
				</Routes>
			</HashRouter>
		</ThemeProvider>

	);
};
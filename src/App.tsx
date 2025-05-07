import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import "./css/App.css"
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useMemo } from 'react';


import AuthPage from './pages/AuthPage.tsx'
import HomePage from './pages/HomePage.tsx';
import NotFoundPage from './pages/NotFoundPage.tsx';

function App() {

	const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

	const theme = useMemo(() =>
		createTheme({
			palette: {
				mode: prefersDarkMode ? 'dark' : 'light',
			},
		}), [prefersDarkMode]);

	return (
		<ThemeProvider theme={theme}>
			<Router>
				<Routes>
					<Route path='/' element={<AuthPage />} />
					<Route path='/home' element={<HomePage />} />
					<Route path='*' element={<NotFoundPage />} />
				</Routes>
			</Router>
		</ThemeProvider>

	);
}

export default App;
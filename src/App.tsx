import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import "./App.css"

import AuthPage from './AuthPage.tsx'
import HomePage from './HomePage';
// import AboutPage from './pages/AboutPage';
// import NotFoundPage from './pages/NotFoundPage';

function App() {
	return (
		<Router>
			<Routes>
				<Route path='/' element={<AuthPage />} />
				<Route path='/home' element={<HomePage />} />
				{/* <Route path='*' element={<NotFoundPage />} /> */}
			</Routes>
		</Router>
	);
}

export default App;
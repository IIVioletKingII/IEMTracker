import { useNavigate } from 'react-router-dom';
import '../css/Navbar.css';
import type { ReactNode } from 'react';

export default function Navbar({ children, homeLink }: { children: ReactNode, readonly homeLink?: Function }) {
	const navigate = useNavigate();

	function goHome() {
		if (homeLink)
			homeLink();
		else
			navigate('/', { 'state': { 'fromInsideApp': true } });
	}

	return (
		<div className="header flex align-items-center" >
			<img src="/IEMTracker/NL-IEM-Tracker.png" alt="NL IEM Tracker" />
			<div className='center'>
				{children}
			</div>
			<button className='shadow-click' onClick={goHome}>
				<span className='material-icons'>home</span>
			</button>
		</div>
	)
}
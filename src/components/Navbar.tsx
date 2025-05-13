import { useNavigate } from 'react-router-dom';
import '../css/Navbar.css';

export default function Navbar() {
	const navigate = useNavigate();

	function goHome() {
		navigate('/', { 'state': { 'fromInsideApp': true } });
	}


	return (
		<div className="header flex gap align-items-center" >
			<img src="/IEMTracker/NL-IEM-Tracker.png" alt="NL IEM Tracker" className="home-hero" />
			<button onClick={goHome}>
				<span className='material-icons' > home </span>
			</button>
		</div>
	)
}
import '../css/HomePage.css'
import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {

	const navigate = useNavigate();

	function goHome() {
		navigate('/');
	}

	return (
		<div className="page" data-name="not-found">
			<div className="block">
				<div className="flex margin-vertical align-items-center">

					<div className="title">Page not found...</div>
					<button className="button" onClick={goHome}>Home</button>
				</div>
			</div>
		</div>
	);
};

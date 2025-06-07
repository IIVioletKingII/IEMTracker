import '../css/Version.css';

import { version } from '../../package.json';

export default function Accordion() {

	return (
		<span className='version'>v{version}
		</span>
	);
};;
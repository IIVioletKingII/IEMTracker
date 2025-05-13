import { useState, type ReactNode } from 'react';
import '../css/Accordion.css';

const Accordion = ({ title, children }: { readonly title: string, readonly children: ReactNode }) => {
	const [isOpen, setIsOpen] = useState(false);

	const toggleAccordion = () => {
		setIsOpen(!isOpen);
	};

	return (
		<div className='accordion'>
			<button className='accordion-header' onClick={toggleAccordion}>
				{title}
				<span className={`accordion-icon material-icons ${isOpen ? 'open' : ''}`}>chevron_right</span>
			</button>
			{isOpen && <div className='accordion-content'>{children}</div>}
		</div>
	);
};

export default Accordion;
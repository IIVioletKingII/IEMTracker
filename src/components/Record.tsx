import React, { useState } from 'react';
import '../css/Record.css'
import { type BorrowRecord } from '../assets/types.ts';


export default function Record({ name, checkout_date, return_date, earbud_type }: BorrowRecord) {

	function checkoutIEM(e) {
		console.log('checkout', checkout_date, e);
	}

	function returnIEM(e) {
		console.log('return', return_date, e);
	}

	return (
		<div className="record-container">
			<span className="material-icons">headphones</span>
			<span className="name">{name}</span>
			<span className="type">{earbud_type}</span>
			<button>
				<span className="material-icons" onClick={checkoutIEM}>today</span>
			</button>
			<button>
				<span className="material-icons" onClick={returnIEM}>event_available</span>
			</button>
			{/* <input type="checkbox" /> */}
		</div >
	);
};
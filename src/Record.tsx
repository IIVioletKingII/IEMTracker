import React, { useState } from 'react';
import './Record.css'

export default function Record({ name }) {
	const params = Object.fromEntries(new URLSearchParams(window.location.search));

	console.log('url params', params);

	function checkoutIEM(e) {
		console.log('checkout', e);
	}

	function returnIEM(e) {
		console.log('return', e);
	}

	return (
		<div className="record-container">
			<span className="material-icons">headphones</span>
			<span className="name">{name}</span>
			<button>
				<span className="material-icons" onClick={checkoutIEM}>today</span>
			</button>
			<button>
				<span className="material-icons" onClick={returnIEM}>event_available</span>
			</button>
		</div >
	);
};
import { type ReactNode } from 'react';

export type BorrowRecord = {
	name: string,
	checkout_date: string,
	return_date: string,
	earbud_type: string
}

export type Token = {
	token: string,
	date_created: string,
	created_by_id: string,
	created_by_name: string
}


export type ComponentProps = {
	children?: ReactNode;
};
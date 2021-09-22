"use strict";

import { Button, ButtonProps } from './common';
import { QueryExecutor } from '../helpers/data';
import { useStore } from '../store/hooks';
import { AppState } from '../types';
import React, { useCallback, useState } from 'react';


export interface MutationButtonProps extends ButtonProps {
	query: QueryExecutor<any>;
}

// Note: This is not ideal as we do not work with the result,
// but for now it should work ...
export const QueryButton = ({ query, ...otherProps }: MutationButtonProps) => {

	const store = useStore<AppState>();

	const [state, setState] = useState({
		loading: false,
	});

	const handleClick = useCallback(event => {

		const restUrl = store.get('restUrl');

		setState(prevState => ({ loading: true }));

		query(restUrl)
			.then(result => {
				console.log(`[QueryButton] result`, result);
				// this is problematic as it can be called even after the component is unmounted
				setState(prevState => ({ loading: false }));
			})
			.catch(err => {
				console.error(`[QueryButton] error`, err);
				// this is problematic as it can be called even after the component is unmounted
				setState(prevState => ({ loading: false }));
			});

	}, [query, setState, store]);

	return (
		<Button
			{...otherProps}
			disabled={state.loading}
			onClick={handleClick}
		/>
	);

};

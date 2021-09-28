"use strict";

import { useEffect } from 'react';


export const useOnKeyDownEvent = (onKeyDown: (event: KeyboardEvent) => void) => {

	useEffect(() => {

		let didUnsubscribe = false;

		const handler = (event: KeyboardEvent) => {

			if (didUnsubscribe) {
				return;
			}

			onKeyDown(event);

		};

		window.addEventListener('keydown', handler);

		return () => {
			didUnsubscribe = true;
			window.removeEventListener('keydown', handler);
		};

	}, [onKeyDown]);

};

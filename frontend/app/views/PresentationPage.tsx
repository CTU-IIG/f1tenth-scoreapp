"use strict";

import React from 'react';

import { useDocumentTitle, useFormatMessageIdAsTagFn } from '../helpers/hooks';
import { useCurrentRace } from '../ws/hooks';


const PresentationPage = () => {

	const t = useFormatMessageIdAsTagFn();

	useDocumentTitle(t`titles.presentation`);

	const { currentRace } = useCurrentRace();

	return (
		<>

			Current race id: {currentRace ?? 'null'}

		</>
	);

};

export default PresentationPage;

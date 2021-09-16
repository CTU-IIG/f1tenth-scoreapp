"use strict";

import React from 'react';

import { useDocumentTitle, useFormatMessageIdAsTagFn } from '../helpers/hooks';


const PresentationPage = () => {

	const t = useFormatMessageIdAsTagFn();

	useDocumentTitle(t`titles.presentation`);

	return (
		<>

			TODO

		</>
	);

};

export default PresentationPage;

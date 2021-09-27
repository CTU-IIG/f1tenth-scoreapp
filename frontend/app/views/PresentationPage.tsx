"use strict";

import React from 'react';

import { useDocumentTitle, useFormatMessageIdAsTagFn } from '../helpers/hooks';
import { useCurrentRace } from '../ws/hooks';
import { isDefined } from '../helpers/common';
import { RaceView } from './race';


const PresentationPage = () => {

	const t = useFormatMessageIdAsTagFn();

	useDocumentTitle(t`titles.presentation`);

	const { currentRace } = useCurrentRace();

	if (!isDefined(currentRace)) {
		return (
			<>
				Current race id is null.
				<br />In this case, we show a leaderboard (TODO: Implement leaderboard).
			</>
		);
	}

	return (
		<RaceView
			id={currentRace}
			interactive={false}
		/>
	);

};

export default PresentationPage;

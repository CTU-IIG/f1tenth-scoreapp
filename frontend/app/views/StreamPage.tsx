"use strict";

import React from 'react';

import { useDocumentTitle, useFormatMessageIdAsTagFn } from '../helpers/hooks';
import { useEffectiveRace } from '../ws/hooks';
import { isDefined } from '../helpers/common';
import { RaceStreamViewProps } from './race';

import f1tenthLogo from '../images/f1tenth/f1tenth-logo-white-bg-and-url.png';


const StreamPage = () => {

	const t = useFormatMessageIdAsTagFn();

	useDocumentTitle(t`titles.stream`);

	const currentRace = useEffectiveRace();

	if (!isDefined(currentRace)) {
		// TODO: Show LeaderBoard instead (once implemented).
		return (
			<div className="presentation-empty-screen">
				<img
					className="logo"
					alt="F1Tenth Official Logo"
					src={f1tenthLogo}
					width={750}
					height={750}
				/>
				<h1>9th F1TENTH Autonomous Grand Prix</h1>
				<h2>IROS 2021 Prague</h2>
				<div className="message">
					No race is in progress.
				</div>
			</div>
		);
	}

	return (
		<div className="race-stream">
			<RaceStreamViewProps
				id={currentRace}
				interactive={false}
			/>
		</div>

	);

};

export default StreamPage;

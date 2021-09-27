"use strict";

import React from 'react';

import { useDocumentTitle, useFormatMessageId } from '../helpers/hooks';
import { useRoute } from '../router/hooks';
import { isDefined } from '../helpers/common';
import { LoadingError, LoadingScreen } from '../components/layout';
import { R_RACES } from '../routes';
import { Link } from '../router/compoments';
import { RaceTimers } from '../components/timers';
import { RACE_STATE_BEFORE_START, RACE_STATE_RUNNING } from '../types';
import { useRaceDataExperimental } from '../helpers/races-experimental';
import { CrossingsView } from '../components/crossings';

import IconArrowLeft from '-!svg-react-loader?name=IconEye!../images/icons/arrow-left-solid.svg';
import { WebSocketInfo } from '../components/ws';
import { Button } from '../components/common';

const RaceNotFound = ({ id }) => {

	const t = useFormatMessageId();

	return (
		<>
			<h1>{t(`racePage.notFoundHeading`)}</h1>
			<p>
				{t(`racePage.notFoundMessage`, { id })}
			</p>
			<Link name={R_RACES}>{t(`racePage.backToRaces`)}</Link>
		</>
	);
};


const RacePage = () => {

	const t = useFormatMessageId();

	const { route } = useRoute();
	const idStr = route?.payload?.raceId as string;
	const id = parseInt(idStr);
	console.log('id = ', id);

	const { op, startRace, stopRace, cancelRace, updateCrossing } = useRaceDataExperimental(id);

	const pageTitle = op.loading ?
		t(`titles.loading`)
		: !isDefined(op.data) ? t(`titles.notFound`) : op.data.race.id.toString();

	useDocumentTitle(pageTitle);

	if (op.loading) {
		return (
			<LoadingScreen />
		);
	}

	if (op.hasError) {
		return (
			<LoadingError error={op.error} />
		);
	}

	if (!isDefined(op.data)) {
		return (
			<RaceNotFound id={id} />
		);
	}

	const race = op.data.race;
	const {
		startTime,
		stopTime,
		numLaps,
		bestLapTime,
		bestLapCrossingId,
		currentLapStartTime,
		enhancedCrossings,
	} = op.data.stats;

	console.log('race', race);

	const isActive = race.state === RACE_STATE_RUNNING;

	return (
		<div className="race">

			<header className="race-header">
				<div className="container">

					<Link className="btn btn-back" name={R_RACES}>
						<IconArrowLeft />
						<span className="sr-only">Back to all races</span>
					</Link>

					<div className="race-details">
						{t(`race.types.${race.type}`)} #{race.id}, {race.teamA.name}, round {race.round}
					</div>

					<WebSocketInfo />

				</div>
			</header>

			<main className="race-content">

				<div className="container">

					<div className="btn-group">

						<h2>{t(`race.states.${race.state}`)}</h2>

						{race.state === RACE_STATE_BEFORE_START && (
							<Button
								style="default"
								label="racePage.startRace"
								onClick={startRace}
							/>
						)}

						{race.state === RACE_STATE_RUNNING && (
							<Button
								style="default"
								label="racePage.stopRace"
								onClick={stopRace}
							/>
						)}

						{race.state === RACE_STATE_RUNNING && (
							<Button
								style="default"
								label="racePage.cancelRace"
								onClick={cancelRace}
							/>
						)}

					</div>

					<div className="race-layout">

						<RaceTimers
							startTime={startTime}
							stopTime={stopTime}
							numLaps={numLaps}
							bestLapTime={bestLapTime}
							currentLapStartTime={currentLapStartTime}
							active={isActive}
						/>

						<CrossingsView
							bestLapCrossingId={bestLapCrossingId}
							crossings={enhancedCrossings}
							updateCrossing={updateCrossing}
						/>

					</div>

				</div>

				{/*<div className="race-info">*/}
				{/*	{t(`race.id`)}: {race.id}*/}
				{/*	<br />{t(`race.type`)}: {t(`race.types.${race.type}`)}*/}
				{/*	<br />{t(`race.state`)}: {t(`race.states.${race.state}`)}*/}
				{/*	<br />{t(`race.round`)}: {race.round}*/}
				{/*	<br />{t(`race.team`)}: {race.teamA.name}*/}
				{/*</div>*/}

			</main>


		</div>
	);

};

export default RacePage;

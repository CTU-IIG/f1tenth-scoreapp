"use strict";

import React, { useCallback, useMemo, useState } from 'react';

import { useDocumentTitle, useFormatMessageId } from '../helpers/hooks';
import { useRoute } from '../router/hooks';
import { isDefined } from '../helpers/common';
import { LoadingError, LoadingScreen } from '../components/layout';
import { Breadcrumbs } from '../components/breadcrumbs';
import { R_RACE, R_RACES } from '../routes';
import { Link } from '../router/compoments';
import { RaceTimers } from '../components/timers';
import { RACE_STATE_BEFORE_START, RACE_STATE_RUNNING } from '../types';
import { Button } from '../components/common';
import { useRaceDataExperimental } from '../helpers/races-experimental';
import { cancelRace, startRace, stopRace } from '../helpers/queries';
import { QueryButton } from '../components/data';
import { CrossingsView } from '../components/crossings';


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

	const [isEditMode, setIsEditMode] = useState(false);

	const handleSwitchToEditMode = useCallback((event) => {
		event.preventDefault();
		setIsEditMode(prev => !prev);
	}, [setIsEditMode]);

	// TODO: maybe use just one useMemo
	const startThisRace = useMemo(() => startRace(id), [id]);
	const stopThisRace = useMemo(() => stopRace(id), [id]);
	const cancelThisRace = useMemo(() => cancelRace(id), [id]);

	const [op, updateCrossing] = useRaceDataExperimental(id);

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
		console.log(op.error);
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
		<>

			<Breadcrumbs
				name={R_RACE}
				raceId={race.id}
			/>

			<p>
				{t(`race.id`)}: {race.id}
				<br />{t(`race.type`)}: {t(`race.types.${race.type}`)}
				<br />{t(`race.state`)}: {t(`race.states.${race.state}`)}
				<br />{t(`race.round`)}: {race.round}
				<br />{t(`race.team`)}: {race.teamA.name}
			</p>

			<h2 className="race-state">
				{t(`race.states.${race.state}`)}
			</h2>

			<div className="btn-group">
				<Button
					style="default"
					onClick={handleSwitchToEditMode}
					label={`racePage.${isEditMode ? 'switchToDisplayMode' : 'switchToEditMode'}`}
				/>

				{race.state === RACE_STATE_BEFORE_START && (
					<QueryButton
						query={startThisRace}
						style="default"
						label="racePage.startRace"
					/>
				)}

				{race.state === RACE_STATE_RUNNING && (
					<QueryButton
						query={stopThisRace}
						style="default"
						label="racePage.stopRace"
					/>
				)}

				{race.state === RACE_STATE_RUNNING && (
					<QueryButton
						query={cancelThisRace}
						style="default"
						label="racePage.cancelRace"
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

		</>
	);

};

export default RacePage;

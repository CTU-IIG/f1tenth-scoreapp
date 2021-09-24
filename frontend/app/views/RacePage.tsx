"use strict";

import React, { useCallback, useMemo, useState } from 'react';

import { useDocumentTitle, useFormatMessageId, useStoreValueRestUrl } from '../helpers/hooks';
import { useRoute } from '../router/hooks';
import { isDefined } from '../helpers/common';
import { LoadingError, LoadingScreen } from '../components/layout';
import { Breadcrumbs } from '../components/breadcrumbs';
import { R_RACE, R_RACES } from '../routes';
import { Link } from '../router/compoments';
import { RaceTimers, TimerDisplay } from '../components/timers';
import { EnhancedCrossing, RACE_STATE_BEFORE_START, RACE_STATE_RUNNING } from '../types';
import classNames from 'classnames';
import { Button } from '../components/common';
import { ToggleInput } from '../components/inputs';
import { useRaceDataExperimental } from '../helpers/races-experimental';
import { cancelRace, ignoreCrossing, startRace, stopRace, unignoreCrossing } from '../helpers/queries';
import { QueryButton } from '../components/data';


interface CrossingRowProps {
	crossing: EnhancedCrossing,
	isBestLap: boolean;
	showToggle: boolean;
}

const CrossingRow = ({ crossing, isBestLap, showToggle }: CrossingRowProps) => {

	const { id, ignored, start, lap } = crossing;

	const [restUrl] = useStoreValueRestUrl();

	const toggleIgnore = useCallback(() => {

		(ignored ? unignoreCrossing(id) : ignoreCrossing(id))(restUrl)
			.then(result => {
				console.log(`[toggleIgnore] id=${id}`, result);
			})
			.catch(err => {
				console.error(`[toggleIgnore] error`, err);
			});

	}, [id, ignored, restUrl]);

	const toggle = showToggle ? <ToggleInput
		id={`crossing-ignore-${id}`}
		name="ignore"
		label="racePage.ignore"
		checked={!ignored}
		onChange={toggleIgnore}
	/> : undefined;

	return (
		<div
			data-id={crossing.id}
			className={classNames('crossing', {
				'crossing--ignored': ignored,
				'crossing--start': start,
				'crossing--lap': isDefined(lap),
				'crossing--best-lap': isBestLap,
			})}
		>
			{start && (
				<span className="lap-number-prefix">Start</span>
			)}
			{isDefined(lap) && (
				<>
					<span className="lap-number-prefix">Lap</span>
					<span className="lap-number">{lap.number}</span>
					<span className="lap-time-prefix">Time</span>
					<TimerDisplay className="lap-time" time={lap.time} />
				</>
			)}
			<div className="crossing-id">{id}</div>
			<div className="crossing-toggle">{toggle}</div>
		</div>
	);

};

interface CrossingsListProps {
	showIgnored: boolean;
	bestLapCrossingId: number;
	crossings: EnhancedCrossing[],
}

const CrossingsList = ({ showIgnored, bestLapCrossingId, crossings }: CrossingsListProps) => {

	const cs = showIgnored
		? crossings
		: crossings.filter(c => !c.ignored);

	return (
		<div className="crossings-list">
			{cs.map(c =>
				<CrossingRow
					key={c.id}
					crossing={c}
					isBestLap={c.id === bestLapCrossingId}
					showToggle={showIgnored}
				/>,
			)}
		</div>
	);

};

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

	const op = useRaceDataExperimental(id);

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
				<br />{t(`race.round`)}: {race.round}
				<br />{t(`race.team`)}: {race.teamA.name}
				<br />{t(`race.state`)}: {t(`race.states.${race.state}`)}
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

				<CrossingsList
					showIgnored={isEditMode}
					bestLapCrossingId={bestLapCrossingId}
					crossings={enhancedCrossings}
				/>

			</div>

		</>
	);

};

export default RacePage;

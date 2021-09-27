"use strict";

import React from 'react';

import { useDocumentTitle, useFormatMessageId } from '../helpers/hooks';
import { useRoute } from '../router/hooks';
import { isDefined } from '../helpers/common';
import { LoadingError, LoadingScreen } from '../components/layout';
import { R_RACES } from '../routes';
import { Link } from '../router/compoments';
import { RaceTimers } from '../components/timers';
import { RACE_STATE_BEFORE_START, RACE_STATE_RUNNING, RACE_TYPE_HEAD_TO_HEAD } from '../types';
import { useRaceDataExperimental } from '../helpers/races-experimental';
import { CrossingsView } from '../components/crossings';

import IconArrowLeft from '-!svg-react-loader?name=IconEye!../images/icons/arrow-left-solid.svg';
import { OnlineBarriersInfo, WebSocketInfo } from '../components/ws';
import { Button } from '../components/common';
import classNames from 'classnames';

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


export const RacePage = () => {

	const { route } = useRoute();

	// TODO: Move payload validation and parsing to the router impl.

	const idStr = route?.payload?.raceId;

	if (typeof idStr !== 'string') {
		return (
			<RaceNotFound id={idStr} />
		);
	}

	const id = parseInt(idStr);

	if (!Number.isInteger(id)) {
		return (
			<RaceNotFound id={idStr} />
		);
	}

	return (
		<RaceView
			id={id}
			interactive={true}
		/>
	);

};


export interface RaceViewProps {
	id: number;
	interactive: boolean;
}

export const RaceView = ({ id, interactive = true }: RaceViewProps) => {

	const t = useFormatMessageId();

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

	const isActive = race.state === RACE_STATE_RUNNING;

	return (
		<div className="race">

			<header className="race-header">
				<div className="container">

					{interactive && (
						<Link className="btn btn-back" name={R_RACES}>
							<IconArrowLeft />
							<span className="sr-only">Back to all races</span>
						</Link>
					)}

					<div
						data-id={race.id}
						className={classNames([
							'race-details-line',
							`race--${race.type.replace('_', '-')}`,
							`race--${race.state.replace('_', '-')}`,
						])}
					>

						<div className="race-id">#{race.id}</div>

						<div className="race-type">
							{t(`race.types.${race.type}`)}
						</div>

						<div className="race-team">
							<span className="team-a">{race.teamA.name}</span>
							{race.type === RACE_TYPE_HEAD_TO_HEAD && (
								<>
									<span className="divider">vs.</span>
									<span className="team-b">{race.teamB.name}</span>
								</>
							)}
						</div>

						<div className="race-round">
							{t(`race.round`)} {race.round}
						</div>

						<div className="race-state">
							{t(`race.states.${race.state}`)}
						</div>

					</div>

					<OnlineBarriersInfo/>

					<WebSocketInfo />

				</div>
			</header>

			<main className="race-content">

				<div className="container">

					{interactive && (
						<div className="btn-group">

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
					)}

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
							interactive={interactive}
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

"use strict";

import React, { useCallback, useState } from 'react';

import { useDocumentTitle, useFormatMessageId } from '../helpers/hooks';
import { useRoute } from '../router/hooks';
import { isDefined } from '../helpers/common';
import { LoadingError, LoadingScreen } from '../components/layout';
import { R_RACES } from '../routes';
import { Link } from '../router/compoments';
import {
	Crossing,
	CROSSING_TEAM_A,
	CROSSING_TEAM_B,
	FullHeadToHeadRace,
	FullRace,
	FullTimeTrialRace,
	RACE_STATE_BEFORE_START,
	RACE_STATE_RUNNING,
	RACE_TYPE_HEAD_TO_HEAD,
	RACE_TYPE_TIME_TRIAL,
} from '../types';
import { CrossingUpdater, useRaceDataExperimental } from '../helpers/races-experimental';

import IconArrowLeft from '-!svg-react-loader?name=IconEye!../images/icons/arrow-left-solid.svg';
import { OnlineBarriersInfo, WebSocketInfo } from '../components/ws';
import { Button, ConfirmButton } from '../components/common';
import classNames from 'classnames';
import { RaceTimers } from '../components/timers';
import { CrossingsList, CrossingsView } from '../components/crossings';
import { HeadToHeadRaceStats, RaceStats, TimeTrialRaceStats } from '../helpers/races';
import { useOnKeyDownEvent } from '../helpers/keyboard';


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


interface RaceHeaderProps {
	race: FullRace;
	interactive: boolean;
}

const RaceHeader = ({ race, interactive }: RaceHeaderProps) => {

	const t = useFormatMessageId();

	return (
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

				<OnlineBarriersInfo />

				<WebSocketInfo />

			</div>
		</header>
	);

};

interface RaceHeadToHeadNonInteractiveCrossingsViewProps {
	crossings: Crossing[];
}

const RaceHeadToHeadNonInteractiveCrossingsView = ({ crossings }: RaceHeadToHeadNonInteractiveCrossingsViewProps) => {

	return (
		<>
			<CrossingsList
				bestLapCrossingId={/* TODO */-1}
				crossings={crossings}
				showIgnored={false}
				showCheckpoints={false}
				team={CROSSING_TEAM_A}
				showAbsoluteTime={false}
				showDebugInfo={false}
				visibleScrollbar={false}
				autoScroll={true}
			/>
			<CrossingsList
				bestLapCrossingId={/* TODO */-1}
				crossings={crossings}
				showIgnored={false}
				showCheckpoints={false}
				team={CROSSING_TEAM_B}
				showAbsoluteTime={false}
				showDebugInfo={false}
				visibleScrollbar={false}
				autoScroll={true}
			/>
		</>
	);

};

interface RaceHeadToHeadContentProps {
	race: FullHeadToHeadRace;
	stats: RaceStats;
	interactive: boolean;
	updateCrossing: CrossingUpdater;
}

const RaceHeadToHeadContent = ({ race, stats, interactive, updateCrossing }: RaceHeadToHeadContentProps) => {

	if (race.type !== stats.type) {
		// that should never happen
		throw new Error(`race.type (${race.type}) !== stats.type (${stats.type})`);
	}

	const timersActive = race.state === RACE_STATE_RUNNING;

	return (
		<>

			<div className="race-teams">
				<div className="team-a">
					<span className="team-name-box">A</span>
					{race.teamA.name}
				</div>
				<span className="divider">vs.</span>
				<div className="team-b">
					<span className="team-name-box">B</span>
					{race.teamB.name}
				</div>
			</div>

			<div className="race-layout">

				<RaceTimers
					startTime={stats.teamA.startTime}
					stopTime={stats.teamA.stopTime}
					numLaps={stats.teamA.numLaps}
					bestLapTime={stats.teamA.bestLapTime}
					currentLapStartTime={stats.teamA.currentLapStartTime}
					active={timersActive}
				/>

				{interactive
					? (
						<CrossingsView
							bestLapCrossingId={/* TODO */-1}
							crossings={race.crossings}
							updateCrossing={updateCrossing}
							interactive={interactive}
							barriersFilter={true}
							showTeamSetter={true}
						/>
					)
					: (
						<RaceHeadToHeadNonInteractiveCrossingsView
							crossings={race.crossings}
						/>
					)
				}

				<RaceTimers
					startTime={stats.teamB.startTime}
					stopTime={stats.teamB.stopTime}
					numLaps={stats.teamB.numLaps}
					bestLapTime={stats.teamB.bestLapTime}
					currentLapStartTime={stats.teamB.currentLapStartTime}
					active={timersActive}
				/>

			</div>
		</>
	);

};

interface RaceTimeTrialContentProps {
	race: FullTimeTrialRace;
	stats: RaceStats;
	interactive: boolean;
	updateCrossing: CrossingUpdater;
}

const RaceTimeTrialContent = ({ race, stats, interactive, updateCrossing }: RaceTimeTrialContentProps) => {

	if (race.type !== stats.type) {
		// that should never happen
		throw new Error(`race.type (${race.type}) !== stats.type (${stats.type})`);
	}

	const timersActive = race.state === RACE_STATE_RUNNING;

	return (
		<div className="race-layout">

			<RaceTimers
				startTime={stats.startTime}
				stopTime={stats.stopTime}
				numLaps={stats.numLaps}
				bestLapTime={stats.bestLapTime}
				currentLapStartTime={stats.currentLapStartTime}
				active={timersActive}
			/>

			<CrossingsView
				bestLapCrossingId={stats.bestLapCrossingId}
				crossings={race.crossings}
				updateCrossing={updateCrossing}
				interactive={interactive}
				barriersFilter={false}
				showTeamSetter={false}
			/>

		</div>
	);

};


export interface RaceViewProps {
	id: number;
	interactive: boolean;
}

export const RaceView = ({ id, interactive = true }: RaceViewProps) => {

	const t = useFormatMessageId();

	const [forceNonInteractive, setForceNonInteractive] = useState(false);

	const toggleForceNonInteractive = useCallback(() => {
		setForceNonInteractive(prevValue => !prevValue);
	}, [setForceNonInteractive]);

	const handleKeyDownEvent = useCallback((event: KeyboardEvent) => {

		if (event.repeat) {
			return;
		}

		if (event.key === 'i' || event.key === 'I') {
			toggleForceNonInteractive();
		}

	}, [toggleForceNonInteractive]);

	useOnKeyDownEvent(handleKeyDownEvent);

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

	return (
		<div className="race">

			<RaceHeader
				race={race}
				interactive={interactive}
			/>

			<main className="race-content">

				<div className="container">

					{interactive && (
						<div className="race-toolbar">

							<Button
								style="flex"
								onClick={toggleForceNonInteractive}
							>
								<kbd className="dark left">I</kbd>{' '}
								{t(`racePage.${forceNonInteractive
									? 'enableInteractiveMode'
									: 'disableInteractiveMode'
								}`)}
							</Button>

							{!forceNonInteractive && race.state === RACE_STATE_BEFORE_START && (
								<Button
									style="default"
									label="racePage.startRace"
									onClick={startRace}
								/>
							)}

							{!forceNonInteractive && race.state === RACE_STATE_RUNNING && (
								<ConfirmButton
									style="default"
									label="racePage.stopRace"
									onClick={stopRace}
								/>
							)}

							{!forceNonInteractive && race.state === RACE_STATE_RUNNING && (
								<ConfirmButton
									style="default"
									label="racePage.cancelRace"
									onClick={cancelRace}
								/>
							)}

						</div>
					)}

					{race.type === RACE_TYPE_HEAD_TO_HEAD
						? (
							<RaceHeadToHeadContent
								race={race}
								stats={op.data.stats}
								interactive={forceNonInteractive ? false : interactive}
								updateCrossing={updateCrossing}
							/>
						)
						: (
							<RaceTimeTrialContent
								race={race}
								stats={op.data.stats}
								interactive={forceNonInteractive ? false : interactive}
								updateCrossing={updateCrossing}
							/>
						)
					}

				</div>

			</main>

		</div>
	);

};


interface RaceHeadToHeadStreamBoxProps {
	race: FullHeadToHeadRace;
	stats: HeadToHeadRaceStats;
}

const RaceHeadToHeadStreamBox = ({ race, stats }: RaceHeadToHeadStreamBoxProps) => {

	const t = useFormatMessageId();

	if (race.type !== stats.type) {
		// that should never happen
		throw new Error(`race.type (${race.type}) !== stats.type (${stats.type})`);
	}

	const timersActive = race.state === RACE_STATE_RUNNING;

	return (
		<div
			data-id={race.id}
			className={classNames([
				'race-stream-box',
				`race--${race.type.replace('_', '-')}`,
				`race--${race.state.replace('_', '-')}`,
			])}
		>

			<div className="race-teams">
				<div className="team-a">
					<span className="team-name-box">A</span>
					{race.teamA.name}
				</div>
				<span className="divider">vs.</span>
				<div className="team-b">
					<span className="team-name-box">B</span>
					{race.teamB.name}
				</div>
			</div>

			<div className="race-timers-line">

				<RaceTimers
					startTime={stats.teamA.startTime}
					stopTime={stats.teamA.stopTime}
					numLaps={stats.teamA.numLaps}
					bestLapTime={stats.teamA.bestLapTime}
					currentLapStartTime={stats.teamA.currentLapStartTime}
					active={timersActive}
				/>

				<RaceTimers
					startTime={stats.teamA.startTime}
					stopTime={stats.teamA.stopTime}
					numLaps={stats.teamA.numLaps}
					bestLapTime={stats.teamA.bestLapTime}
					currentLapStartTime={stats.teamA.currentLapStartTime}
					active={timersActive}
				/>

			</div>

		</div>
	);

};

interface RaceTimeTrialStreamBoxProps {
	race: FullTimeTrialRace;
	stats: TimeTrialRaceStats;
}

const RaceTimeTrialStreamBox = ({ race, stats }: RaceTimeTrialStreamBoxProps) => {

	const t = useFormatMessageId();

	if (race.type !== stats.type) {
		// that should never happen
		throw new Error(`race.type (${race.type}) !== stats.type (${stats.type})`);
	}

	const timersActive = race.state === RACE_STATE_RUNNING;

	return (
		<div
			data-id={race.id}
			className={classNames([
				'race-stream-box',
				`race--${race.type.replace('_', '-')}`,
				`race--${race.state.replace('_', '-')}`,
			])}
		>

			<div className="race-details-line">

				<div className="race-id">#{race.id}</div>

				<div className="race-type">
					{t(`race.types.${race.type}`)}
				</div>

				<div className="race-team">
					<span className="team-a">{race.teamA.name}</span>
				</div>

				<div className="race-round">
					{t(`race.round`)} {race.round}
				</div>

			</div>

			<div className="race-timers-line">

				<RaceTimers
					startTime={stats.startTime}
					stopTime={stats.stopTime}
					numLaps={stats.numLaps}
					bestLapTime={stats.bestLapTime}
					currentLapStartTime={stats.currentLapStartTime}
					active={timersActive}
				/>

			</div>

		</div>
	);

};


export interface RaceStreamViewProps {
	id: number;
	interactive: boolean;
}

export const RaceStreamViewProps = ({ id, interactive = true }: RaceStreamViewProps) => {

	const t = useFormatMessageId();

	const { op } = useRaceDataExperimental(id);

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
	const stats = op.data.stats;

	if (race.type !== stats.type) {
		// that should never happen
		throw new Error(`race.type (${race.type}) !== stats.type (${stats.type})`);
	}

	if (race.type === RACE_TYPE_HEAD_TO_HEAD) {
		return (
			<RaceHeadToHeadStreamBox
				race={race}
				stats={stats as HeadToHeadRaceStats}
			/>
		);
	}

	if (race.type === RACE_TYPE_TIME_TRIAL) {
		return (
			<RaceTimeTrialStreamBox
				race={race}
				stats={stats as TimeTrialRaceStats}
			/>
		);
	}

	// this should never happen
	return null;

};


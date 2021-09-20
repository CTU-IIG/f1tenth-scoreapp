"use strict";

import React, { useState } from 'react';

import { useDocumentTitle, useFormatMessageId, useFormatMessageIdAsTagFn } from '../helpers/hooks';
import { useRoute } from '../router/hooks';
import { isDefined } from '../helpers/common';
import { LoadingError, LoadingScreen } from '../components/layout';
import { Breadcrumbs } from '../components/breadcrumbs';
import { R_TRIAL, R_TRIALS } from '../routes';
import { cancelTrial, ignoreCrossing, stopTrial, unignoreCrossing } from '../helpers/queries';
import { Link } from '../router/compoments';
import { TimeDisplay, Timers } from '../components/timers';
import { useTrialData } from '../helpers/trials';
import { Crossing, FullTrial, TRIAL_STATE_FINISHED, TRIAL_STATE_RUNNING, TRIAL_STATE_UNFINISHED } from '../types';


const LapHistory = (props) => {
	return (
		<ul>
			{props.lapTimes.map((time, index) => {
				return (
					<TimeDisplay
						key={index}
						name={'Lap ' + (index + 1) + ': '}
						time={time}
					/>
				);
			})}
		</ul>
	);
};

interface CrossingsHistoryProps {
	start: number;
	crossings: Crossing[];
}

const CrossingsHistory = ({ start, crossings }: CrossingsHistoryProps) => {

	// TODO: This is not correct. ignoreCrossing/unignoreCrossing must not be called directly.
	const sendRequest = (ignored, id) => {
		if (ignored) {
			unignoreCrossing(id);
		} else {
			ignoreCrossing(id);
		}
	};

	return (
		<ul>
			{crossings.map((cs, index) => {
				return (
					<div key={index}>
						<TimeDisplay name={'Crossing ' + (index + 1) + ': '} time={cs.time * 1000 - start} />
						<button className="trial-ignorebutton" onClick={() => sendRequest(cs.ignored, cs.id)}>
							{cs.ignored ? 'Y' : 'N'}
						</button>
					</div>
				);
			})}
		</ul>
	);
};

const TrialNotFound = ({ id }) => {

	const t = useFormatMessageId();

	return (
		<>
			<h1>{t(`trialPage.notFoundHeading`)}</h1>
			<p>
				{t(`trialPage.notFoundMessage`, { id })}
			</p>
			<Link name={R_TRIALS}>{t(`trialPage.backToTrials`)}</Link>
		</>
	);
};

const computeLapTimes = (trial: FullTrial) => {

	const lapTimes: number[] = [];
	let shortestLapTime = Number.MAX_SAFE_INTEGER;
	let last = 0;
	let startTime = 0;

	for (const cs of trial.crossings) {

		if (cs.ignored) {
			continue;
		}

		if (last !== 0) {
			const diff = cs.time * 1000 - last;
			lapTimes.push(diff);
			shortestLapTime = (diff < shortestLapTime) ? diff : shortestLapTime;
		} else {
			startTime = cs.time * 1000;
		}

		last = cs.time * 1000;

	}

	console.log('lt:', lapTimes);
	console.log('blt:', shortestLapTime);
	console.log('lst:', last);
	console.log('rst:', startTime);

	return {
		lapTimes,
		bestLapTime: shortestLapTime,
		lapStartTime: last,
		raceStartTime: startTime,
	};

};

const TrialPage = () => {

	const t = useFormatMessageIdAsTagFn();

	const { route } = useRoute();
	const idStr = route?.payload?.trialId as string;
	const id = parseInt(idStr);
	console.log('id = ', id);

	const [isEditMode, setIsEditMode] = useState(false);

	const op = useTrialData(id);

	const pageTitle = op.loading ?
		t`titles.loading`
		: !isDefined(op.data) ? t`titles.notFound` : op.data.id.toString();

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
			<TrialNotFound id={id} />
		);
	}

	const trial = op.data;

	console.log('trial', trial);

	const isActive = trial.state === TRIAL_STATE_RUNNING;
	const { lapTimes, bestLapTime, lapStartTime, raceStartTime } = computeLapTimes(trial);

	let history;
	if (isEditMode) {
		history = <LapHistory lapTimes={lapTimes} />;
	} else {
		history = <CrossingsHistory crossings={trial.crossings} start={raceStartTime} />;
	}

	return (
		<>

			<Breadcrumbs
				name={R_TRIAL}
				trialId={trial.id}
			/>

			<p>
				ID: {trial.id}
				<br />Round: {trial.round}
				<br />Team: {trial.team.name}
				<br />State: {trial.state}
			</p>

			<h2 className="trial-state">
				{(() => {
					if (trial.state === TRIAL_STATE_RUNNING) {
						return "Race in progress";
					} else if (trial.state === TRIAL_STATE_UNFINISHED) {
						return "Race cancelled";
					} else if (trial.state === TRIAL_STATE_FINISHED) {
						return "Race finished";
					}
				})()}
			</h2>

			<Timers
				lapStartTime={lapStartTime}
				raceStartTime={raceStartTime}
				bestLapTime={bestLapTime}
				active={isActive}
			/>
			{history}
			<button onClick={() => setIsEditMode(prev => !prev)}>
				{isEditMode ? 'Switch to display only mode' : 'Switch to editing mode'}
			</button>

			{/* TODO: cancelTrial must NOT be called directly */}
			<button className="cancel" onClick={() => cancelTrial(trial.id)}>
				Cancel trial
			</button>

			{/* TODO: stopTrial must NOT be called directly */}
			<button className="stop" onClick={() => stopTrial(trial.id)}>
				Stop trial
			</button>

		</>
	);

};

export default TrialPage;

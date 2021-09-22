"use strict";

import React, { useCallback, useState } from 'react';

import {
	useDocumentTitle,
	useFormatMessageId,
	useFormatMessageIdAsTagFn,
	useStoreValueRestUrl,
} from '../helpers/hooks';
import { useRoute } from '../router/hooks';
import { isDefined } from '../helpers/common';
import { LoadingError, LoadingScreen } from '../components/layout';
import { Breadcrumbs } from '../components/breadcrumbs';
import { R_TRIAL, R_TRIALS } from '../routes';
import { Link } from '../router/compoments';
import { TimerDisplay, TrialTimers } from '../components/timers';
import { EnhancedCrossing, TRIAL_STATE_FINISHED, TRIAL_STATE_RUNNING, TRIAL_STATE_UNFINISHED } from '../types';
import classNames from 'classnames';
import { Button } from '../components/common';
import { ToggleInput } from '../components/inputs';
import { useTrialDataExperimental } from '../helpers/trials-experimental';
import { ignoreCrossing, unignoreCrossing } from '../helpers/queries';


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
		label="trialPage.ignore"
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


const TrialPage = () => {

	const t = useFormatMessageIdAsTagFn();

	const { route } = useRoute();
	const idStr = route?.payload?.trialId as string;
	const id = parseInt(idStr);
	console.log('id = ', id);

	const [isEditMode, setIsEditMode] = useState(false);

	const handleSwitchToEditMode = useCallback((event) => {
		event.preventDefault();
		setIsEditMode(prev => !prev);
	}, [setIsEditMode]);

	const op = useTrialDataExperimental(id);

	const pageTitle = op.loading ?
		t`titles.loading`
		: !isDefined(op.data) ? t`titles.notFound` : op.data.trial.id.toString();

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

	const trial = op.data.trial;
	const {
		startTime,
		stopTime,
		numLaps,
		bestLapTime,
		bestLapCrossingId,
		currentLapStartTime,
		enhancedCrossings,
	} = op.data.stats;

	console.log('trial', trial);

	const isActive = trial.state === TRIAL_STATE_RUNNING;

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

			<div className="btn-group">
				<Button
					style="default"
					onClick={handleSwitchToEditMode}
					label={`trialPage.${isEditMode ? 'switchToDisplayMode' : 'switchToEditMode'}`}
				/>

				<Button
					style="default"
					label="trialPage.stopTrial"
				/>

				<Button
					style="default"
					label="trialPage.cancelTrial"
				/>

			</div>

			<div className="trial-layout">

				<TrialTimers
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

export default TrialPage;

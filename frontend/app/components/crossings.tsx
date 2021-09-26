"use strict";

import { CROSSING_TEAM_A, CROSSING_TEAM_B, CROSSING_TEAM_UNSET, CrossingTeam, EnhancedCrossing } from '../types';
import { Button, ButtonProps } from './common';
import { useFormatMessageId } from '../helpers/hooks';
import classNames from 'classnames';
import { isDefined } from '../helpers/common';
import { TimerDisplay } from './timers';
import LocalizedDate from './LocalizedDate';

import IconEye from '-!svg-react-loader?name=IconEye!../images/icons/eye-solid.svg';
import IconEyeSlash from '-!svg-react-loader?name=IconEyeSlash!../images/icons/eye-slash-solid.svg';

import React, { useCallback, useState } from 'react';
import { CheckboxOptionBox } from './inputs';


export const crossingTeamToClass = (team: CrossingTeam) =>
	team === CROSSING_TEAM_A ? 'a' : team === CROSSING_TEAM_B ? 'b' : 'unset';

export interface CrossingRowProps {
	crossing: EnhancedCrossing,
	isBestLap: boolean;
	showAbsoluteTime?: boolean;
	showDebugInfo?: boolean;
	onUpdateCrossingTeam?: ButtonProps['onClick'];
	onUpdateCrossingIgnored?: ButtonProps['onClick'];
}

export const CrossingRow = (
	{
		crossing,
		isBestLap,
		showAbsoluteTime = false,
		showDebugInfo = false,
		onUpdateCrossingTeam,
		onUpdateCrossingIgnored,
	}: CrossingRowProps,
) => {

	const t = useFormatMessageId();

	const { id, time, ignored, barrierId, team, start, lap } = crossing;

	return (
		<div
			data-id={id}
			data-ignored={ignored}
			data-team={team}
			className={classNames(
				'crossing',
				`crossing--team-${crossingTeamToClass(team)}`,
				{
					'crossing--ignored': ignored,
					'crossing--start': start,
					'crossing--lap': isDefined(lap),
					'crossing--best-lap': isBestLap,
				},
			)}
		>
			{isDefined(onUpdateCrossingTeam) && (
				<div className="team-setter">
					<Button
						name="setTeamA"
						label="racePage.teamBtn.a"
						style="team"
						className={team === CROSSING_TEAM_A ? 'btn-active' : undefined}
						onClick={onUpdateCrossingTeam}
					/>
					<Button
						name="setTeamB"
						label="racePage.teamBtn.b"
						style="team"
						className={team === CROSSING_TEAM_B ? 'btn-active' : undefined}
						onClick={onUpdateCrossingTeam}
					/>
				</div>
			)}
			{start && (
				<div className="start">{t('racePage.start')}</div>
			)}
			{isDefined(lap) && (
				<>
					<div className="lap-number">
						<div className="prefix">{t('racePage.lap')}</div>
						<div className="value">{lap.number}</div>
					</div>
					<div className="lap-time">
						<div className="prefix">{t('racePage.time')}</div>
						<TimerDisplay time={lap.time} />
					</div>
				</>
			)}
			{(showAbsoluteTime || ignored) && (
				<div className="crossing-time">
					<span className="sr-only">{t('racePage.absoluteTime')}</span>
					<LocalizedDate
						value={time}
						hour12={false}
						fractionalSecondDigits={3}
					/>
				</div>
			)}
			{showDebugInfo && (
				<div className="crossing-debug">
					<span className="barrier-id">B{barrierId}</span>
					<span className="divider"> </span>
					<span className="crossing-id">#{id}</span>
				</div>
			)}
			{isDefined(onUpdateCrossingIgnored) && (
				<Button
					name={!ignored ? 'ignore' : 'unignore'}
					className="btn-ignore"
					onClick={onUpdateCrossingIgnored}
				>
					{!ignored ? <IconEye /> : <IconEyeSlash />}
					<span className="sr-only">
						{t(`racePage.${!ignored ? 'ignore' : 'unignore'}`)}
					</span>
				</Button>
			)}
		</div>
	);

};


export interface CrossingsListProps {
	showIgnored: boolean;
	showAbsoluteTime?: boolean;
	showDebugInfo?: boolean;
	onUpdateCrossingTeam?: ButtonProps['onClick'];
	onUpdateCrossingIgnored?: ButtonProps['onClick'];
	bestLapCrossingId: number;
	crossings: EnhancedCrossing[],
}

export const CrossingsList = (
	{
		showIgnored,
		showAbsoluteTime,
		showDebugInfo,
		bestLapCrossingId,
		crossings,
		onUpdateCrossingTeam,
		onUpdateCrossingIgnored,
	}: CrossingsListProps,
) => {

	const cs = showIgnored
		? crossings
		: crossings.filter(c => !c.ignored);

	// TODO: auto scroll effect

	return (
		<div className="crossings-list">
			{cs.map(c =>
				<CrossingRow
					key={c.id}
					crossing={c}
					isBestLap={c.id === bestLapCrossingId}
					showAbsoluteTime={showAbsoluteTime}
					showDebugInfo={showDebugInfo}
					onUpdateCrossingTeam={onUpdateCrossingTeam}
					onUpdateCrossingIgnored={onUpdateCrossingIgnored}
				/>,
			)}
		</div>
	);

};


export interface CrossingsViewProps {
	bestLapCrossingId: number;
	crossings: EnhancedCrossing[],
	updateCrossing?: (id: number, ignored: boolean, team: CrossingTeam) => void;
}

export const CrossingsView = (
	{
		bestLapCrossingId,
		crossings,
		updateCrossing,
	}: CrossingsViewProps,
) => {

	const t = useFormatMessageId();

	const [state, setState] = useState(() => ({
		showIgnored: true,
		showAbsoluteTime: false,
		showDebugInfo: true,
	}));

	// TODO: auto scroll effect

	const handleOptionChange = useCallback<React.ChangeEventHandler<HTMLInputElement>>((event) => {

		if (
			event.target.name === 'showIgnored'
			|| event.target.name === 'showAbsoluteTime'
			|| event.target.name === 'showDebugInfo'
		) {
			return setState(prevState => ({
				...prevState,
				[event.target.name]: event.target.checked,
			}));
		}

	}, [setState]);


	const handleUpdateCrossing = useCallback((event) => {

		event.preventDefault();

		if (!isDefined(updateCrossing)) {
			return;
		}

		const btn: HTMLButtonElement = event.currentTarget;

		const crossing = btn.closest('.crossing') as HTMLDivElement | null;

		if (!isDefined(crossing)) {
			return;
		}

		if (
			!isDefined(crossing.dataset.id)
			|| !isDefined(crossing.dataset.ignored)
			|| !isDefined(crossing.dataset.team)
		) {
			return;
		}

		const id = parseInt(crossing.dataset.id);
		const ignored = crossing.dataset.ignored === 'true';
		const team = parseInt(crossing.dataset.team);

		if (btn.name === 'setTeamA') {
			updateCrossing(id, ignored, team !== CROSSING_TEAM_A ? CROSSING_TEAM_A : CROSSING_TEAM_UNSET);
			return;
		}

		if (btn.name === 'setTeamB') {
			updateCrossing(id, ignored, team !== CROSSING_TEAM_B ? CROSSING_TEAM_B : CROSSING_TEAM_UNSET);
			return;
		}

		if (btn.name === 'ignore') {
			updateCrossing(id, true, team as CrossingTeam);
			return;
		}

		if (btn.name === 'unignore') {
			updateCrossing(id, false, team as CrossingTeam);
			return;
		}

	}, [updateCrossing]);

	return (
		<div className="crossings-view">
			<ul className="crossings-view-options">
				<CheckboxOptionBox
					name="showIgnored"
					id="crossings-options--showIgnored"
					label={t('racePage.showIgnored')}
					value="showIgnored"
					selected={state.showIgnored}
					onChange={handleOptionChange}
				/>
				<CheckboxOptionBox
					name="showAbsoluteTime"
					id="crossings-options--showAbsoluteTime"
					label={t('racePage.showAbsoluteTime')}
					value="showAbsoluteTime"
					selected={state.showAbsoluteTime}
					onChange={handleOptionChange}
				/>
				<CheckboxOptionBox
					name="showDebugInfo"
					id="crossings-options--showDebugInfo"
					label={t('racePage.showDebugInfo')}
					value="showDebugInfo"
					selected={state.showDebugInfo}
					onChange={handleOptionChange}
				/>
			</ul>
			<CrossingsList
				showIgnored={state.showIgnored}
				showAbsoluteTime={state.showAbsoluteTime}
				showDebugInfo={state.showDebugInfo}
				// onUpdateCrossingTeam={isDefined(updateCrossing) ? handleUpdateCrossing : undefined}
				onUpdateCrossingIgnored={isDefined(updateCrossing) ? handleUpdateCrossing : undefined}
				bestLapCrossingId={bestLapCrossingId}
				crossings={crossings}
			/>
		</div>
	);

};

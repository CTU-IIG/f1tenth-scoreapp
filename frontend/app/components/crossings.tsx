"use strict";

import {
	Crossing,
	CROSSING_TEAM_A,
	CROSSING_TEAM_B,
	CROSSING_TEAM_UNSET,
	CrossingTeam,
	CrossingTeamAOrB,
} from '../types';
import { Button, ButtonProps } from './common';
import { useFormatMessageId } from '../helpers/hooks';
import classNames from 'classnames';
import { IS_DEVELOPMENT, isDefined } from '../helpers/common';
import { TimerDisplay } from './timers';
import LocalizedDate from './LocalizedDate';

import IconEye from '-!svg-react-loader?name=IconEye!../images/icons/eye-solid.svg';
import IconEyeSlash from '-!svg-react-loader?name=IconEyeSlash!../images/icons/eye-slash-solid.svg';
import IconCarCrash from '-!svg-react-loader?name=IconCarCrash!../images/icons/car-crash-solid.svg';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CheckboxOptionBox, RadioOptionBox } from './inputs';
import { useOnKeyDownEvent } from '../helpers/keyboard';
import { CrossingUpdater } from '../helpers/races-experimental';


export const crossingTeamToClass = (team: CrossingTeam) =>
	team === CROSSING_TEAM_A ? 'a' : team === CROSSING_TEAM_B ? 'b' : 'unset';

export const otherTeam = (current: CrossingTeam, fallback: CrossingTeamAOrB) =>
	current === CROSSING_TEAM_UNSET
		? fallback
		: current === CROSSING_TEAM_A ? CROSSING_TEAM_B : CROSSING_TEAM_A;

export interface CrossingRowProps {
	crossing: Crossing,
	diff?: number;
	isBestLap: boolean;
	showAbsoluteTime?: boolean;
	showDiff?: boolean;
	showDebugInfo?: boolean;
	onUpdateCrossingTeam?: ButtonProps['onClick'];
	onUpdateCrossingIgnored?: ButtonProps['onClick'];
	onUpdateCrossingInterrupted?: ButtonProps['onClick'];
}

export const CrossingRow = (
	{
		crossing,
		diff,
		isBestLap,
		showAbsoluteTime = false,
		showDiff = false,
		showDebugInfo = false,
		onUpdateCrossingTeam,
		onUpdateCrossingIgnored,
		onUpdateCrossingInterrupted,
	}: CrossingRowProps,
) => {

	const t = useFormatMessageId();

	const { id, time, ignored, barrierId, team, interrupted, start, checkpoint, lap } = crossing;

	return (
		<div
			data-id={id}
			data-ignored={ignored}
			data-team={team}
			data-interrupted={interrupted}
			className={classNames(
				'crossing',
				`crossing--team-${crossingTeamToClass(team)}`,
				{
					'crossing--ignored': ignored,
					'crossing--interrupted': interrupted,
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
						style="team-a"
						className={team === CROSSING_TEAM_A ? 'btn-active' : undefined}
						onClick={onUpdateCrossingTeam}
					/>
					<Button
						name="setTeamB"
						label="racePage.teamBtn.b"
						style="team-b"
						className={team === CROSSING_TEAM_B ? 'btn-active' : undefined}
						onClick={onUpdateCrossingTeam}
					/>
				</div>
			)}
			{start && (
				<div className="start">{t('racePage.start')}</div>
			)}
			{isDefined(checkpoint) && (
				<>
					<div className="checkpoint-number">
						<div className="prefix">{t('racePage.checkpoint', { number: checkpoint.number })}</div>
						<div className="value">{checkpoint.lapNumber}</div>
					</div>
					<div className="checkpoint-time">
						<div className="prefix">{t('racePage.time')}</div>
						<TimerDisplay time={checkpoint.time} />
					</div>
				</>
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
			{(showAbsoluteTime || ignored || start || (!isDefined(checkpoint) && !isDefined(lap))) && (
				<div className="crossing-time">
					<span className="sr-only">{t('racePage.absoluteTime')}</span>
					<LocalizedDate
						value={time}
						hour12={false}
						fractionalSecondDigits={3}
					/>
				</div>
			)}
			{(showDiff && isDefined(diff)) && (
				<div className="crossing-diff">
					<span className="sr-only">{t('racePage.diff')}</span>
					{'+ '}
					<TimerDisplay time={diff} />
				</div>
			)}
			{showDebugInfo && (
				<div className="crossing-debug">
					<span className="barrier-id">B{barrierId}</span>
					<span className="divider"> </span>
					<span className="crossing-id">#{id}</span>
				</div>
			)}
			{isDefined(onUpdateCrossingInterrupted) && (
				<Button
					name={!interrupted ? 'setInterrupted' : 'setUninterrupted'}
					className="btn-interrupted"
					onClick={onUpdateCrossingInterrupted}
				>
					{!interrupted ? <IconCarCrash /> : <IconCarCrash />}
					<span className="sr-only">
						{t(`racePage.${!ignored ? 'setInterrupted' : 'setUninterrupted'}`)}
					</span>
				</Button>
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

// TODO: Refactor once we have time
const calculateFilteredCrossingsDiffs = (cs: Crossing[]): (number | undefined)[] => {

	const diffs: (number | undefined)[] = [];

	let prev: number = 0;

	cs.forEach((c, index) => {

		if (index === 0) {
			diffs.push(undefined);
			prev = c.time;
			return;
		}

		diffs.push(c.time - prev);

		prev = c.time;

	});

	return diffs;

};

export interface CrossingsListProps {

	bestLapCrossingId: number;
	crossings: Crossing[],

	showIgnored: boolean;
	barrierId?: number;
	showCheckpoints: boolean;
	team?: CrossingTeam;

	showAbsoluteTime?: boolean;
	showDiff?: boolean;
	showDebugInfo?: boolean;

	updateCrossing?: CrossingUpdater;
	onUpdateCrossingTeam?: ButtonProps['onClick'];
	onUpdateCrossingIgnored?: ButtonProps['onClick'];
	onUpdateCrossingInterrupted?: ButtonProps['onClick'];

	visibleScrollbar?: boolean;
	autoScroll?: boolean;
	setAutoScroll?: (autoScroll: boolean) => void;

}

const useCrossingsKeyboardShortcuts = (
	cs: Crossing[],
	toggleIgnore: boolean,
	setTeam: boolean,
	updateCrossing?: CrossingUpdater,
) => {

	const handleKeyDownEvent = useCallback((event: KeyboardEvent) => {

		const key = event.key.toLowerCase();

		if (key !== 'i' && key !== 'a' && key !== 'b' && key !== 's') {
			return;
		}

		const noShortcutEnabled = !toggleIgnore && !setTeam;

		if (cs.length === 0 || noShortcutEnabled || !isDefined(updateCrossing)) {
			IS_DEVELOPMENT && console.log(`[useCrossingsKeyboardShortcuts] no crossings or none shortcut registered`);
			return;
		}

		if (event.repeat) {
			return;
		}

		if (toggleIgnore && key === 'i') {
			const lc = cs[cs.length - 1];
			IS_DEVELOPMENT && console.log(`[useCrossingsKeyboardShortcuts] toggleIgnore lastVisibleCrossing.id = ${lc.id}`);
			updateCrossing(lc.id, !lc.ignored, lc.team, lc.interrupted);
		}

		if (setTeam && key === 'a') {
			const lc = cs[cs.length - 1];
			IS_DEVELOPMENT && console.log(`[useCrossingsKeyboardShortcuts] setTeamA lastVisibleCrossing.id = ${lc.id}`);
			updateCrossing(lc.id, lc.ignored, CROSSING_TEAM_A, lc.interrupted);
		}

		if (setTeam && (key === 'b' || key === 's')) {
			const lc = cs[cs.length - 1];
			IS_DEVELOPMENT && console.log(`[useCrossingsKeyboardShortcuts] setTeamB lastVisibleCrossing.id = ${lc.id}`);
			updateCrossing(lc.id, lc.ignored, CROSSING_TEAM_B, lc.interrupted);
		}

	}, [cs, toggleIgnore, setTeam, updateCrossing]);

	useOnKeyDownEvent(handleKeyDownEvent);

};

export const CrossingsList = (
	{

		bestLapCrossingId,
		crossings,

		showIgnored,
		barrierId,
		showCheckpoints,
		team,

		showAbsoluteTime,
		showDiff,
		showDebugInfo,

		updateCrossing,
		onUpdateCrossingTeam,
		onUpdateCrossingIgnored,
		onUpdateCrossingInterrupted,

		visibleScrollbar = true,
		autoScroll = true,
		setAutoScroll,

	}: CrossingsListProps,
) => {

	const filter = useMemo(() => {

		const f: Parameters<Array<Crossing>['filter']>[0][] = [];

		if (!showIgnored) {
			f.push(c => !c.ignored && !c.excluded);
		}

		if (isDefined(barrierId)) {
			f.push(c => c.barrierId == barrierId);
		}

		if (!showCheckpoints) {
			f.push(c => !isDefined(c.checkpoint));
		}

		if (isDefined(team)) {
			f.push(c => c.team == team);
		}

		return f;

	}, [showIgnored, barrierId, showCheckpoints, team]);

	const cs = isDefined(filter) && filter.length > 0
		? crossings.filter(
			(value, index, array) =>
				filter.every(fn => fn(value, index, array)),
		)
		: crossings; // no filtering needed

	const count = cs.length;

	const diffs = showDiff ? calculateFilteredCrossingsDiffs(cs) : undefined;

	useCrossingsKeyboardShortcuts(
		cs,
		isDefined(onUpdateCrossingIgnored),
		isDefined(onUpdateCrossingTeam),
		updateCrossing,
	);

	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {

		const el = ref.current;

		if (isDefined(el) && autoScroll) {
			// auto scroll to the bottom of the element
			el.scrollTop = el.scrollHeight;
		}

	}, [count, autoScroll]);

	useEffect(() => {

		if (!isDefined(setAutoScroll)) {
			return;
		}

		const el = ref.current;

		if (!isDefined(el)) {
			return;
		}

		const checkScrollPosition = (event: Event) => {
			const scrolledToBottom = el.scrollHeight - Math.abs(el.scrollTop) === el.clientHeight;
			const currentAutoScroll = el.dataset.autoScroll === 'true';
			if (currentAutoScroll !== scrolledToBottom) {
				setAutoScroll(scrolledToBottom);
			}
		};

		// see https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#improving_scrolling_performance_with_passive_listeners
		el.addEventListener('scroll', checkScrollPosition, { passive: true });

		return () => {
			el.removeEventListener('scroll', checkScrollPosition);
		};


	}, [setAutoScroll]);

	return (
		<div
			data-auto-scroll={autoScroll}
			className={classNames([
				'crossings-list',
				visibleScrollbar ? 'crossings-list--scrollable' : 'crossings-list--scrollable-no-scrollbar',
			])}
			ref={ref}
		>
			{cs.map((c, index) =>
				<CrossingRow
					key={c.id}
					crossing={c}
					diff={isDefined(diffs) ? diffs[index] : undefined}
					isBestLap={c.id === bestLapCrossingId}
					showAbsoluteTime={showAbsoluteTime}
					showDiff={showDiff}
					showDebugInfo={showDebugInfo}
					onUpdateCrossingTeam={onUpdateCrossingTeam}
					onUpdateCrossingIgnored={onUpdateCrossingIgnored}
					onUpdateCrossingInterrupted={onUpdateCrossingInterrupted}
				/>,
			)}
		</div>
	);

};


export interface CrossingsViewProps {
	bestLapCrossingId: number;
	crossings: Crossing[],
	updateCrossing?: CrossingUpdater;
	interactive?: boolean;
	barriersFilter?: boolean;
	showTeamSetter?: boolean;
	showMarkInterruptionBtn?: boolean;
	teamABarrierId: number;
	teamBBarrierId?: number;
}

interface CrossingsViewState {

	showIgnored: boolean;
	barrierId: number | undefined;
	showCheckpoints: boolean;

	showAbsoluteTime: boolean;
	showDiffs: boolean;
	showDebugInfo: boolean;

	autoScroll: boolean;

}

export const CrossingsView = (
	{
		bestLapCrossingId,
		crossings,
		updateCrossing,
		interactive = true,
		barriersFilter = false,
		showTeamSetter = false,
		showMarkInterruptionBtn = false,
		teamABarrierId,
		teamBBarrierId,
	}: CrossingsViewProps,
) => {

	const t = useFormatMessageId();

	const [state, setState] = useState<CrossingsViewState>(() => ({

		showIgnored: interactive,
		barrierId: undefined,
		showCheckpoints: interactive,

		showAbsoluteTime: false,
		showDiffs: false,
		showDebugInfo: interactive,

		autoScroll: true,

	}));

	const handleOptionChange = useCallback<React.ChangeEventHandler<HTMLInputElement>>((event) => {

		const input = event.currentTarget;

		if (input.name === 'barrierId') {

			const barrierId = parseInt(input.value);

			if (!Number.isInteger(barrierId)) {
				return;
			}

			return setState(prevState => ({
				...prevState,
				barrierId: barrierId === 0 ? undefined : barrierId,
			}));

		}

		if (
			input.name === 'showIgnored'
			|| input.name === 'showCheckpoints'
			|| input.name === 'showAbsoluteTime'
			|| input.name === 'showDiffs'
			|| input.name === 'showDebugInfo'
			|| input.name === 'autoScroll'
		) {
			return setState(prevState => ({
				...prevState,
				[input.name]: input.checked,
			}));
		}

	}, [setState]);

	const setAutoScroll = useMemo(() => (autoScroll: boolean) => setState(prevState => {

		if (prevState.autoScroll === autoScroll) {
			return prevState;
		}

		return { ...prevState, autoScroll };

	}), [setState]);

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
			|| !isDefined(crossing.dataset.interrupted)
		) {
			return;
		}

		const id = parseInt(crossing.dataset.id);
		const ignored = crossing.dataset.ignored === 'true';
		const team = parseInt(crossing.dataset.team) as CrossingTeam;
		const interrupted = crossing.dataset.interrupted === 'true';

		if (btn.name === 'setTeamA') {
			updateCrossing(id, ignored, otherTeam(team, CROSSING_TEAM_A), interrupted);
			return;
		}

		if (btn.name === 'setTeamB') {
			updateCrossing(id, ignored, otherTeam(team, CROSSING_TEAM_B), interrupted);
			return;
		}

		if (btn.name === 'ignore') {
			updateCrossing(id, true, team, interrupted);
			return;
		}

		if (btn.name === 'unignore') {
			updateCrossing(id, false, team, interrupted);
			return;
		}

		if (btn.name === 'setInterrupted') {
			updateCrossing(id, ignored, team, true);
			return;
		}

		if (btn.name === 'setUninterrupted') {
			updateCrossing(id, ignored, team, false);
			return;
		}

	}, [updateCrossing]);

	return (
		<div className="crossings-view">
			{interactive && (
				<ul className="crossings-view-options">
					{barriersFilter === true && (
						<>
							<RadioOptionBox
								name="barrierId"
								id="crossings-options--allBarriers"
								label={t('racePage.allBarriers')}
								value="0"
								selected={state.barrierId === undefined}
								onChange={handleOptionChange}
							/>
							<RadioOptionBox
								name="barrierId"
								id="crossings-options--onlyBarrierA"
								label={t('racePage.onlyBarrierA')}
								value={teamABarrierId.toString()}
								selected={state.barrierId === teamABarrierId}
								onChange={handleOptionChange}
							/>
							{isDefined(teamBBarrierId) && (
								<RadioOptionBox
									name="barrierId"
									id="crossings-options--onlyBarrierB"
									label={t('racePage.onlyBarrierB')}
									value={teamBBarrierId.toString()}
									selected={state.barrierId === teamBBarrierId}
									onChange={handleOptionChange}
								/>
							)}
						</>
					)}
					<CheckboxOptionBox
						name="showIgnored"
						id="crossings-options--showIgnored"
						label={t('racePage.showIgnored')}
						value="showIgnored"
						selected={state.showIgnored}
						onChange={handleOptionChange}
					/>
					<CheckboxOptionBox
						name="showCheckpoints"
						id="crossings-options--showCheckpoints"
						label={t('racePage.showCheckpoints')}
						value="showCheckpoints"
						selected={state.showCheckpoints}
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
						name="showDiffs"
						id="crossings-options--showDiffs"
						label={t('racePage.showDiffs')}
						value="showDiffs"
						selected={state.showDiffs}
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
					<CheckboxOptionBox
						name="autoScroll"
						id="crossings-options--autoScroll"
						label={t('racePage.autoScroll')}
						value="autoScroll"
						selected={state.autoScroll}
						onChange={handleOptionChange}
					/>
				</ul>
			)}
			<CrossingsList

				bestLapCrossingId={bestLapCrossingId}
				crossings={crossings}

				showIgnored={state.showIgnored}
				barrierId={state.barrierId}
				showCheckpoints={state.showCheckpoints}

				showAbsoluteTime={state.showAbsoluteTime}
				showDiff={state.showDiffs}
				showDebugInfo={state.showDebugInfo}

				updateCrossing={updateCrossing}
				// onUpdateCrossingTeam={
				// 	interactive && showTeamSetter && isDefined(updateCrossing)
				// 		? handleUpdateCrossing : undefined
				// }
				onUpdateCrossingIgnored={
					interactive && isDefined(updateCrossing)
						? handleUpdateCrossing : undefined
				}
				onUpdateCrossingInterrupted={
					interactive && showMarkInterruptionBtn && isDefined(updateCrossing)
						? handleUpdateCrossing : undefined
				}

				visibleScrollbar={interactive}
				autoScroll={interactive ? state.autoScroll : true}
				setAutoScroll={interactive ? setAutoScroll : undefined}

			/>
		</div>
	);

};

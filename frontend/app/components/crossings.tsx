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

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CheckboxOptionBox, RadioOptionBox } from './inputs';


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
			{(showAbsoluteTime || ignored || start) && (
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

	bestLapCrossingId: number;
	crossings: EnhancedCrossing[],

	showIgnored: boolean;
	barrierId?: number;
	showAbsoluteTime?: boolean;
	showDebugInfo?: boolean;

	onUpdateCrossingTeam?: ButtonProps['onClick'];
	onUpdateCrossingIgnored?: ButtonProps['onClick'];

	visibleScrollbar?: boolean;
	autoScroll?: boolean;
	setAutoScroll?: (autoScroll: boolean) => void;

}

export const CrossingsList = (
	{

		bestLapCrossingId,
		crossings,

		showIgnored,
		barrierId,
		showAbsoluteTime,
		showDebugInfo,

		onUpdateCrossingTeam,
		onUpdateCrossingIgnored,

		visibleScrollbar = true,
		autoScroll = true,
		setAutoScroll,

	}: CrossingsListProps,
) => {

	const filter = useMemo(() => {

		const f: Parameters<Array<EnhancedCrossing>['filter']>[0][] = [];

		if (!showIgnored) {
			f.push(c => !c.ignored);
		}

		if (isDefined(barrierId)) {
			f.push(c => c.barrierId == barrierId);
		}

		return f;

	}, [showIgnored, barrierId]);

	const cs = isDefined(filter) && filter.length > 0
		? crossings.filter(
			(value, index, array) =>
				filter.every(fn => fn(value, index, array)),
		)
		: crossings; // no filtering needed

	const count = cs.length;

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
	interactive?: boolean;
	barriersFilter?: boolean;
	showTeamSetter?: boolean;
}

interface CrossingsViewState {
	showIgnored: boolean;
	showAbsoluteTime: boolean;
	showDebugInfo: boolean;
	autoScroll: boolean;
	barrierId: number | undefined;
}

export const CrossingsView = (
	{
		bestLapCrossingId,
		crossings,
		updateCrossing,
		interactive = true,
		barriersFilter = false,
		showTeamSetter = false,
	}: CrossingsViewProps,
) => {

	const t = useFormatMessageId();

	const [state, setState] = useState<CrossingsViewState>(() => ({
		showIgnored: interactive,
		showAbsoluteTime: false,
		showDebugInfo: interactive,
		autoScroll: true,
		barrierId: undefined,
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
			|| input.name === 'showAbsoluteTime'
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
			{interactive && (
				<ul className="crossings-view-options">
					{barriersFilter === true && (
						<>
							<RadioOptionBox
								name="barrierId"
								id="crossings-options--barrierId0"
								label={t('racePage.allBarriers')}
								value="0"
								selected={state.barrierId === undefined}
								onChange={handleOptionChange}
							/>
							<RadioOptionBox
								name="barrierId"
								id="crossings-options--barrierId1"
								label={t('racePage.onlyBarrier1')}
								value="1"
								selected={state.barrierId === 1}
								onChange={handleOptionChange}
							/>
							<RadioOptionBox
								name="barrierId"
								id="crossings-options--barrierId2"
								label={t('racePage.onlyBarrier2')}
								value="2"
								selected={state.barrierId === 2}
								onChange={handleOptionChange}
							/>
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
				showAbsoluteTime={state.showAbsoluteTime}
				showDebugInfo={state.showDebugInfo}

				onUpdateCrossingTeam={
					interactive && showTeamSetter && isDefined(updateCrossing)
						? handleUpdateCrossing : undefined
				}
				onUpdateCrossingIgnored={
					interactive && isDefined(updateCrossing)
						? handleUpdateCrossing : undefined
				}

				visibleScrollbar={interactive}
				autoScroll={interactive ? state.autoScroll : true}
				setAutoScroll={interactive ? setAutoScroll : undefined}

			/>
		</div>
	);

};

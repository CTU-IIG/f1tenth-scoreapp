"use strict";

import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { isDefined } from '../helpers/common';


export interface TimeDisplayValueProps {
	name?: string | undefined;
	time: number;
	className?: any;
}

export const TimerDisplayValue = ({ time }: TimeDisplayValueProps) => {

	if (time === -1) {
		return (
			<div className="display-value display-value--disabled">
				<span className="digits">00</span>
				<span className="divider">:</span>
				<span className="digits">00</span>
				<span className="divider">.</span>
				<span className="digits">00</span>
			</div>
		);
	}

	const hh = Math.floor(time / 3600000); // whole hours [0, inf)
	const mm = Math.floor((time / 60000) % 60); // minutes [0, 59]
	const ss = Math.floor((time / 1000) % 60); // seconds [0, 59]
	const cs = Math.floor((time / 10) % 100); // centiseconds (hundredths) [0, 99]

	return (
		<div className={'display-value' + (hh !== 0 ? ' display-value--overflow' : '')}>
			{hh !== 0 && (
				<>
					<span className="digits">{hh}</span>
					<span className="divider">:</span>
				</>
			)}
			<span className="digits">{minTwoDigits(mm)}</span>
			<span className="divider">:</span>
			<span className="digits">{minTwoDigits(ss)}</span>
			<span className="divider">.</span>
			<span className="digits">{minTwoDigits(cs)}</span>
		</div>
	);

};

export interface TimeDisplayProps {
	name?: string | undefined;
	time: number;
	className?: any;
}

export const minTwoDigits = (num: number) => num.toString().padStart(2, '0');

export const TimerDisplay = ({ name, time, className }: TimeDisplayProps) => {

	return (
		<div className={classNames('timer-display', className)}>
			{isDefined(name) && (
				<div className="display-name">
					{name}
				</div>
			)}
			<TimerDisplayValue time={time} />
		</div>
	);

};

export interface ValueDisplayProps {
	name?: string | undefined;
	value: any;
	className?: any;
}

export const ValueDisplay = ({ name, value, className }: ValueDisplayProps) => {

	return (
		<div className={classNames('value-display', className)}>
			{isDefined(name) && (
				<div className="display-name">
					{name}
				</div>
			)}
			<div className="display-value">
				{value}
			</div>
		</div>
	);

};

export interface TimerProps {
	name: string;
	start: number;
	stop?: number | undefined;
	active: boolean;
	className?: any;
}

const isStopped = (currentTime: number, stopTime: number | undefined) =>
	isDefined(stopTime) && stopTime !== -1 && currentTime >= stopTime;

export const Timer = ({ name, start, stop, active, className }: TimerProps) => {

	const [currentTime, setCurrentTime] = useState(() => Date.now());

	// schedule auto-updates using rAF
	// only if the timer is active and the start time is set
	const refreshActive = active && start !== -1;

	useEffect(() => {

		if (!refreshActive || isStopped(Date.now(), stop)) {
			return;
		}

		let didCleanup = false;
		let req: number | null;

		const update = () => {

			if (didCleanup) {
				return;
			}

			const time = Date.now();

			setCurrentTime(time);

			// do not schedule next update if the timer reached the stop time
			if (isStopped(time, stop)) {
				return;
			}

			req = window.requestAnimationFrame(update);

		};

		req = window.requestAnimationFrame(update);

		return () => {

			didCleanup = true;

			if (isDefined(req)) {
				window.cancelAnimationFrame(req);
				req = null;
			}

		};

	}, [refreshActive, stop, setCurrentTime]);

	const diff = start !== -1
		// note: to prevent stale currentTime after refreshActive/stop changes, use Date.now()
		? (isDefined(stop) && stop !== -1 ? stop : Date.now()) - start
		: -1;

	return (
		<TimerDisplay
			className={className}
			name={name}
			time={diff}
		/>
	);

};

export interface RaceTimersProps {
	startTime: number;
	stopTime: number;
	numLaps: number;
	bestLapTime: number;
	currentLapStartTime: number;
	active: boolean;
}

export const RaceTimers = (
	{
		startTime,
		stopTime,
		numLaps,
		bestLapTime,
		currentLapStartTime,
		active,
	}: RaceTimersProps,
) => (
	<div className="timers">
		<Timer
			className="timer--total-time"
			name="Total time:"
			start={startTime}
			stop={stopTime}
			active={active}
		/>
		<ValueDisplay
			className="timer--total-laps"
			name="Total laps:"
			value={numLaps}
		/>
		<TimerDisplay
			className="timer--best-lap-time"
			name="Best lap time:"
			time={bestLapTime}
		/>
		<Timer
			className="timer--lap-time"
			name="Current lap time:"
			start={currentLapStartTime}
			stop={stopTime}
			active={active}
		/>
	</div>
);

"use strict";

import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { isDefined } from '../helpers/common';


export interface TimeDisplayProps {
	name: string;
	time: number;
	className?: any;
}

export const minTwoDigits = (num: number) => num.toString().padStart(2, '0');

export const TimerDisplay = ({ name, time, className }: TimeDisplayProps) => {

	const mm = Math.floor((time / 60000) % 60);
	const ss = Math.floor((time / 1000) % 60);
	const ms = Math.floor((time / 10) % 100);

	return (
		<div className={classNames('timer', className)}>
			<div className="timer-name">
				{name}
			</div>
			<div className="timer-time">
				<span className="digits">{minTwoDigits(mm)}</span>
				<span className="divider">:</span>
				<span className="digits">{minTwoDigits(ss)}</span>
				<span className="divider">.</span>
				<span className="digits">{minTwoDigits(ms)}</span>
			</div>
		</div>
	);

};

export interface TimerProps {
	name: string;
	start: number;
	active: boolean;
	className?: any;
}

export const Timer = ({ name, start, active, className }: TimerProps) => {

	const [currentTime, setCurrentTime] = useState(() => Date.now());

	useEffect(() => {

		if (!active) {
			return;
		}

		let didCleanup = false;
		let req: number | null;

		const update = () => {

			if (didCleanup) {
				return;
			}

			setCurrentTime(Date.now());
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

	}, [active, setCurrentTime]);

	return (
		<TimerDisplay
			className={className}
			name={name}
			time={currentTime - start}
		/>
	);

};

export interface TimersProps {
	raceStartTime: number;
	lapStartTime: number;
	bestLapTime: number;
	active: boolean;
}

export const Timers = ({ raceStartTime, lapStartTime, bestLapTime, active }: TimersProps) => (
	<div className="timers">
		<Timer className="timer--total-time" name="Total time:" start={raceStartTime} active={active} />
		<Timer className="timer--lap-time" name="Lap time:" start={lapStartTime} active={active} />
		<TimerDisplay className="timer--best-lap-time" name="Best lap:" time={bestLapTime} />
	</div>
);

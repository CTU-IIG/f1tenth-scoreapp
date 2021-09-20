"use strict";

import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { isDefined } from '../helpers/common';


export interface TimeDisplayProps {
	name: string;
	time: number;
	className?: any;
}

export const TimeDisplay = ({ name, time, className }: TimeDisplayProps) => (
	<div className={classNames('timer', className)}>
		<span className="timerName">
			{name}
		</span>
		<span className="digits">
        	{("0" + Math.floor((time / 60000) % 60)).slice(-2)}:
      	</span>
		<span className="digits">
        	{("0" + Math.floor((time / 1000) % 60)).slice(-2)}.
      	</span>
		<span className="digits">
        	{("0" + Math.floor((time / 10) % 100)).slice(-2)}
      	</span>
	</div>
);

export interface TimerProps {
	name: string;
	start: number;
	active: boolean;
	className?: any;
}

export const Timer = ({ name, start, active, className }: TimerProps) => {

	const [currentTime, setCurrentTime] = useState(() => Date.now());

	// TODO: more efficient solution (perhaps update the HTML DOM directly?)
	useEffect(() => {

		let interval: number | undefined;

		if (active) {
			interval = window.setInterval(() => {
				setCurrentTime(Date.now());
			}, 100);
		}

		return () => {

			if (isDefined(interval)) {
				window.clearInterval(interval);
			}

		};

	}, [active, setCurrentTime]);

	return (
		<TimeDisplay className={className} name={name} time={currentTime - start} />
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
		<Timer className="total" name="Total time: " start={raceStartTime} active={active} />
		<Timer className="this" name="Lap time: " start={lapStartTime} active={active} />
		<TimeDisplay className="best" name="Best lap: " time={bestLapTime} />
	</div>
);

"use strict";

import React, { useEffect, useMemo, useState } from 'react';


const calculateElapsedTime = (start) => {
	let difference = new Date() - start;
	difference = (difference>5*60*1000) ? 5*60*1000 : difference;
    timeLeft = {
      	minutes: Math.floor((difference / 1000 / 60) % 60),
      	seconds: Math.floor((difference / 1000) % 60)
      	milliseconds: Math.floor((difference / 10) % 100)
    };
}


//name, start, active
export function Timer(props) {
	const [time, setTime] = useState(new Date() - props.start);

	useEffect(() => {
		if (props.active){
  			const timer = setTimeout(() => {
    			setTime(new Date() - props.start);
 			}, 10);
 		}
	});

	return (
		<TimeDisplay name={props.name} time={time} />
	);
}

export function TimeDisplay(props) {
	return (
		<div className="timer">
			<span className="timer_name">
				{props.name}
			</span>
      		<span className="digits">
        		{("0" + Math.floor((props.time / 60000) % 60)).slice(-2)}:
      		</span>
      		<span className="digits">
        		{("0" + Math.floor((props.time / 1000) % 60)).slice(-2)}.
      		</span>
      		<span className="digits">
        		{("0" + ((props.time / 10) % 100)).slice(-2)}
      		</span>
    	</div>
    }
}

export function Timers(props) {
	return (
		<Timer name="Total time: " start={props.raceStartTime} active={props.active}>
		<Timer name="Lap time: " start={props.lapStartTime} active={props.active}>
		<TimerDisplay name="Best lap: " time={props.bestLapTime}>
	);
}




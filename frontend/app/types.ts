"use strict";


export interface AppState {
	locale: string;
	restUrl: string;
	webSocketUrl: string;
	soundEffects: boolean;
}

export interface Trial {
	id: number;
	name: string;
}

"use strict";

// This is an example of implementing WebSocket-based chat app in React.js using Hooks
// TODO: This was implemented only fur learning purposes. Will remove in the future.

import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import Store from '../store/Store';
import Router from '../router/Router';

import { AppState } from '../types';

const ConfigContext = React.createContext<string>('localhost');

export interface RootProps {
	store: Store<AppState>;
	router: Router;
}

// This registers component to WebSocket communication
// received message will cause rerender of the component with updated messages object
const useChat = () => {

	// way to store socket without rerender
	const clientRef = useRef<WebSocket | undefined>(undefined);

	// immutable array of messages, setMessages will trigger component rerender
	const [messages, setMessages] = useState<string[]>([]);

	// creates function addMessage on init
	// addMessage updates messages list
	// used only when new message arrives
	const addMessage = useCallback(
		(message: string) => setMessages(prev => [...prev, message]),
		[setMessages],
	);

	// creates function sendMessage on init
	const sendMessage = useCallback(
		(message: string) => {
			if (clientRef.current?.readyState === WebSocket.OPEN) {
				console.log('sending message', message);
				clientRef.current?.send(message);
			} else {
				console.error('could not send message', clientRef.current);
			}
		},
		[],
	);

	// called only on init (see its deps), opens WebSocket, registers callbacks
	useEffect(() => {

		console.log('subscribing ...');

		const client = new WebSocket('ws://localhost:4000');

		client.onopen = (event) => {
			console.log('ws: open', event);
		};

		client.onclose = (event) => {
			console.log('ws: close', event);
		};

		client.onmessage = (event) => {
			console.log('ws: message', event.data);
			addMessage(event.data);
		};

		client.onerror = (event) => {
			console.error('ws: error', event);
		};

		clientRef.current = client;

		// cleanup function that is called after component is destroyed
		return () => {

			console.log('unsubscribing (closing client)...');

			// 1000 means "The connection successfully completed the purpose for which it was created."
			client.close(1000);
			clientRef.current = undefined;

		};

	}, [addMessage]);

	// returns immutable messages object and set functions
	return {
		messages,
		addMessage,
		sendMessage,
	};

};


const MyChat = (props) => {

	// const { url } = props;

	const url = useContext(ConfigContext);

	const [counter, setCounter] = useState(0);

	const { messages, addMessage, sendMessage } = useChat();


	const handleClick = event => {
		setCounter(pv => pv + 1);
		sendMessage(`counter is ${counter}`);
	};

	return (
		<div>
			chat
			{counter}
			<button onClick={handleClick}>Count!</button>
			<ul>
				{messages.map((message, index) => {
					return <li key={index}>{message}</li>;
				})}
			</ul>
		</div>
	);

};


const Root = ({ store, router }: RootProps) => {

	const [counter, setCounter] = useState(0);
	const [chatActive, setChatActive] = useState(true);

	const handleToggleChatBest = useCallback(event => {
		setChatActive(prevState => !prevState);
	}, [setChatActive]);

	const handleClick = useCallback(event => {
		setCounter(prevState => prevState + 1);
	}, [setCounter]);

	return (
		<div>
			<ConfigContext.Provider value="test">
				my best app: {counter}<br />
				<button onClick={handleClick}>Root count!</button>
				<button onClick={handleToggleChatBest}>Toggle chat</button>
				{chatActive && <MyChat />}
			</ConfigContext.Provider>
		</div>
	);

};

export default Root;


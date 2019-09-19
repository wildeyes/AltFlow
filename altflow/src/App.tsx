import React, { KeyboardEvent } from 'react'
import logo from './logo.svg'
import { observer } from 'mobx-react'
import { observable } from 'mobx'
import useKeyboardShortcuts from 'use-keyboard-shortcuts'

import './index.scss'
import { KeyCode } from './KeyCodes'

interface Bullet {
	title: string
	desc: string
	created: object
	modified: object
	stared: boolean
	children?: Bullet[]
}
const marginConstant = 15
const data = observable({
	list: [
		{
			title: 'מה קורה אחי',
			desc: 'תיאור סתם',
			created: new Date(),
			modified: new Date(),
			stared: false,
			children: [],
		} as Bullet,
	],
})

const App: React.FC = observer(() => {
	return (
		<div className="App">
			<header className="header">
				<div className="star">Star</div>
				<div className="showCompleted">Show completed</div>
				<div className="search">search</div>
				<div className="settings">settings</div>
			</header>
			<section className="content">
				<ul>{data.list.map(toBullet)}</ul>
			</section>
			<footer></footer>
		</div>
	)
})
function toBullet(d: Bullet, i: number) {
	return (
		<li className="bullet" key={i}>
			<input
				data-id={i}
				type="text"
				value={d.title}
				onChange={({ target: { value } }) => (d.title = value)}
				onKeyDown={handleKeyDown}
				tabIndex={i}
				autoFocus
			/>
			{d.children && <ul>{d.children.map(toBullet)}</ul>}
		</li>
	)
}

function handleKeyDown(event: KeyboardEvent) {
	const { target } = event
	switch (event.keyCode) {
		case KeyCode.ENTER: {
			data.list.push(mock())
		}
		// case KeyCode.TAB: {data.list}
	}
}

function mock() {
	return {
		title: '',
		desc: '',
		created: new Date(),
		modified: new Date(),
		stared: false,
		children: [],
	} as Bullet
}

export default App

import { observer } from 'mobx-react'
import React, { useEffect } from 'react'
import './App.scss'
import { Line } from './lib/stores/Line'
import { Line as LineEle } from './lib/components/Line/Line'
import { store as dataStore } from './lib/stores/data'
import { store as uiStore } from './lib/stores/ui'
import classnames from 'classnames'
import { KeyCode } from './lib/browser/KeyCodes'

const App: React.FC = observer(() => {
	useEffect(() => {
		if (dataStore.list.length === 0) {
			console.log('Inserting dummy data.')
			dataStore.home.addChild(new Line({ title: 'Hello World!' }))
		}
	})

	return (
		<div
			className={classnames('app', {
				grabbing: Boolean(uiStore.grabbing),
			})}
			onMouseUp={() => (uiStore.grabbing = null)}
			onKeyDown={({ keyCode }: React.KeyboardEvent) => {
				if (Boolean(uiStore.grabbing) && KeyCode.ESC === keyCode) {
					uiStore.grabbing = null
				}
			}}
		>
			<header className="header">
				<button className="starred">starred</button>
				<button className="showCompleted">Show completed</button>
				<button className="rtl" onClick={() => (uiStore.rtl = !uiStore.rtl)}>
					RTL
				</button>
				<button className="search">search</button>
				<button className="settings">settings</button>
			</header>
			<section
				className="content"
				style={{ direction: uiStore.rtl ? 'rtl' : 'ltr' }}
			>
				<ul>
					{dataStore.list.map((b, i) => (
						<LineEle rtl={uiStore.rtl} index={i} line={b} key={i} />
					))}
				</ul>
			</section>
			<footer></footer>
		</div>
	)
})

export default App

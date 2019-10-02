import { observer } from 'mobx-react'
import React, { useEffect } from 'react'
import './App.scss'
import { LineEle } from './lib/components/Line/Line'
import { Line, store } from './lib/store'

const App: React.FC = observer(() => {
	useEffect(() => {
		if (store.list.length === 0) {
			console.log('Inserting dummy data.')
			store.list.push(Line({ title: 'Hello World!' }))
		}
	})

	return (
		<div className="App">
			<header className="header">
				<button className="starred">starred</button>
				<button className="showCompleted">Show completed</button>
				<button className="rtl" onClick={() => (store.rtl = !store.rtl)}>
					RTL
				</button>
				<button className="search">search</button>
				<button className="settings">settings</button>
			</header>
			<section
				className="content"
				style={{ direction: store.rtl ? 'rtl' : 'ltr' }}
			>
				<ul>
					{store.list.map((b, i) => (
						<LineEle rtl={store.rtl} index={i} line={b} key={i} />
					))}
				</ul>
			</section>
			<footer></footer>
		</div>
	)
})

export default App

import { observable, reaction, toJS, autorun } from 'mobx'
import { observer } from 'mobx-react'
import React, { useEffect, useState } from 'react'
import {
	BulletEle,
	BulletType,
	createBulletCreator,
	BulletCls,
	BaseBulletCls,
} from './Bullet'
import './index.scss'
import { localstorageKey } from './common'
import { store, Bullet } from './store'

const App: React.FC = observer(() => {
	useEffect(() => {
		if (store.list.length === 0) {
			console.log('Inserting dummy data.')
			store.list.push(Bullet({ title: 'Hello World!' }))
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
						<BulletEle index={i} bullet={b} key={i} />
					))}
				</ul>
			</section>
			<footer></footer>
		</div>
	)
})

export default App

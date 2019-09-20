import { observable, reaction, toJS, autorun } from 'mobx'
import { observer } from 'mobx-react'
import React, { useEffect } from 'react'
import {
	BulletEle,
	BulletType,
	createBulletCreator,
	BulletCls,
	BaseBulletCls,
} from './Bullet'
import './index.scss'

class Store {
	@observable list = [] as BulletType[]
}

const store = new Store()

const Bullet = createBulletCreator(store.list)
const data = JSON.parse(window.localStorage.getItem('__altflow') || '""')

if (data && data.length) {
	console.log('Loaded data...', data)
	;(data as any[]).forEach((d: BaseBulletCls) =>
		store.list.push(BulletCls.fromJSON(store.list, d, undefined))
	)
}

;(window as any)['store'] = store
autorun(() => {
	window.localStorage.setItem('__altflow', JSON.stringify(store.list))
})

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
				<button className="rtl">RTL</button>
				<button className="search">search</button>
				<button className="settings">settings</button>
			</header>
			<section className="content">
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

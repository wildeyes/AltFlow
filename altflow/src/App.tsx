import { observable } from 'mobx'
import { observer } from 'mobx-react'
import React from 'react'
import { Bullet as BulletEle, BulletType, createBulletCreator } from './Bullet'
import './index.scss'

const data = observable({
	list: [] as BulletType[],
})

const Bullet = createBulletCreator(data.list)

data.list.push(Bullet())

const App: React.FC = observer(() => {
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
					{data.list.map((b, i) => (
						<BulletEle index={i} bullet={b} key={i} />
					))}
				</ul>
			</section>
			<footer></footer>
		</div>
	)
})

export default App

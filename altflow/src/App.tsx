import React, { KeyboardEvent } from 'react'
import { observer } from 'mobx-react'
import { observable, autorun, toJS } from 'mobx'

import './index.scss'
import { KeyCode } from './KeyCodes'

const marginConstant = 15
const data = observable({
	list: [] as Bullet[],
})

class Bullet {
	constructor(title: string = '', parentRef?: Bullet) {
		this.title = title
		this._parentRef = parentRef
	}
	@observable title = ''
	@observable desc = ''
	@observable created = new Date()
	@observable modified = new Date()
	@observable starred = false
	@observable children: Bullet[] = []
	private _parentRef?: Bullet = undefined
	set parentRef(parentRef: Bullet | undefined) {
		this._parentRef = parentRef
	}
	get parentRef(): Bullet | undefined {
		return this._parentRef
	}
	get parentList() {
		return (this.parentRef && this.parentRef.children) || data.list
	}
}

data.list.push(new Bullet('מה קורה אחי'))

const App: React.FC = observer(() => {
	return (
		<div className="App">
			<header className="header">
				<button className="star">Star</button>
				<button className="showCompleted">Show completed</button>
				<button className="rtl">RTL</button>
				<button className="search">search</button>
				<button className="settings">settings</button>
			</header>
			<section className="content">
				<ul style={{ marginLeft: `${marginConstant}px` }}>
					{data.list.map(toBullet)}
				</ul>
			</section>
			<footer></footer>
		</div>
	)
})
function toBullet(b: Bullet, i: number) {
	return (
		<li className="bullet" key={i}>
			<input
				data-id={i}
				type="text"
				value={b.title}
				onChange={({ target: { value } }) => (b.title = value)}
				onKeyDown={event => handleKeyDown(event, b)}
				autoFocus
			/>
			{Boolean(b.children.length) && <ul>{b.children.map(toBullet)}</ul>}
		</li>
	)
}

function handleKeyDown(event: KeyboardEvent<HTMLInputElement>, target: Bullet) {
	const {
		currentTarget: { dataset },
		keyCode,
		// altKey,
		shiftKey,
	} = event
	const id = parseInt(dataset.id!)
	const { parentList, parentRef } = target
	// prettier-ignore
	const maps: [number, () => void][] = [
    [KeyCode.ENTER, () => {
			parentList.push(new Bullet('', parentRef || undefined))
		},],
		[KeyCode.TAB, ()=> {
      if (shiftKey) {
        if(!parentRef) return console.log('TBD cute animation showing you cant do that')
        const deleted = parentList.splice(id, 1)[0]
        const grandpaRef = parentRef.parentRef
        const grandpaList = parentRef.parentList
        const parentId = grandpaList.indexOf(parentRef)
        deleted.parentRef = (grandpaRef)
        grandpaList.splice(parentId + 1, 0, target)
			} else {
        if (id === 0) return console.log('TBD cute animation showing you cant do that')
        const deleted = parentList.splice(id, 1)[0]
        deleted.parentRef = (parentList[parentList.length - 1])
				parentList[id - 1].children.push(deleted)
			}
		}],
  ]
	for (const [kbs, fn] of maps) {
		if (kbs === keyCode) {
			fn()
			event.stopPropagation()
			event.preventDefault()
			return false
		}
	}
}

export default App

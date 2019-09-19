import { IObservableObject, observable, reaction } from 'mobx'
import React, { Ref, useRef, KeyboardEvent, useEffect } from 'react'
import { KeyCode } from './KeyCodes'
import { observer } from 'mobx-react-lite'

export const createBulletCreator = (firstList: BulletType[]) => {
	return (args?: Partial<BulletType>) => new BulletCls(firstList, args)
}
export type BulletType = BulletCls

export type Selection = [number, number, 'forward' | 'backward' | 'none']

class BulletCls {
	private firstList: BulletType[]
	public shouldFocus: boolean | Selection
	constructor(
		firstList: BulletType[],
		{ shouldFocus = false, title = '', parent }: Partial<BulletType> = {}
	) {
		this.title = title
		this.firstList = firstList
		this._parent = parent
		this.shouldFocus = shouldFocus
	}
	@observable title = ''
	@observable desc = ''
	@observable created = new Date()
	@observable modified = new Date()
	@observable starred = false
	@observable children: BulletType[] = []

	private _parent?: BulletType = undefined
	set parent(parent: BulletType | undefined) {
		this._parent = parent
	}
	get parent(): BulletType | undefined {
		return this._parent
	}
	get parentList() {
		return (this.parent && this.parent.children) || this.firstList
	}

	handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
		const {
			currentTarget,
			keyCode,
			// altKey,
			shiftKey,
		} = event
		const {
			dataset,
			selectionStart: _start,
			selectionEnd: _end,
			selectionDirection: _direction,
		} = currentTarget
		const { parentList, parent } = this
		const start = _start || 0
		const end = _end || 0
		const direction = _direction || 'none'
		const shouldFocus = [start, end, direction] as Selection
		const maps: [number, () => void][] = [
			[
				KeyCode.ENTER,
				() => {
					const bullet = new BulletCls(this.firstList, {
						shouldFocus: true,
						parent,
					})
					parentList.splice(index + 1, 0, bullet)
				},
			],
			[
				KeyCode.TAB,
				() => {
					let movedBullet
					if (shiftKey) {
						if (!parent) return animateNope()
						movedBullet = parentList.splice(index, 1)[0]
						const grandpa = parent.parent
						const grandpaList = parent.parentList
						const parentId = grandpaList.indexOf(parent)
						movedBullet.parent = grandpa
						grandpaList.splice(parentId + 1, 0, this)
					} else {
						if (index === 0) return animateNope()
						movedBullet = parentList.splice(index, 1)[0]
						movedBullet.parent = parentList[parentList.length - 1]
						parentList[index - 1].children.push(movedBullet)
					}
					movedBullet.shouldFocus = shouldFocus
				},
			],
			[
				KeyCode.UP,
				() => {
					if (index === 0) {
						if (!parent) return animateNope()
						parent.getDOMElement().focus()
					} else {
						if (!parentList[index - 1].children.length) {
							parentList[index - 1].getDOMElement().focus()
						} else {
							let almostSibling = parentList[index - 1]
							while (almostSibling.children.length) {
								let { children } = almostSibling
								almostSibling = children[children.length - 1]
							}
							almostSibling.getDOMElement().focus()
						}
					}
				},
			],
			[
				KeyCode.DOWN,
				() => {
					if (index === parentList.length - 1) {
						if (!parent) return animateNope()
						// let almostSibling =

						parent.getDOMElement().focus()
					} else {
						parentList[index + 1].getDOMElement().focus()
					}
				},
			],
		]
		for (const [kbs, fn] of maps) {
			if (kbs === keyCode) {
				event.stopPropagation()
				event.preventDefault()
				fn()
				return false
			}
		}
	}
	getIdString() {
		return this.created.getTime()
	}
	getDOMElement() {
		return document.querySelector<HTMLInputElement>(
			`[data-id="${this.getIdString()}"]`
		)!
	}
}

function animateNope() {
	console.log('TBD cute animation showing you cant do that')
}

export const Bullet = observer(
	({ index, bullet }: { index: number; bullet: BulletType }) => {
		const ref = useRef<HTMLInputElement>(null)
		useEffect(() => {
			if (bullet.shouldFocus) {
				ref.current!.focus()
				if (typeof bullet.shouldFocus !== 'boolean') {
					const [start, end, direction] = bullet.shouldFocus
					ref.current!.setSelectionRange(start, end, direction)
				}
				bullet.shouldFocus = false
			}
		})
		return (
			<li className="bullet">
				<input
					data-id={bullet.getIdString()}
					type="text"
					value={bullet.title}
					onChange={({ currentTarget: { value } }) => (bullet.title = value)}
					onKeyDown={event => bullet.handleKeyDown(index, event)}
					ref={ref}
				/>
				{Boolean(bullet.children.length) && (
					<ul>
						{bullet.children.map((b, i) => (
							<Bullet index={i} bullet={b} key={i} />
						))}
					</ul>
				)}
			</li>
		)
	}
)

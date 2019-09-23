import { IObservableObject, observable, reaction } from 'mobx'
import React, { Ref, useRef, KeyboardEvent, useEffect } from 'react'
import { KeyCode } from './KeyCodes'
import { observer } from 'mobx-react-lite'
import classnames from 'classnames'
import 'animate.css'
import { animateRtl } from './common'

export const createBulletCreator = (firstList: BulletType[]) => {
	return (args?: Partial<BulletType>) => new BulletCls(firstList, args)
}
export type BulletType = BulletCls

export type Selection = [number, number, 'forward' | 'backward' | 'none']

export type BaseBulletCls = {
	title: string
	desc: string
	created: string
	modified: string
	starred: boolean
	children: BaseBulletCls[]
}

export class BulletCls {
	private firstList: BulletType[]
	public shouldFocus: boolean | Selection
	constructor(
		firstList: BulletType[],
		{
			shouldFocus = false,

			title = '',
			desc = '',
			created = new Date(),
			modified = new Date(),
			starred = false,
			children = [],
			parent = undefined,
		}: Partial<BulletType> = {}
	) {
		this.title = title
		this.desc = desc
		this.created = created
		this.modified = modified
		this.starred = starred
		this.children = children
		// private
		this.firstList = firstList
		this._parent = parent
		this.shouldFocus = shouldFocus
	}

	@observable title = ''
	@observable desc = ''
	@observable created = new Date()
	@observable modified = new Date()
	@observable starred = false
	@observable completed = false
	@observable children: BulletType[] = []

	private _parent?: BulletType = undefined
	set parent(parent: BulletType | undefined) {
		this._parent = parent
	}
	get index() {
		return this.parentList.indexOf(this)
	}
	get parent(): BulletType | undefined {
		return this._parent
	}
	get parentList() {
		return (this.parent && this.parent.children) || this.firstList
	}
	get nextImmediateSibling() {
		if (this.index + 1 < this.parentList.length)
			return this.parentList[this.index + 1]
	}
	get previousImmediateSibling() {
		if (this.index - 1 >= 0) return this.parentList[this.index - 1]
	}
	get nextSibling() {
		const { index, children, parent, parentList } = this
		if (children.length) return children[0]
		else if (index >= parentList.length - 1) {
			if (!parent) return animateNope()
			let currentParent = parent
			let almostSibling = parent.nextImmediateSibling
			while (currentParent && !almostSibling) {
				if (!currentParent.parent) return animateNope()
				currentParent = currentParent.parent
				almostSibling = currentParent.nextImmediateSibling
			}
			return almostSibling!
		} else {
			return parentList[index + 1]
		}
	}
	get previousSibling() {
		const { index, parent, previousImmediateSibling } = this
		if (index === 0) {
			if (!parent) return animateNope()
			return parent
		} else {
			const prev = previousImmediateSibling! // guarded by index === 0
			if (!prev.children.length) {
				return prev
			} else {
				let almostSibling = prev
				while (almostSibling.children.length) {
					let { children } = almostSibling
					almostSibling = children[children.length - 1]
				}
				return almostSibling
			}
		}
	}
	focus() {
		this.getDOMElement().focus()
	}

	handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
		const {
			currentTarget,
			keyCode,
			// altKey,
			shiftKey,
			ctrlKey,
		} = event
		const {
			dataset,
			selectionStart: _start,
			selectionEnd: _end,
			selectionDirection: _direction,
		} = currentTarget
		const start = _start || 0
		const end = _end || 0
		const direction = _direction || 'none'
		const shouldFocus = [start, end, direction] as Selection
		const maps: [number, () => void][] = [
			[
				KeyCode.ENTER,
				() => {
					if (ctrlKey) {
						this.completed = true
						;(function recurse(b: BulletCls) {
							b.children.forEach(bb => {
								bb.completed = true
								recurse(bb)
							})
						})(this)
					} else {
						const { parentList, parent } = this
						const bullet = new BulletCls(this.firstList, {
							shouldFocus: true,
							parent,
						})
						parentList.splice(index + 1, 0, bullet)
					}
				},
			],
			[
				KeyCode.TAB,
				() => {
					const { parentList, parent } = this
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
						movedBullet.parent = parentList[index - 1]
						parentList[index - 1].children.push(movedBullet)
					}
					movedBullet.shouldFocus = shouldFocus
				},
			],
			[
				KeyCode.UP,
				() => {
					const { previousSibling } = this
					if (previousSibling) previousSibling.focus()
					else animateNope()
				},
			],
			[
				KeyCode.DOWN,
				() => {
					const { nextSibling } = this
					if (nextSibling) nextSibling.focus()
					else animateNope()
				},
			],
			[
				KeyCode.BACKSPACE,
				() => {
					const { parentList } = this
					if (!this.title.length) {
						if (this.previousSibling) {
							this.previousSibling.focus()
							parentList.splice(index, 1)
						} else if (this.nextImmediateSibling) {
							this.nextImmediateSibling.focus()
							parentList.splice(index, 1)
						} else if (this.children.length) {
							// TBD make children[0] new parent
						} else {
							animateNope()
						}
						return
					}
					return true
				},
			],
		]
		for (const [kbs, fn] of maps) {
			if (kbs === keyCode) {
				const stopPreventAndEverything = !Boolean(fn())
				if (stopPreventAndEverything) {
					event.stopPropagation()
					event.preventDefault()
				}
				return stopPreventAndEverything
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
	/**
	 * override JSON.stringify
	 */
	toJSON() {
		const { title, desc, created, modified, starred, children } = this
		return {
			title,
			desc,
			created,
			modified,
			starred,
			children,
		}
	}
	/**
	 * base method for rehydration from localstorage
	 */
	static fromJSON(
		firstList: any,
		d: BaseBulletCls,
		parent: BulletCls | undefined
	) {
		const b = new BulletCls(firstList, {
			...d,
			created: new Date(d.created),
			modified: new Date(d.modified),
			children: [],
			parent,
		})

		b.children = d.children.map(d => BulletCls.fromJSON(firstList, d, b))

		return b
	}
}

function animateNope() {
	console.log('TBD cute animation showing you cant do that')
}

export const BulletEle = observer(
	({
		index,
		bullet,
		rtl,
	}: {
		index: number
		rtl: boolean
		bullet: BulletType
	}) => {
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
			<li
				className={classnames('bullet-container', {
					['completed']: bullet.completed,
					starred: bullet.starred,
				})}
			>
				<div className="bullet__content">
					<div className="bullet__bullet" />
					<input
						className={classnames('bullet__title', {
							[`animated ${animateRtl('fadeOut', rtl)}`]: bullet.completed,
						})}
						data-id={bullet.getIdString()}
						value={bullet.title}
						onChange={({ currentTarget: { value } }) => (bullet.title = value)}
						onKeyDown={event => bullet.handleKeyDown(index, event)}
						ref={ref}
					/>
					{Boolean(bullet.children.length) && (
						<ul className="bullet__children">
							{bullet.children.map((b, i) => (
								<BulletEle rtl={rtl} index={i} bullet={b} key={i} />
							))}
						</ul>
					)}
				</div>
			</li>
		)
	}
)

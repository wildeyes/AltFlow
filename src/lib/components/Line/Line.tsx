import 'animate.css'
import classnames from 'classnames'
import { observable } from 'mobx'
import { observer } from 'mobx-react-lite'
import React, { KeyboardEvent, useEffect, useRef, useState } from 'react'
import { KeyCode } from '../../browser/KeyCodes'
import { animateRtl } from '../../common'
import './Line.scss'

export const createLineCreator = (firstList: LineType[]) => {
	return (args?: Partial<LineType>) => new LineCls(firstList, args)
}
export type LineType = LineCls

export type Selection = [number, number, 'forward' | 'backward' | 'none']

export type BaseLineCls = {
	title: string
	desc: string
	created: string
	modified: string
	starred: boolean
	children: BaseLineCls[]
}

export class LineCls {
	private firstList: LineType[]
	public shouldFocus: boolean | Selection
	constructor(
		firstList: LineType[],
		{
			shouldFocus = false,

			title = '',
			desc = '',
			created = new Date(),
			modified = new Date(),
			starred = false,
			children = [],
			parent = undefined,
		}: Partial<LineType> = {}
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
	@observable children: LineType[] = []

	private _parent?: LineType = undefined
	set parent(parent: LineType | undefined) {
		this._parent = parent
	}
	get index() {
		return this.parentList.indexOf(this)
	}
	get parent(): LineType | undefined {
		return this._parent
	}
	get parentList() {
		return (this.parent && this.parent.children) || this.firstList
	}
	get nextImmediateSibling() {
		return this.index + 1 < this.parentList.length
			? this.parentList[this.index + 1]
			: undefined
	}
	get previousImmediateSibling() {
		return this.index - 1 >= 0 ? this.parentList[this.index - 1] : undefined
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
						;(function recurse(b: LineCls) {
							b.children.forEach(bb => {
								bb.completed = true
								recurse(bb)
							})
						})(this)
					} else {
						const { parentList, parent } = this
						const line = new LineCls(this.firstList, {
							shouldFocus: true,
							parent,
						})
						parentList.splice(index + 1, 0, line)
					}
				},
			],
			[
				KeyCode.TAB,
				() => {
					const { parentList, parent } = this
					let movedLine
					if (shiftKey) {
						if (!parent) return animateNope()
						movedLine = parentList.splice(index, 1)[0]
						const grandpa = parent.parent
						const grandpaList = parent.parentList
						const parentId = grandpaList.indexOf(parent)
						movedLine.parent = grandpa
						grandpaList.splice(parentId + 1, 0, this)
					} else {
						if (index === 0) return animateNope()
						movedLine = parentList.splice(index, 1)[0]
						movedLine.parent = parentList[index - 1]
						parentList[index - 1].children.push(movedLine)
					}
					movedLine.shouldFocus = shouldFocus
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
	static fromJSON(firstList: any, d: BaseLineCls, parent: LineCls | undefined) {
		const b = new LineCls(firstList, {
			...d,
			created: new Date(d.created),
			modified: new Date(d.modified),
			children: [],
			parent,
		})

		b.children = d.children.map(d => LineCls.fromJSON(firstList, d, b))

		return b
	}
}

function animateNope() {
	console.log('TBD cute animation showing you cant do that')
}

export const LineEle = observer(
	({ index, line, rtl }: { index: number; rtl: boolean; line: LineType }) => {
		const [overLine, setOverLine] = useState(false)
		const ref = useRef<HTMLInputElement>(null)
		useEffect(() => {
			if (line.shouldFocus) {
				ref.current!.focus()
				if (typeof line.shouldFocus !== 'boolean') {
					const [start, end, direction] = line.shouldFocus
					ref.current!.setSelectionRange(start, end, direction)
				}
				line.shouldFocus = false
			}
		})

		return (
			<li
				className={classnames('line__container', {
					completed: line.completed,
					starred: line.starred,
					overLine,
				})}
			>
				<div className="line__content">
					<div
						className="line__bullet"
						onMouseEnter={() => setOverLine(true)}
						onMouseLeave={() => setOverLine(false)}
					/>
					<input
						className={classnames('line__title', {
							[`animated ${animateRtl('fadeOut', rtl)}`]: line.completed,
						})}
						data-id={line.getIdString()}
						value={line.title}
						onChange={({ currentTarget: { value } }) => (line.title = value)}
						onKeyDown={event => line.handleKeyDown(index, event)}
						ref={ref}
					/>
					{Boolean(line.children.length) && (
						<ul className="line__children">
							{line.children.map((b, i) => (
								<LineEle rtl={rtl} index={i} line={b} key={i} />
							))}
						</ul>
					)}
				</div>
			</li>
		)
	}
)

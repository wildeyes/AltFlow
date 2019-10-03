import 'animate.css'
import { observable, computed } from 'mobx'
import { KeyboardEvent } from 'react'
import { KeyCode } from '../browser/KeyCodes'

export type LineType = Line

export type Selection = [number, number, 'forward' | 'backward' | 'none']

export type BaseLine = {
	title: string
	notes: string
	created: string
	modified: string
	starred: boolean
	children: BaseLine[]
}

export class Line {
	public shouldFocus: boolean | Selection
	constructor({
		shouldFocus = false,
		flags = {
			[FLAG_HOME]: false,
		},
		title = '',
		notes = '',
		created = new Date(),
		modified = new Date(),
		starred = false,
		children = [],
		parent = undefined,
	}: Partial<LineType> = {}) {
		this.flags = flags
		this.title = title
		this.notes = notes
		this.created = created
		this.modified = modified
		this.starred = starred
		this.children = children
		// private
		this._parent = parent
		this.shouldFocus = shouldFocus
	}
	flags = {
		[FLAG_HOME]: false,
	}
	@observable title = ''
	@observable notes = ''
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
		return (this.parent && this.parent.children) || []
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
			if (this.atRootList) return animateNope()
			let currentParent = parent!
			let almostSibling = parent!.nextImmediateSibling
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
			if (this.atRootList) return animateNope()
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
	/**
	 * check if parent is the all father Line
	 */
	get atRootList() {
		return this.parent && this.parent.flags[FLAG_HOME]
	}
	@computed get hierarchy(): Line[] {
		if (this.flags[FLAG_HOME]) return [this]
		if (this.atRootList) return [this.parent!, this]
		return [...this.parent!.hierarchy, this]
	}
	focus() {
		this.getDOMElement().focus()
	}
	createChild(args?: Partial<LineType>) {
		this.addChild(new Line(args))
	}
	addChild(...lineList: Line[]) {
		lineList.forEach(l => {
			this.children.push(l)
			l.parent = this
		})
		return this // chainable
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
						;(function recurse(b: Line) {
							b.children.forEach(bb => {
								bb.completed = true
								recurse(bb)
							})
						})(this)
					} else if (shiftKey) {
					} else {
						const { parentList, parent } = this
						const line = new Line({
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
					const { parentList } = this
					let movedLine
					if (shiftKey) {
						if (this.atRootList) return animateNope()
						movedLine = parentList.splice(index, 1)[0]
						const parent = this.parent!
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
		return {
			title: this.title,
			notes: this.notes,
			created: this.created,
			modified: this.modified,
			starred: this.starred,
			flags: this.flags,
			children: this.children,
		}
	}
	/**
	 * base method for rehydration from localstorage
	 */
	static fromJSON(json: BaseLine, parent: Line | undefined) {
		const obj = new Line({
			...json,
			created: new Date(json.created),
			modified: new Date(json.modified),
			children: [],
			parent,
		})

		obj.children = json.children.map(d => Line.fromJSON(d, obj))

		return obj
	}
}

function animateNope() {
	console.log('TBD cute animation showing you cant do that')
}

export const FLAG_HOME = 'FLAG_HOME'

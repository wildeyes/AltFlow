import { computed, observable } from 'mobx'
import { LineJSONType, ShouldFocus } from '../types'

export class Line {
	public shouldFocus: ShouldFocus
	public addedToSelection: boolean
	constructor({
		shouldFocus = false,
		flags = {
			[FLAG_HOME]: false,
		},
		title = '',
		notes = null,
		created = new Date(),
		modified = new Date(),
		starred = false,
		children = [],
		parent = undefined,
		addedToSelection = false
	}: Partial<Line> = {}) {
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
		this.addedToSelection = addedToSelection
	}
	flags = {
		[FLAG_HOME]: false,
	}
	@observable title = ''
	@observable notes: string | null = null
	@observable created = new Date()
	@observable modified = new Date()
	@observable starred = false
	@observable completed = false
	@observable children: Line[] = []

	private _parent?: Line = undefined
	set parent(parent: Line | undefined) {
		this._parent = parent
	}
	get index() {
		return this.parentList.indexOf(this)
	}
	get parent(): Line | undefined {
		return this._parent
	}
	get parentList() {
		if (!this.parent) throw new Error('what')
		return this.parent.children
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
			if (this.atRootList) return undefined
			let currentParent = parent!
			let almostSibling = parent!.nextImmediateSibling
			while (currentParent && !almostSibling) {
				if (!currentParent.parent) return undefined
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
			if (this.atRootList) return undefined
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
	// list manipulation methods
	selfRemove() {
		this.parentList.splice(this.index, 1)
		this.parent = undefined
	}

	/**
	 * create and return the created child
	 */
	createChild(args?: Partial<Line>) {
		const newline = new Line(args)
		this.addChildAtEnd(newline)
		return newline
	}
	addChildAtEnd(...lineList: Line[]) {
		lineList.forEach(l => {
			this.children.push(l)
			l.parent = this
		})
	}
	addChildAtStart(...lineList: Line[]) {
		lineList.forEach(l => {
			this.children.unshift(l)
			l.parent = this
		})
	}
	addNextSibling(grabbing: Line) {
		if (!this.parent) throw new Error('what')
		grabbing.parent = this.parent
		this.parentList.splice(this.index + 1, 0, grabbing)
	}
	addPreviousSibling(grabbing: Line) {
		if (!this.parent) throw new Error('what')
		grabbing.parent = this.parent
		this.parentList.splice(this.index, 0, grabbing)
	}

	getIdString() {
		return this.created.getTime()
	}
	focus() {
		this.getInputDOMElement().focus()
	}
	getInputDOMElement() {
		return document.querySelector<HTMLInputElement>(
			`[data-id="${this.getIdString()}"]`
		)!
	}
	get shouldDisplayNotes() {
		return this.notes !== null
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
	static fromJSON(json: LineJSONType, parent: Line | undefined) {
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

export const FLAG_HOME = 'FLAG_HOME'

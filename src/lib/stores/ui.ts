import { autorun, observable, computed } from 'mobx'
import { store as dataStore } from './data'
import { Line } from './Line'
import { Mouse, DROP_POS } from '../types'
import { flatten } from 'lodash'

export const localstorageKey = '__altflow_ui'

export type MousePosUpdater = (mousePos: Mouse | null) => any
export type DroppingStatus = [Line, DROP_POS]

type TreeState = {
	line: Line
	top: number
	left: number
}
type State = TreeState[]

class Store {
	// settings
	@observable rtl = false
	@observable darkmode = false
	// states
	@observable private grabbing: Line | null = null
	@observable private updateMousePos: (MousePosUpdater) | null = null
	@observable private _doc: Line = dataStore.home
	@observable public droppingStatus: DroppingStatus | null = null
	private DOMTreeState: TreeState[] | null = null

	@computed get isDnd() {
		return Boolean(this.updateMousePos)
	}
	startDnd(grabbing: Line, updateMousePos: MousePosUpdater) {
		this.updateMousePos = updateMousePos
		this.grabbing = grabbing
		console.log('Updating tree state for updateMousePos...')
		this.DOMTreeState = (function recurse(rootline: Line): TreeState[] {
			return flatten(
				rootline.children.map(line => {
					if (grabbing === line) return []
					const {
						left,
						top,
					} = line.getInputDOMElement().getBoundingClientRect()
					return [
						{
							line,
							top,
							left,
						},
						...recurse(line),
					] as TreeState[]
				})
			)
		})(this.doc)
	}
	moveDnd(pos: Mouse) {
		if (this.updateMousePos && this.DOMTreeState) {
			this.updateMousePos(pos)
			const treeState = this.DOMTreeState
			const { x, y } = pos

			let droppingStatus: DroppingStatus | undefined
			// we set this.droppingStatus so that UI knows to show user where he's DnD-ing
			if (treeState && treeState.length) {
				for (let i = treeState.length - 1; i >= 0; i--) {
					const { line, top, left } = treeState[i]
					let direction: DROP_POS | undefined
					if (y > top) {
						direction = left < x ? 'CHILDREN' : 'BOTTOM'
						droppingStatus = [line, direction] as DroppingStatus
					}
					if (
						droppingStatus &&
						!(direction === 'CHILDREN' && line === this.grabbing)
					) {
						this.droppingStatus = droppingStatus
						return
					}
				}
				if (!droppingStatus) {
					const { line } = treeState[0]
					droppingStatus = [line, 'TOP'] as DroppingStatus
				}
			}
		}
	}
	endDnd(cancelDnd = false) {
		if (this.updateMousePos) this.updateMousePos(null)
		this.updateMousePos = null
		if (this.droppingStatus) {
			if (!this.grabbing) throw new Error('what')
			const [line, pos] = this.droppingStatus
			const notDndIntoHimself = line !== this.grabbing

			if (notDndIntoHimself && !cancelDnd) {
				this.grabbing.selfRemove()
				if (pos === 'BOTTOM') {
					line.addNextSibling(this.grabbing)
				} else if (pos === 'CHILDREN') {
					line.addChildAtStart(this.grabbing)
				} else if (pos === 'TOP') {
					line.addPreviousSibling(this.grabbing)
				}
			}
			this.droppingStatus = null
		}
		if (this.DOMTreeState) this.DOMTreeState = null
	}
	setDoc(value: Line | null) {
		if (!value) this._doc = dataStore.home
		else this._doc = value
	}
	get doc(): Line {
		if (this._doc) return this._doc
		else return dataStore.home
	}
	animateNope() {
		console.log('TBD cute animation showing you cant do that')
	}
}

export const store = new Store()

// Load data from local storage and set auto save

const LSstore: any = JSON.parse(
	window.localStorage.getItem(localstorageKey) || '""'
)

if (LSstore) {
	store.rtl = LSstore.rtl
	store.darkmode = LSstore.darkmode
}

;(window as any)['store'] = store
autorun(() => {
	window.localStorage.setItem(
		localstorageKey,
		JSON.stringify({
			rtl: store.rtl,
			darkmode: store.darkmode,
		})
	)
})

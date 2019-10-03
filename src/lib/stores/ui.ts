import { autorun, observable } from 'mobx'
import { store as dataStore } from './data'
import { Line } from './Line'
import { Mouse } from '../types'

export const localstorageKey = '__altflow_ui'

class Store {
	// settings
	@observable rtl = false
	// states
	@observable grabbing: ((mousePos: Mouse | null) => any) | null = null
	@observable private _doc: Line = dataStore.home

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
}

;(window as any)['store'] = store
autorun(() => {
	window.localStorage.setItem(
		localstorageKey,
		JSON.stringify({
			rtl: store.rtl,
		})
	)
})

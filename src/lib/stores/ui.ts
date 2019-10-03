import { autorun, observable } from 'mobx'
import { Line } from './Line'
import { store as dataStore } from './data'

export const localstorageKey = '__altflow_ui'

class Store {
	// settings
	@observable rtl = false
	// states
	@observable grabbing: Line | null = null
	@observable _doc: Line | null = null
	set doc(value: Line | null) {
		this._doc = value
	}
	get doc() {
		return Boolean(this._doc) ? this._doc : dataStore.home
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

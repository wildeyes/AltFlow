import { autorun, computed, observable } from 'mobx'
import { FLAG_HOME, Line } from './Line'
import devManager from './devManager'
// shouldnt import from uiStore
export const localstorageKey = '__altflow_data'

class Store {
	@observable home = new Line({ title: 'Home', flags: { [FLAG_HOME]: true } })
	@computed get list() {
		return this.home.children
	}
}
export type StoreType = Store

export const store = new Store()

// Load data from local storage and set auto save

const LSstore: any = JSON.parse(
	window.localStorage.getItem(localstorageKey) || '""'
)

if (LSstore) {
	store.home = Line.fromJSON(LSstore.home, undefined)
}

;(window as any)['dataStore'] = store
autorun(() => {
	window.localStorage.setItem(
		localstorageKey,
		JSON.stringify({
			home: store.home,
		})
	)
})

if (process.env.NODE_ENV === 'development') {
	devManager.dataStore = store
}

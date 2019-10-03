import { autorun, computed, observable } from 'mobx'
import { FLAG_HOME, Line } from './Line'

export const localstorageKey = '__altflow_data'

class Store {
	@observable home = new Line({ flags: { [FLAG_HOME]: true } })
	@computed get list() {
		return this.home.children
	}
}

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

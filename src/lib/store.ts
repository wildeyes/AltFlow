import { observable, autorun } from 'mobx'
import {
	LineType,
	createLineCreator,
	BaseLineCls,
	LineCls,
} from './components/Line/Line'
import { localstorageKey } from './common'

class Store {
	@observable list = [] as LineType[]
	@observable rtl = false
}

export const store = new Store()
export const Line = createLineCreator(store.list)

// Load data from local storage and set auto save

const LSstore: any = JSON.parse(
	window.localStorage.getItem(localstorageKey) || '""'
)

if (LSstore) {
	LSstore.list.forEach((d: BaseLineCls) =>
		store.list.push(LineCls.fromJSON(store.list, d, undefined))
	)
	store.rtl = LSstore.rtl
}

;(window as any)['store'] = store
autorun(() => {
	window.localStorage.setItem(
		localstorageKey,
		JSON.stringify({
			list: store.list,
			rtl: store.rtl,
		})
	)
})

import { observable, autorun } from 'mobx'
import {
	BulletType,
	createBulletCreator,
	BaseBulletCls,
	BulletCls,
} from './components/Bullet'
import { localstorageKey } from './common'

class Store {
	@observable list = [] as BulletType[]
	@observable rtl = false
}

export const store = new Store()
export const Bullet = createBulletCreator(store.list)

// Load data from local storage and set auto save

const LSstore: any = JSON.parse(
	window.localStorage.getItem(localstorageKey) || '""'
)

if (LSstore) {
	LSstore.list.forEach((d: BaseBulletCls) =>
		store.list.push(BulletCls.fromJSON(store.list, d, undefined))
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

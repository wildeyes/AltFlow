import classnames from 'classnames'
import { observer } from 'mobx-react'
import React, { useEffect } from 'react'

import { KeyCode } from './lib/browser/KeyCodes'
import { Textarea } from './lib/common'
import { AddChildBtn } from './lib/components/AddChildBtn/AddChildBtn'
import { LineEle } from './lib/components/Line/Line'
import { store as dataStore } from './lib/stores/data'
import { FLAG_HOME, Line } from './lib/stores/Line'
import { store as uiStore } from './lib/stores/ui'

const Altflow: React.FC = observer(() => {
	useEffect(() => {
		if (dataStore.list.length === 0) {
			console.log('Inserting dummy data.')
			if (window.location.href.includes('localhost')) {
				const list1 = [
					new Line({ title: '1', created: new Date(new Date().getTime() + 1) }),
					new Line({ title: '2', created: new Date(new Date().getTime() + 2) }),
					new Line({ title: '3', created: new Date(new Date().getTime() + 3) }),
					new Line({ title: '4', created: new Date(new Date().getTime() + 4) }),
					new Line({ title: '5', created: new Date(new Date().getTime() + 5) }),
				]
				const list2 = [
					new Line({
						title: '2.1',
						created: new Date(new Date().getTime() + 11),
					}),
					new Line({
						title: '2.2',
						created: new Date(new Date().getTime() + 12),
					}),
					new Line({
						title: '2.3',
						created: new Date(new Date().getTime() + 13),
					}),
					new Line({
						title: '2.4',
						created: new Date(new Date().getTime() + 14),
					}),
					new Line({
						title: '2.5',
						created: new Date(new Date().getTime() + 15),
					}),
				]
				dataStore.home.addChildAtEnd(...list1)
				list1[1].addChildAtEnd(...list2)
			} else {
				dataStore.home.addChildAtEnd(new Line({ title: 'Hello World!' }))
			}
		}
		window.addEventListener('keydown', ({ keyCode }) => {
			if (KeyCode.ESC === keyCode) {
				if (uiStore.isDnd) uiStore.endDnd(true)
				uiStore.stopMultipleSelect()
				uiStore.clearMultipleSelect()
			}
		})
	})
	return (
		<div
			className={classnames('app', {
				grabbing: uiStore.isDnd,
				darkmode: uiStore.darkmode,
			})}
			onMouseUp={() => {
				uiStore.endDnd()
				uiStore.stopMultipleSelect()
			}}
			onMouseMove={({ clientX: x, clientY: y }) => {
				if (uiStore.isDnd) {
					uiStore.moveDnd({ x, y }) // report mouse pos to update bullet pos
				}
				if (uiStore.isMultipleSelecting) {
					uiStore.moveMultipleSelect({ x, y })
				}
			}}
		>
			<header className="header">
				{/* <button className="starred">starred</button> */}
				<div className="app__breadcrumbs">
					{uiStore.doc.hierarchy.map((l, i) => {
						return (
							<React.Fragment key={i}>
								{i > 0 && '>'}
								<a
									href="#TBD"
									className="app__breadcrumb-title"
									onClick={() => {
										uiStore.setDoc(l)
									}}
								>
									{l.title}
								</a>
							</React.Fragment>
						)
					})}
				</div>
				<button className="showCompleted">Show completed</button>
				<button
					className="darkmode"
					onClick={() => (uiStore.darkmode = !uiStore.darkmode)}
				>
					Dark Mode
				</button>
				<button className="rtl" onClick={() => (uiStore.rtl = !uiStore.rtl)}>
					RTL
				</button>
				<div
					className="g-signin2"
					data-onsuccess="onSignIn"
					data-theme="dark"
				></div>

				{/* <button className="search">search</button>
				<button className="settings">settings</button> */}
			</header>
			<section
				className="content"
				style={{ direction: uiStore.rtl ? 'rtl' : 'ltr' }}
			>
				{uiStore.doc && !uiStore.doc.flags[FLAG_HOME] && (
					<section className="doc">
						<input
							className="doc__title title-input"
							onChange={({
								currentTarget: { value },
							}: React.FormEvent<HTMLInputElement>) =>
								(uiStore.doc.title = value || '')
							}
							value={uiStore.doc.title}
							placeholder="Untitled"
						/>
						{uiStore.doc.shouldDisplayNotes && (
							<Textarea
								className="doc__notes notes-textarea"
								onKeyDown={(e: React.FormEvent) => {}}
								value={uiStore.doc.notes!}
							/>
						)}
					</section>
				)}
				{uiStore.doc.children.map((b, i) => (
					<LineEle rtl={uiStore.rtl} index={i} line={b} key={i} />
				))}
				<AddChildBtn
					onClick={() => uiStore.doc.createChild({ shouldFocus: true })}
				/>
			</section>
			<footer></footer>
		</div>
	)
})
export default Altflow

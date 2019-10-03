import { observer } from 'mobx-react'
import React, { useEffect } from 'react'
import './App.scss'
import { Line, FLAG_HOME } from './lib/stores/Line'
import { LineEle } from './lib/components/Line/Line'
import { store as dataStore } from './lib/stores/data'
import { store as uiStore } from './lib/stores/ui'
import classnames from 'classnames'
import { KeyCode } from './lib/browser/KeyCodes'
import { Textarea } from './lib/common'
import { AddChildBtn } from './lib/components/AddChildBtn/AddChildBtn'

const App: React.FC = observer(() => {
	useEffect(() => {
		if (dataStore.list.length === 0) {
			console.log('Inserting dummy data.')
			dataStore.home.addChild(new Line({ title: 'Hello World!' }))
		}
		window.addEventListener('keydown', ({ keyCode }) => {
			if (uiStore.grabbing && KeyCode.ESC === keyCode) {
				uiStore.grabbing(null)
				uiStore.grabbing = null
			}
		})
	})

	return (
		<div
			className={classnames('app', {
				grabbing: Boolean(uiStore.grabbing),
			})}
			onMouseUp={() => {
				if (uiStore.grabbing) {
					uiStore.grabbing(null)
					uiStore.grabbing = null
				}
			}}
			onMouseMove={({ clientX: x, clientY: y }) => {
				if (uiStore.grabbing) {
					uiStore.grabbing({ x, y })
				}
			}}
		>
			<header className="header">
				<button className="starred">starred</button>
				<div className="app__breadcrumbs">
					{uiStore.doc.hierarchy.map((l, i) => {
						return (
							<React.Fragment key={i}>
								{i > 0 && '>'}
								<a
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
				<button className="rtl" onClick={() => (uiStore.rtl = !uiStore.rtl)}>
					RTL
				</button>
				<button className="search">search</button>
				<button className="settings">settings</button>
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
								currentTarget: { textContent: value },
							}: React.FormEvent) => (uiStore.doc.title = value || '')}
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

export default App

const breadcrumbSeperator = () => (
	<svg width="5" height="8" viewBox="0 0 5 8" fill="none">
		<path
			d="M0 0 L4 4 L0 8"
			stroke="currentColor"
			stroke-linecap="round"
		></path>
	</svg>
)

const starSvg = () => (
	<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
		<path
			d="M9.278,3.513 C9.568,2.906 10.432,2.906 10.722,3.513 L12.261,6.739 C12.378,6.983 12.61,7.152 12.879,7.187 L16.422,7.654 C17.089,7.742 17.356,8.564 16.868,9.028 L14.276,11.488 C14.08,11.675 13.991,11.948 14.04,12.214 L14.691,15.728 C14.813,16.39 14.114,16.898 13.523,16.577 L10.382,14.872 C10.144,14.743 9.856,14.743 9.618,14.872 L6.477,16.577 C5.886,16.898 5.187,16.39 5.309,15.728 L5.96,12.214 C6.009,11.948 5.92,11.675 5.724,11.488 L3.132,9.028 C2.644,8.564 2.911,7.742 3.578,7.654 L7.121,7.187 C7.39,7.152 7.622,6.983 7.739,6.739 L9.278,3.513 Z"
			stroke="currentColor"
			fill="none"
		></path>
	</svg>
)

const searchSvg = () => (
	<svg
		width="20"
		height="20"
		viewBox="0 0 20 20"
		fill="none"
		stroke="currentColor"
		stroke-linecap="round"
	>
		<circle cx="9" cy="9" r="5.5"></circle>
		<path d="M13,13 L16.5,16.5"></path>
	</svg>
)
const cogSvg = () => (
	<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
		<path
			d="M8.493,3.526 C8.493,2.973 8.94,2.526 9.493,2.526 H10.493 C11.045,2.526 11.493,2.973 11.493,3.526 V4.705 C11.911,4.822 12.308,4.988 12.679,5.196 L13.53,4.344 C13.921,3.954 14.554,3.954 14.944,4.344 L15.651,5.052 C16.042,5.442 16.042,6.075 15.651,6.466 L14.802,7.316 C15.009,7.686 15.175,8.084 15.293,8.501 H16.495 C17.047,8.501 17.495,8.949 17.495,9.501 V10.501 C17.495,11.054 17.047,11.501 16.495,11.501 H15.293 C15.174,11.918 15.008,12.315 14.801,12.686 L15.652,13.537 C16.043,13.928 16.043,14.561 15.652,14.951 L14.945,15.658 C14.554,16.049 13.921,16.049 13.53,15.658 L12.677,14.805 C12.307,15.012 11.91,15.178 11.493,15.295 V16.526 C11.493,17.078 11.045,17.526 10.493,17.526 H9.493 C8.94,17.526 8.493,17.078 8.493,16.526 V15.291 C8.078,15.173 7.684,15.008 7.315,14.802 L6.459,15.658 C6.068,16.049 5.436,16.049 5.045,15.658 L4.338,14.951 C3.947,14.561 3.947,13.927 4.338,13.537 L5.195,12.679 C4.989,12.311 4.825,11.916 4.708,11.501 H3.495 C2.942,11.501 2.495,11.054 2.495,10.501 V9.501 C2.495,8.949 2.942,8.501 3.495,8.501 H4.707 C4.824,8.086 4.988,7.691 5.194,7.323 L4.338,6.466 C3.947,6.075 3.947,5.442 4.338,5.052 L5.045,4.345 C5.436,3.954 6.069,3.954 6.459,4.345 L7.314,5.199 C7.683,4.993 8.078,4.827 8.493,4.709 V3.526 Z M10,12.036 C11.125,12.036 12.037,11.124 12.037,10 C12.037,8.875 11.125,7.963 10,7.963 C8.875,7.963 7.963,8.875 7.963,10 C7.963,11.124 8.875,12.036 10,12.036 Z"
			stroke="currentColor"
		></path>
	</svg>
)

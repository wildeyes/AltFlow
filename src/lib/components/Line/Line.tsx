import 'animate.css'
import classnames from 'classnames'
import { observer } from 'mobx-react-lite'
import React, { useEffect, useRef, useState } from 'react'
import { KeyCode } from '../../browser/KeyCodes'
import { animateRtl, Textarea } from '../../common'
import { Line } from '../../stores/Line'
import { store as uiStore } from '../../stores/ui'
import { Selection, ShouldFocus, Mouse } from '../../types'
import { AddChildBtn } from '../AddChildBtn/AddChildBtn'
import './Line.scss'

export const LineEle = observer(
	({ index, line, rtl }: { index: number; rtl: boolean; line: Line }) => {
		const titleRef = useRef<HTMLInputElement>(null)
		const notesRef = useRef<HTMLTextAreaElement>(null)
		const [overLine, setOverLine] = useState(false)
		const [focusTitle, setFocusTitle] = useState<ShouldFocus>(line.shouldFocus)
		const [focusNotes, setFocusNotes] = useState<ShouldFocus>(false)
		const [isEditingNotes, setIsEditingNotes] = useState(false)
		const [mousePos, setMousePos] = useState<Mouse | null>(null)

		useEffect(() => {
			if (focusTitle) {
				line.shouldFocus = false

				titleRef.current!.focus()
				if (typeof focusTitle !== 'boolean') {
					const [start, end, direction] = focusTitle
					titleRef.current!.setSelectionRange(start, end, direction)
				}
				setFocusTitle(false)
			}
			if (focusNotes) {
				notesRef.current!.focus()
				if (typeof focusNotes !== 'boolean') {
					const [start, end, direction] = focusNotes
					notesRef.current!.setSelectionRange(start, end, direction)
				}
				setFocusNotes(false)
			}
		}, [focusTitle, focusNotes])

		function handleKeyDown<T extends HTMLTextAreaElement | HTMLInputElement>(
			index: number,
			event: React.KeyboardEvent<T>
		) {
			const { currentTarget, keyCode, shiftKey, ctrlKey } = event
			const {
				selectionStart: _start,
				selectionEnd: _end,
				selectionDirection: _direction,
			} = currentTarget
			const shouldFocus = [
				_start || 0,
				_end || 0,
				_direction || 'none',
			] as Selection
			const maps: [number, () => void][] = [
				[
					KeyCode.ENTER,
					() => {
						if (ctrlKey) {
							line.completed = true
							;(function recurse(b: Line) {
								b.children.forEach(bb => {
									bb.completed = true
									recurse(bb)
								})
							})(line)
						} else if (shiftKey) {
							if (isEditingNotes) {
								if (!line.notes) line.notes = null
								setFocusTitle(true)
							} else {
								if (!line.notes) line.notes = ''
								setFocusNotes(true)
							}
						} else {
							const { parentList, parent } = line
							const newline = new Line({
								shouldFocus: true,
								parent,
							})
							parentList.splice(index + 1, 0, newline)
						}
					},
				],
				[
					KeyCode.TAB,
					() => {
						const { parentList } = line
						let movedLine
						if (shiftKey) {
							if (line.atRootList) return uiStore.animateNope()
							movedLine = parentList.splice(index, 1)[0]
							const parent = line.parent!
							const grandpa = parent.parent
							const grandpaList = parent.parentList
							const parentId = grandpaList.indexOf(parent)
							movedLine.parent = grandpa
							grandpaList.splice(parentId + 1, 0, line)
						} else {
							if (index === 0) return uiStore.animateNope()
							movedLine = parentList.splice(index, 1)[0]
							movedLine.parent = parentList[index - 1]
							parentList[index - 1].children.push(movedLine)
						}
						movedLine.shouldFocus = shouldFocus
					},
				],
				[
					KeyCode.UP,
					() => {
						const { previousSibling } = line
						if (previousSibling) previousSibling.focus()
						else uiStore.animateNope()
					},
				],
				[
					KeyCode.DOWN,
					() => {
						const { nextSibling } = line
						if (nextSibling) nextSibling.focus()
						else uiStore.animateNope()
					},
				],
				[
					KeyCode.BACKSPACE,
					() => {
						const { parentList } = line
						if (!line.title.length) {
							if (line.previousSibling) {
								line.previousSibling.focus()
								parentList.splice(index, 1)
							} else if (line.nextImmediateSibling) {
								line.nextImmediateSibling.focus()
								parentList.splice(index, 1)
							} else if (line.children.length) {
								// TBD make children[0] new parent
							} else {
								uiStore.animateNope()
							}
							return
						}
						return true
					},
				],
			]
			for (const [kbs, fn] of maps) {
				if (kbs === keyCode) {
					const stopPreventAndEverything = !Boolean(fn())
					if (stopPreventAndEverything) {
						event.stopPropagation()
						event.preventDefault()
					}
					return stopPreventAndEverything
				}
			}
		}

		return (
			<div
				className={classnames('line__container', {
					completed: line.completed,
					starred: line.starred,
					overLine: overLine && !uiStore.grabbing,
				})}
			>
				<div className="line__content">
					<div
						className={classnames('line__bullet', {})}
						onMouseEnter={() => setOverLine(true)}
						onMouseLeave={() => setOverLine(false)}
						onMouseDown={() => {
							uiStore.grabbing = setMousePos
						}}
						style={
							mousePos
								? {
										position: 'fixed',
										top: mousePos.y,
										left: mousePos.x,
								  }
								: undefined
						}
					/>
					<input
						className={classnames('line__title title-input', {
							[`animated ${animateRtl('fadeOut', rtl)}`]: line.completed,
						})}
						data-id={line.getIdString()}
						value={line.title}
						onChange={({ currentTarget: { value } }) => (line.title = value)}
						onKeyDown={event => handleKeyDown(index, event)}
						ref={titleRef}
						onFocus={() => setIsEditingNotes(false)}
					/>
					{line.shouldDisplayNotes && (
						<Textarea
							className="line__notes notes-textarea"
							onChange={({ currentTarget: { value } }) => (line.notes = value)}
							onKeyDown={event => handleKeyDown(index, event)}
							value={line.notes!}
							inputRef={notesRef as any}
							onFocus={() => setIsEditingNotes(true)}
						/>
					)}
					{Boolean(line.children.length) && (
						<div className="line__children">
							{line.children.map((b, i) => (
								<LineEle rtl={rtl} index={i} line={b} key={i} />
							))}
							<AddChildBtn
								onClick={() => line.createChild({ shouldFocus: true })}
								data-id={line.getIdString()}
								className="line__addChildBtn"
							/>
						</div>
					)}
				</div>
			</div>
		)
	}
)

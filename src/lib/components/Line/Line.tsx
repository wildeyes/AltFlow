import classnames from 'classnames'
import { observer } from 'mobx-react-lite'
import React, { useEffect, useRef, useState } from 'react'
import { animateRtl, Textarea } from '../../common'
import { store as uiStore } from '../../stores/ui'
import { LineType } from '../../types'
import './Line.scss'
import { AddChildBtn } from '../AddChildBtn/AddChildBtn'

export const Line = observer(
	({ index, line, rtl }: { index: number; rtl: boolean; line: LineType }) => {
		const [overLine, setOverLine] = useState(false)
		const ref = useRef<HTMLInputElement>(null)
		useEffect(() => {
			if (line.shouldFocus) {
				ref.current!.focus()
				if (typeof line.shouldFocus !== 'boolean') {
					const [start, end, direction] = line.shouldFocus
					ref.current!.setSelectionRange(start, end, direction)
				}
				line.shouldFocus = false
			}
		})

		return (
			<div
				className={classnames('line__container', {
					completed: line.completed,
					starred: line.starred,
					overLine,
				})}
			>
				<div className="line__content">
					<div
						className="line__bullet"
						onMouseEnter={() => setOverLine(true)}
						onMouseLeave={() => setOverLine(false)}
						onClick={() => uiStore.setDoc(line)}
						onMouseDown={() => (uiStore.grabbing = line)}
					/>
					<input
						className={classnames('line__title title-input', {
							[`animated ${animateRtl('fadeOut', rtl)}`]: line.completed,
						})}
						data-id={line.getIdString()}
						value={line.title}
						onChange={({ currentTarget: { value } }) => (line.title = value)}
						onKeyDown={event => line.handleKeyDown(index, event)}
						ref={ref}
					/>
					{line.shouldDisplayNotes && (
						<Textarea
							className="line__notes notes-textarea"
							onChange={({ currentTarget: { value } }) => (line.notes = value)}
							onKeyDown={event => line.handleKeyDown(index, event)}
							value={line.notes!}
						/>
					)}
					{Boolean(line.children.length) && (
						<div className="line__children">
							{line.children.map((b, i) => (
								<Line rtl={rtl} index={i} line={b} key={i} />
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

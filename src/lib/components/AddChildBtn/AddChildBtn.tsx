import React from 'react'
import classnames from 'classnames'

export const AddChildBtn = (props: any) => (
	<svg
		{...props}
		className={classnames('addChildBtn', props.className)}
		viewBox="0 0 20 20"
	>
		<circle cx="10.5" cy="10.5" r="9" fill="#dce0e2"></circle>
		<line
			x1="6"
			y1="10.5"
			x2="15"
			y2="10.5"
			stroke="#b7bcbf"
			stroke-width="1"
		></line>
		<line
			x1="10.5"
			y1="6"
			x2="10.5"
			y2="15"
			stroke="#b7bcbf"
			stroke-width="1"
		></line>
	</svg>
)

/** Type to allow persisting complex selection instead of just focus() */
export type Selection = [number, number, 'forward' | 'backward' | 'none']
/** has boolean to allow unfocused (false) or simply .focus() (true) */
export type ShouldFocus = boolean | Selection
export type LineJSONType = {
	title: string
	notes: string | null
	created: string
	modified: string
	starred: boolean
	children: LineJSONType[]
}

import { Line } from './stores/Line'
export type LineType = Line
export type Selection = [number, number, 'forward' | 'backward' | 'none']
export type LineJSONType = {
	title: string
	notes: string | null
	created: string
	modified: string
	starred: boolean
	children: LineJSONType[]
}

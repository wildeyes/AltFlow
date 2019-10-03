import textArea from 'react-textarea-autosize'
export const Textarea = textArea

export function animateRtl(property: string, rtl: boolean) {
	return rtl ? property + 'Right' : 'Left'
}

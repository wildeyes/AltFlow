export const localstorageKey = '__altflow'

export function animateRtl(property: string, rtl: boolean) {
	return rtl ? property + 'Right' : 'Left'
}

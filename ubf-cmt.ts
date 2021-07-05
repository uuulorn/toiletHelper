import { EventHandler, vElement } from "./ubf"

export function NumInput<T extends Object>(o: T, k: NKeys<T>, options?: {
	view?: (n: number) => string
	onchange?: EventHandler<any, 'change'>
}): vElement<'input', T> {
	let r: vElement<'input', T> = new vElement('input')
	r.addEventListener('change', ({ flush, srcTarget }) => {
		(o[k] as any) = +(srcTarget as HTMLInputElement).value
		flush()
	})

	if (options && options.view) {
		r.setAny({
			value: options.view(o[k] as any)
		})
	} else {
		r.setAny({
			value: o[k]
		})
	}

	if (options && options.onchange) {
		r.addEventListener('change', options.onchange)
	}

	return r

}

export function Input<T extends Object>(o: T, k: SKeys<T>, options?: {
	view?: (n: string) => string
	onchange?: EventHandler<any, 'change'>
}): vElement<'input', T> {
	let r = new vElement<'input', T>('input')
	r.addEventListener('change', ({ flush, srcTarget }) => {
		(o[k] as any) = (srcTarget as HTMLInputElement).value
		flush()
	})

	if (options && options.view) {
		r.setAny({
			value: options.view(o[k] as any)
		})
	} else {
		r.setAny({
			value: o[k]
		})
	}

	if (options && options.onchange) {
		r.addEventListener('change', options.onchange)
	}

	return r
}

export type PickKeyByType<S, Type> = {
	[K in keyof S]: S[K] extends Type ? K : never
}[keyof S]

export function numberObjectInput<T extends Object>(o: T, k: PickKeyByType<T, number>, t: evNames = 'change'): vElement<'input', T> {
	return new vElement<'input', T>('input').setAny({ value: o[k] }).addEventListener(t, ({ srcTarget, flush }) => {
		(o as any)[k] = +srcTarget.value
		flush()
	})
}

export function stringObjectInput<T extends Object>(o: T, k: PickKeyByType<T, string>, t: evNames = 'change'): vElement<'input', T> {
	return new vElement<'input', T>('input').setAny({ value: o[k] }).addEventListener(t, ({ srcTarget, flush }) => {
		(o as any)[k] = (srcTarget as HTMLInputElement).value
		flush()
	})
}

export function boolObjectInput<T extends Object>(o: T, k: PickKeyByType<T, boolean>, t: evNames = 'change'): vElement<'input', T> {
	return new vElement<'input', T>('input').setAny({ checked: o[k] }).addEventListener(t, ({ srcTarget, flush }) => {
		(o as any)[k] = (srcTarget as HTMLInputElement).checked
		flush()
	}).setAttributes({
		type: 'checkbox'
	})
}

export function boolObjectSelect<T extends Object>(o: T, k: PickKeyByType<T, boolean>, [yes, no]: [string, string] = ['是', '否'], t: evNames = 'change'): vElement<'select', T> {
	const r = new vElement<'select', T>('select')
	r.setAny({ value: (o[k] || false) ? yes : no } as Partial<HTMLSelectElement>).addEventListener(t, ({ srcTarget, flush }) => {
		(o as any)[k] = srcTarget.value === yes
		flush()
	}).addChildren([
		new vElement<'option', T>('option').addText(yes),
		new vElement<'option', T>('option').addText(no),
	])
	return r
}

export function dateObjectInput<T extends Object>(o: T, k: PickKeyByType<T, Date | null>, t: evNames = 'change'): vElement<'input', T> {
	return new vElement<'input', T>('input').setAny({ valueAsDate: o[k] }).addEventListener(t, ({ srcTarget, flush }) => {
		(o as any)[k] = srcTarget.valueAsDate
		flush()
	}).setAttributes({
		type: 'date'
	})
}

export function rangeObjectSelect<T extends Object>(o: T, k: PickKeyByType<T, number>, start: number, end: number, t: evNames = 'change'): vElement<'select', T> {
	const r = new vElement<'select', T>('select').setValue(o[k]).addEventListener(t, ({ flush, srcTarget }) => {
		(o as any)[k] = +srcTarget.value
		flush()
	})
	for (let i = start; i <= end; i++) {
		r.addChild(new vElement<'option', T>('option').addText(i.toString()))
	}
	return r
}

export function numberMapInput<K, T extends Map<K, number>>(o: T, k: K, t: evNames = 'change'): vElement<'input', T> {
	return new vElement<'input', T>('input').setAny({ value: Number(o.get(k)) }).addEventListener(t, ({ srcTarget, flush }) => {
		o.set(k, +srcTarget.value)
		flush()
	})
}

export function stringMapInput<K, T extends Map<K, string>>(o: T, k: K, t: evNames = 'change'): vElement<'input', T> {
	return new vElement<'input', T>('input').setAny({ value: o.get(k) || '' }).addEventListener(t, ({ srcTarget, flush }) => {
		o.set(k, (srcTarget as HTMLInputElement).value)
		flush()
	})
}

export function boolMapInput<K, T extends Map<K, boolean>>(o: T, k: K, t: evNames = 'change'): vElement<'input', T> {
	return new vElement<'input', T>('input').setAny({ checked: o.get(k) || false }).addEventListener(t, ({ srcTarget, flush }) => {
		o.set(k, (srcTarget as HTMLInputElement).checked)
		flush()
	}).setAttributes({
		type: 'checkbox'
	})
}

export function setInput<K, T extends Set<K>>(o: T, k: K, t: evNames = 'change'): vElement<'input', T> {
	return new vElement<'input', T>('input').setAny({ checked: o.has(k) }).addEventListener(t, ({ srcTarget, flush }) => {
		if ((srcTarget as HTMLInputElement).checked) {
			o.add(k)
		} else {
			o.delete(k)
		}
		flush()
	}).setAttributes({
		type: 'checkbox'
	})
}

export function stringMapSelect<K, T extends Map<K, string>>(o: T, k: K, options: string[], t: evNames = 'change'): vElement<'select', T> {
	const r = new vElement<'select', T>('select')
	r.setAny({ value: o.get(k) || '' }).addEventListener(t, ({ srcTarget, flush }) => {
		o.set(k, (srcTarget as HTMLSelectElement).value)
		flush()
	})
	for (let option of options) {
		let u = new vElement<'option', T>('option')
		r.addChild(u.addText(option))
	}
	return r
}

export function numberMapSelect<K, T extends Map<K, number>>(o: T, k: K, options: number[], t: evNames = 'change'): vElement<'select', T> {
	const r = new vElement<'select', T>('select')
	r.setAny({ value: Number(o.get(k)).toString() }).addEventListener(t, ({ srcTarget, flush }) => {
		o.set(k, +srcTarget.value)
		flush()
	})
	for (let option of options) {
		let u = new vElement<'option', T>('option')
		r.addChild(u.addText(option + ''))
	}
	return r
}

export function boolMapSelect<K, T extends Map<K, boolean>>(o: T, k: K, [yes, no]: [string, string] = ['是', '否'], t: evNames = 'change'): vElement<'select', T> {
	const r = new vElement<'select', T>('select')
	r.setAny({ value: (o.get(k) || false) ? yes : no } as Partial<HTMLSelectElement>).addEventListener(t, ({ srcTarget, flush }) => {
		o.set(k, srcTarget.value === yes)
		flush()
	}).addChildren([
		new vElement<'option', T>('option').addText(yes),
		new vElement<'option', T>('option').addText(no),
	])
	return r
}

export function stringObjectSelect<T extends Object>(o: T, k: PickKeyByType<T, string>, texts: string[], values: string[], t: evNames = 'change'): vElement<'select', T> {
	if (texts.length !== values.length) {
		throw new Error('Error when generate string mapped SELECT:dismatched sizes of texts and options.')
	}
	if (texts.length === 0) {
		throw new Error('Error when generate string mapped SELECT:the size of texts should not be 0.')
	}
	const r = new vElement<'select', T>('select').setValue(o[k]).addEventListener(t, ({ flush, srcTarget }) => {
		(o as any)[k] = srcTarget.value
		flush()
	})
	for (let i = 0, l = values.length; i < l; i++) {
		r.addChild(new vElement<'option', T>('option').addText(texts[i]).setAttributes({ value: values[i] }))
	}
	return r
}


export function divBlock<T extends Object>({ z = 9999999, st = false, bgColor = 'black', opacity = 0.5, width = '3000px', height = '3000px' }: {
	z?: number
	st?: boolean,
	bgColor?: string,
	opacity?: number,
	width?: string | number,
	height?: string | number,
}): vElement<'div', T> {
	return new vElement<'div', T>('div').setStyle({
		display: st ? 'block' : 'none',
		position: 'fixed',
		zIndex: z,
		top: 0,
		left: 0,
		width: typeof width === 'string' ? width : width + 'px',
		height: typeof height === 'string' ? height : height + 'px',
		background: bgColor,
		opacity: opacity
	})
}

type evNames = keyof DocumentEventMap;

type SKeys<T> = {
	[k in keyof T]: T[k] extends string ? k : never
}[keyof T]

type NKeys<T> = {
	[k in keyof T]: T[k] extends number ? k : never
}[keyof T]


/*少用keyof,性能问题严重(体感搭配引号使用时更严重)*/
/*行数过多也会导致严重的性能问题*/
/*type AttributesOf<T extends HTMLElement = HTMLElement> = {
	[s in keyof T]?: string
}*/
/*export type TagNames = keyof HTMLElementTagNameMap*/
/*type noReadOnly<T> = {
	-readonly [K in keyof T]: T[K]
}*/
/*
let a:vElement<any>
typeof a.tag //string
*/
/*type SelectFromUnion<Union extends symbol | number | string, Unit> = Value<{
	[K in Union]: K extends Unit ? K : never
}>*/
/*type Value<T> = T[keyof T]*/
/*type Num<T extends Array<any>> = {
	[k in number]: T[k]
}*/
/*type sa<T extends Array<any>> = {
	[k in keyof T]: sb<T[k]>
}
type sb<T> = T extends vElement<any, infer i> ? i : never*/
//export type sf<T extends any[]> = (string | vElement<any, Value<Num<sa<T>>>> | vText)[];
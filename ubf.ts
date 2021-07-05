export type TagNames = keyof HTMLElementTagNameMap
export type EventNames = keyof DocumentEventMap
export type EventHandler<
	D extends Object = Object,
	K extends EventNames = EventNames,
	T extends TagNames = TagNames
	> = (info: EventHandlerArgs<D, DocumentEventMap[K], HTMLElementTagNameMap[T]>) => void
export type EventHandlerArgs<
	D extends Object = Object,
	E extends Event = Event,
	H extends HTMLElement = HTMLElement,
	P extends HTMLElement = HTMLElement>
	= {
		model: D,
		event: E,
		srcTarget: H,
		currentTarget: P,
		watcher: Watcher<D>
		flush: () => void,
	}
export type VStyle = {
	-readonly [k in keyof CSSStyleDeclaration]?: string | null | number | undefined
}

type T0 = string | number | null | undefined
export class vElement<T extends TagNames, D extends Object, G = HTMLElementTagNameMap[T]>{
	tag: T
	attributes: Record<string, string | null | undefined | number> = Object.create(null)
	properties: Record<string, any> = Object.create(null)
	_on: {
		[K in string]?: Array<EventHandler<D, any>>
	} = Object.create(null)
	style: VStyle = Object.create(null)
	children: (vText | vElement<TagNames, any>)[] = []
	$ref: HTMLElement | null = null
	constructor(tag: T) {
		this.tag = tag
	}
	addEventListener<K extends EventNames>(type: K, handler: EventHandler<D, K, T>) {
		if (!this._on[type]) {
			this._on[type] = []
		}
		let g = this._on[type] as (typeof handler)[]
		g.push(handler)
		return this
	}
	addChildren(children: Array<string | vText | vElement<TagNames, any>>) {
		for (let child of children) {
			if (typeof child === 'string') {
				child = new vText(child)
			}
			this.children.push(child)
		}
		return this
	}
	addChild(child: string | vText | vElement<TagNames, any>) {
		if (typeof child === 'string') {
			child = new vText(child)
		}
		this.children.push(child)
		return this
	}
	addText(s: string) {
		this.addChildren([s])
		return this
	}
	setAny(t: Record<string, any>) {
		let { properties } = this
		for (let [key, value] of Object.entries(t)) {
			properties[key] = value
		}
		return this
	}
	//这里若指定t的类型为Partial<HTMLElementTagNames[T]>会卡得要死,可能的原因是引擎为函数体中的类型提示作预演算而HTMLElementTagNames[T]的路径过多而导致性能低下
	setProperties(t: Partial<G>) {
		let { properties } = this
		for (let [key, value] of Object.entries(t)) {
			properties[key] = value
		}
		return this
	}
	setStyle(t: VStyle) {
		let { style } = this
		for (let [key, value] of Object.entries(t)) {
			style[key as any] = value
		}
		return this;
	}
	setValue(v: any) {
		this.properties.value = v
		return this
	}
	setAttributes(t: Record<string, T0> | Record<keyof G, T0>) {
		let { attributes } = this
		for (let [key, value] of Object.entries(t)) {
			attributes[key] = value
		}
		return this
	}
	removeStyle(key: keyof CSSStyleDeclaration) {
		this.style[key] = null
		return this
	}
	removeAttribute(key: string) {
		this.attributes[key] = null
		return this
	}
}
export class vText {
	data: string | number = ''
	$ref: Text | null = null
	constructor(data: string | number = '') {
		this.data = data
	}
}
type Select<U extends any, V extends keyof U, W> = U extends any ? U[V] extends W ? U : never : never
function isNul(item: any): item is undefined | null {
	return (item === null) || (item === void 0)
}
type RootGenerator<D extends Object> = (data: D) => vElement<TagNames, D>
export class Watcher<D extends Object> {
	root: RootGenerator<D> = (data: D) => new vElement('div')
	data: D
	listened: (EventNames)[] = []
	target: HTMLElement | Text | null = null
	flushInterval = 100
	model: D
	flushAfterEvent?= false
	private flushing = false
	private vdomTree: null | vElement<TagNames, D> = null
	private genModel() {
		return new Proxy(this.data, {
			get: (target, key) => {
				if (target && (typeof target === 'object')) {
					this.delayFlush()
				}
				return Reflect.get(target, key)
			},
			set: (target, key, value) => {
				if (value !== Reflect.get(target, key)) {
					Reflect.set(target, key, value)
					this.delayFlush()
				}
				return true
			}
		})
	}
	private delayFlush = () => {
		const t = setInterval(() => {
			if (this._flush()) {
				clearInterval(t)
			}
		}, this.flushInterval)
	}
	flush() {
		this.delayFlush()
	}
	private _flush(): boolean {
		if (!this.flushing) {
			this.flushing = true
			setTimeout(() => {
				this.flushing = false
			}, this.flushInterval)
			if (!this.vdomTree) {
				if (!this.target) {
					throw new Error('no target.')
				}
				//simple replacement at first flushing
				let newTarget: HTMLElement | Text
				let t = this.vdomTree = this.root(this.data)
				try {
					newTarget = rend(t)
				} catch (e) {
					newTarget = document.createTextNode('error appearanced while calling root function.')
				}
				this.target.replaceWith(newTarget)
				this.target = null
			} else {
				/*diff*/
				let newTree = this.root(this.data)
				singleElementDiff(this.vdomTree, newTree)
				this.vdomTree = newTree
			}
		}
		return !this.flushing
	}
	private listenDOMEvent() {
		let f = (type: string) => {
			return (e: Event) => {
				let { target } = e
				const g: EventHandlerArgs<D> = {
					model: this.model,
					event: e,
					srcTarget: target as HTMLElement,
					currentTarget: target as HTMLElement,
					watcher: this,
					flush: this.delayFlush,
				}
				for (let current: HTMLElement | null = target as HTMLElement; current; current = current.parentElement) {
					let $ref: vElement<TagNames, D> = Reflect.get(current, '$ref')
					if ($ref) {
						g.currentTarget = current
						let $on = $ref._on
						if ($on) {
							let ot = $on[type]
							if (ot) {
								for (let ff of ot) {
									ff(g)
								}
							}
						}
					}
				}
				this.flushAfterEvent && this.delayFlush()
			}
		}
		const sT = new Set(this.listened)
		for (let name of sT) {
			document.addEventListener(name, f(name), true)
		}
	}
	constructor(init: Pick<Watcher<D>, 'listened' | 'target' | 'data' | 'root' | 'flushAfterEvent'>) {
		this.listened = init.listened
		this.target = init.target
		this.data = init.data
		this.root = init.root
		this.model = this.genModel()
		this.flushAfterEvent = init.flushAfterEvent
		this.listenDOMEvent()
		this.delayFlush()
	}
}
export function f<D extends Object>() {
	return function h<T extends TagNames>(tag: T, comment: string = '') {
		return new vElement<T, D, HTMLElementTagNameMap[T]>(tag)
	}
}
export type PKT<T, t> = {
	[K in keyof T]: T[K] extends t ? K : never
}[keyof T]
export async function sleep(ms: number, val?: any): Promise<any> {
	return new Promise((resolve) => {
		setTimeout(resolve, ms, val)
	})
}
function shiftRef(ot: vElement<any, any> | vText, nt: vElement<any, any> | vText): HTMLElement | Text | null {
	const r = ot.$ref
	if (r) {
		Reflect.set(r, '$ref', nt)
		nt.$ref = r
		ot.$ref = null
	}
	return r
}
function rend(node: vElement<TagNames, any> | vText): HTMLElement | Text {
	let res: HTMLElement | Text
	if (node instanceof vElement) {
		res = document.createElement(node.tag)
		const { children, style, attributes, properties } = node

		const rst = res.style
		for (const [key, value] of Object.entries(style)) {
			(rst as any)[key] = value
		}

		for (let child of children) {
			res.appendChild(rend(child))
		}

		for (let [key, value] of Object.entries(attributes)) {
			isNul(value) || res.setAttribute(key, value.toString())
		}

		for (let [key, value] of Object.entries(properties)) {
			Reflect.set(res, key, value)
		}
	} else {
		res = document.createTextNode(node.data.toString())
	}
	node.$ref = res
	Reflect.set(res, '$ref', node)
	return res
}
function chidrenDiff(ocs: Array<vElement<TagNames, any> | vText>, ncs: Array<vElement<TagNames, any> | vText>, pr: HTMLElement) {
	let i = 0
	for (const l = Math.min(ocs.length, ncs.length); i < l; i++) {
		singleElementDiff(ocs[i], ncs[i])
	}
	if (ocs.length === ncs.length) {
		return
	}
	if (ocs.length > ncs.length) {
		for (const l = ocs.length; i < l; i++) {
			const c = ocs[i]
			if (c.$ref) {
				Reflect.set(c.$ref, '$ref', null)
				c.$ref.remove()
				c.$ref = null
			}
		}
	} else {
		for (const l = ncs.length; i < l; i++) {
			pr.appendChild(rend(ncs[i]))
		}
	}
}
function attrsDiff(type: 'attributes' | 'styles' | 'properties', ot: vElement<any, any>, nt: vElement<any, any>, $ref: HTMLElement) {
	switch (type) {
		case 'attributes': {
			const keysSet = new Set([...Object.keys(ot.attributes), ...Object.keys(nt.attributes)])
			for (const key of keysSet) {
				const v0 = nt.attributes[key]
				const v1 = ot.attributes[key]
				if (isNul(v0)) {
					$ref.removeAttribute(key)
				} else if (v0 !== v1) {
					$ref.setAttribute(key, v0.toString())
				}
			}
		}
			break
		case 'properties': {
			const keysSet = new Set([...Object.keys(ot.properties), ...Object.keys(nt.properties)])
			for (const key of keysSet) {
				if (key === '$ref') continue
				const v0 = nt.properties[key]
				const v1 = ot.properties[key]
				if (v0 !== v1) {
					Reflect.set($ref, key, v0)
				}
			}
		}
			break
		case 'styles': {
			const keysSet = new Set([...Object.keys(ot.style), ...Object.keys(nt.style)])
			for (const key of keysSet) {
				const v0 = nt.style[key as any]
				const v1 = ot.style[key as any]
				if (isNul(v0)) {
					$ref.style[key as any] = ''
				} else if (v0 !== v1) {
					$ref.style[key as any] = v0.toString()
				}
			}
		}
			break
	}
}
function singleElementDiff(ot: vElement<TagNames, any> | vText, nt: vElement<TagNames, any> | vText) {
	const _ref = shiftRef(ot, nt)
	if (!_ref) return
	if (ot instanceof vElement && nt instanceof vElement && ot.tag === nt.tag) {
		const $ref = _ref as HTMLElement
		attrsDiff('attributes', ot, nt, $ref)
		attrsDiff('styles', ot, nt, $ref)
		attrsDiff('properties', ot, nt, $ref)
		chidrenDiff(ot.children, nt.children, $ref)
	} else if (ot instanceof vText && nt instanceof vText) {
		if (nt.data !== ot.data) {
			(_ref as Text).data = nt.data + ''
		}
	} else {
		_ref.replaceWith(rend(nt))
	}
}
export class vElement {
    constructor(tag) {
        this.attributes = Object.create(null);
        this.properties = Object.create(null);
        this._on = Object.create(null);
        this.style = Object.create(null);
        this.children = [];
        this.$ref = null;
        this.tag = tag;
    }
    addEventListener(type, handler) {
        if (!this._on[type]) {
            this._on[type] = [];
        }
        let g = this._on[type];
        g.push(handler);
        return this;
    }
    addChildren(children) {
        for (let child of children) {
            if (typeof child === 'string') {
                child = new vText(child);
            }
            this.children.push(child);
        }
        return this;
    }
    addChild(child) {
        if (typeof child === 'string') {
            child = new vText(child);
        }
        this.children.push(child);
        return this;
    }
    addText(s) {
        this.addChildren([s]);
        return this;
    }
    setAny(t) {
        let { properties } = this;
        for (let [key, value] of Object.entries(t)) {
            properties[key] = value;
        }
        return this;
    }
    //这里若指定t的类型为Partial<HTMLElementTagNames[T]>会卡得要死,可能的原因是引擎为函数体中的类型提示作预演算而HTMLElementTagNames[T]的路径过多而导致性能低下
    setProperties(t) {
        let { properties } = this;
        for (let [key, value] of Object.entries(t)) {
            properties[key] = value;
        }
        return this;
    }
    setStyle(t) {
        let { style } = this;
        for (let [key, value] of Object.entries(t)) {
            style[key] = value;
        }
        return this;
    }
    setValue(v) {
        this.properties.value = v;
        return this;
    }
    setAttributes(t) {
        let { attributes } = this;
        for (let [key, value] of Object.entries(t)) {
            attributes[key] = value;
        }
        return this;
    }
    removeStyle(key) {
        this.style[key] = null;
        return this;
    }
    removeAttribute(key) {
        this.attributes[key] = null;
        return this;
    }
}
export class vText {
    constructor(data = '') {
        this.data = '';
        this.$ref = null;
        this.data = data;
    }
}
function isNul(item) {
    return (item === null) || (item === void 0);
}
export class Watcher {
    constructor(init) {
        this.root = (data) => new vElement('div');
        this.listened = [];
        this.target = null;
        this.flushInterval = 100;
        this.flushAfterEvent = false;
        this.flushing = false;
        this.vdomTree = null;
        this.delayFlush = () => {
            const t = setInterval(() => {
                if (this._flush()) {
                    clearInterval(t);
                }
            }, this.flushInterval);
        };
        this.listened = init.listened;
        this.target = init.target;
        this.data = init.data;
        this.root = init.root;
        this.model = this.genModel();
        this.flushAfterEvent = init.flushAfterEvent;
        this.listenDOMEvent();
        this.delayFlush();
    }
    genModel() {
        return new Proxy(this.data, {
            get: (target, key) => {
                if (target && (typeof target === 'object')) {
                    this.delayFlush();
                }
                return Reflect.get(target, key);
            },
            set: (target, key, value) => {
                if (value !== Reflect.get(target, key)) {
                    Reflect.set(target, key, value);
                    this.delayFlush();
                }
                return true;
            }
        });
    }
    flush() {
        this.delayFlush();
    }
    _flush() {
        if (!this.flushing) {
            this.flushing = true;
            setTimeout(() => {
                this.flushing = false;
            }, this.flushInterval);
            if (!this.vdomTree) {
                if (!this.target) {
                    throw new Error('no target.');
                }
                //simple replacement at first flushing
                let newTarget;
                let t = this.vdomTree = this.root(this.data);
                try {
                    newTarget = rend(t);
                }
                catch (e) {
                    newTarget = document.createTextNode('error appearanced while calling root function.');
                }
                this.target.replaceWith(newTarget);
                this.target = null;
            }
            else {
                /*diff*/
                let newTree = this.root(this.data);
                singleElementDiff(this.vdomTree, newTree);
                this.vdomTree = newTree;
            }
        }
        return !this.flushing;
    }
    listenDOMEvent() {
        let f = (type) => {
            return (e) => {
                let { target } = e;
                const g = {
                    model: this.model,
                    event: e,
                    srcTarget: target,
                    currentTarget: target,
                    watcher: this,
                    flush: this.delayFlush,
                };
                for (let current = target; current; current = current.parentElement) {
                    let $ref = Reflect.get(current, '$ref');
                    if ($ref) {
                        g.currentTarget = current;
                        let $on = $ref._on;
                        if ($on) {
                            let ot = $on[type];
                            if (ot) {
                                for (let ff of ot) {
                                    ff(g);
                                }
                            }
                        }
                    }
                }
                this.flushAfterEvent && this.delayFlush();
            };
        };
        const sT = new Set(this.listened);
        for (let name of sT) {
            document.addEventListener(name, f(name), true);
        }
    }
}
export function f() {
    return function h(tag, comment = '') {
        return new vElement(tag);
    };
}
export async function sleep(ms, val) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms, val);
    });
}
function shiftRef(ot, nt) {
    const r = ot.$ref;
    if (r) {
        Reflect.set(r, '$ref', nt);
        nt.$ref = r;
        ot.$ref = null;
    }
    return r;
}
function rend(node) {
    let res;
    if (node instanceof vElement) {
        res = document.createElement(node.tag);
        const { children, style, attributes, properties } = node;
        const rst = res.style;
        for (const [key, value] of Object.entries(style)) {
            rst[key] = value;
        }
        for (let child of children) {
            res.appendChild(rend(child));
        }
        for (let [key, value] of Object.entries(attributes)) {
            isNul(value) || res.setAttribute(key, value.toString());
        }
        for (let [key, value] of Object.entries(properties)) {
            Reflect.set(res, key, value);
        }
    }
    else {
        res = document.createTextNode(node.data.toString());
    }
    node.$ref = res;
    Reflect.set(res, '$ref', node);
    return res;
}
function chidrenDiff(ocs, ncs, pr) {
    let i = 0;
    for (const l = Math.min(ocs.length, ncs.length); i < l; i++) {
        singleElementDiff(ocs[i], ncs[i]);
    }
    if (ocs.length === ncs.length) {
        return;
    }
    if (ocs.length > ncs.length) {
        for (const l = ocs.length; i < l; i++) {
            const c = ocs[i];
            if (c.$ref) {
                Reflect.set(c.$ref, '$ref', null);
                c.$ref.remove();
                c.$ref = null;
            }
        }
    }
    else {
        for (const l = ncs.length; i < l; i++) {
            pr.appendChild(rend(ncs[i]));
        }
    }
}
function attrsDiff(type, ot, nt, $ref) {
    switch (type) {
        case 'attributes':
            {
                const keysSet = new Set([...Object.keys(ot.attributes), ...Object.keys(nt.attributes)]);
                for (const key of keysSet) {
                    const v0 = nt.attributes[key];
                    const v1 = ot.attributes[key];
                    if (isNul(v0)) {
                        $ref.removeAttribute(key);
                    }
                    else if (v0 !== v1) {
                        $ref.setAttribute(key, v0.toString());
                    }
                }
            }
            break;
        case 'properties':
            {
                const keysSet = new Set([...Object.keys(ot.properties), ...Object.keys(nt.properties)]);
                for (const key of keysSet) {
                    if (key === '$ref')
                        continue;
                    const v0 = nt.properties[key];
                    const v1 = ot.properties[key];
                    if (v0 !== v1) {
                        Reflect.set($ref, key, v0);
                    }
                }
            }
            break;
        case 'styles':
            {
                const keysSet = new Set([...Object.keys(ot.style), ...Object.keys(nt.style)]);
                for (const key of keysSet) {
                    const v0 = nt.style[key];
                    const v1 = ot.style[key];
                    if (isNul(v0)) {
                        $ref.style[key] = '';
                    }
                    else if (v0 !== v1) {
                        $ref.style[key] = v0.toString();
                    }
                }
            }
            break;
    }
}
function singleElementDiff(ot, nt) {
    const _ref = shiftRef(ot, nt);
    if (!_ref)
        return;
    if (ot instanceof vElement && nt instanceof vElement && ot.tag === nt.tag) {
        const $ref = _ref;
        attrsDiff('attributes', ot, nt, $ref);
        attrsDiff('styles', ot, nt, $ref);
        attrsDiff('properties', ot, nt, $ref);
        chidrenDiff(ot.children, nt.children, $ref);
    }
    else if (ot instanceof vText && nt instanceof vText) {
        if (nt.data !== ot.data) {
            _ref.data = nt.data + '';
        }
    }
    else {
        _ref.replaceWith(rend(nt));
    }
}

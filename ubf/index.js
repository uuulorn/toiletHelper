export class vElement {
    constructor(tag) {
        this.attributes = Object.create(null);
        this.properties = Object.create(null);
        this.$on = Object.create(null);
        this.$once = Object.create(null);
        this.style = Object.create(null);
        this.children = [];
        this.$ref = null;
        this.tag = tag;
    }
    on(type, handler) {
        if (!this.$on[type]) {
            this.$on[type] = [];
        }
        this.$on[type].push(handler);
        return this;
    }
    once(type, handler) {
        if (!this.$once[type]) {
            this.$once[type] = [];
        }
        this.$once[type].push(handler);
        return this;
    }
    emit(ev, info) {
        {
            const m = this.$on[ev];
            if (m && m.length) {
                for (let i = 0, l = m.length; i < l; i++) {
                    m[i](info);
                }
            }
        }
        {
            const m = this.$once[ev];
            if (m && m.length) {
                for (let i = 0, l = m.length; i < l; i++) {
                    m[i](info);
                }
                m.length = 0;
            }
        }
    }
    addEventListener(type, handler) {
        this.on(type, handler);
        return this;
    }
    addClass(c) {
        let oc = (this.attributes.class || '') + ' ' + c;
        let s = new Set(oc.split(/\s/).filter(x => x));
        this.setAttributes({ class: [...s].join(' ') });
        return this;
    }
    addChildren(children) {
        for (let child of children) {
            this.addChild(child);
        }
        return this;
    }
    addChild(child) {
        if (typeof child === 'string') {
            child = new vText(child);
        }
        if (!child) {
            return this;
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
        this.flushMs = 100;
        this.flushAfterEvent = false;
        this.$on = Object.create(null);
        this.$once = Object.create(null);
        this.flushing = false;
        this.vdomTree = null;
        this.flushTimer = null;
        this.delayFlush = () => {
            if (this.flushTimer !== null) {
                return;
            }
            this.flushTimer = setInterval(() => {
                if (this._flush()) {
                    if (this.flushTimer !== null) {
                        clearInterval(this.flushTimer);
                        this.flushTimer = null;
                    }
                }
            }, this.flushMs);
        };
        this.listened = (init.listened || []).concat(['click', 'change']);
        this.target = init.target;
        this.data = init.data;
        this.root = init.root;
        this.model = this.genModel();
        this.flushAfterEvent = !!init.flushAfterEvent;
        this.listenDOMEvent();
        this.delayFlush();
    }
    afterflush(handler) {
        this.on("afterflush", handler);
    }
    on(ev, handler) {
        if (!this.$on[ev]) {
            this.$on[ev] = [];
        }
        this.$on[ev].push(handler);
    }
    once(ev, handler) {
        if (!this.$once[ev]) {
            this.$once[ev] = [];
        }
        this.$once[ev].push(handler);
    }
    emit(ev) {
        {
            const m = this.$on[ev];
            if (m && m.length) {
                for (let i = 0, l = m.length; i < l; i++) {
                    m[i]({
                        model: this.model,
                        eventName: ev,
                        watcher: this
                    });
                }
            }
        }
        {
            const m = this.$once[ev];
            if (m && m.length) {
                for (let i = 0, l = m.length; i < l; i++) {
                    m[i]({
                        model: this.model,
                        eventName: ev,
                        watcher: this
                    });
                }
                m.length = 0;
            }
        }
    }
    genModel() {
        return new Proxy(this.data, {
            get: (target, key) => {
                if (target && (typeof target === 'object')) {
                    this.flush();
                }
                return Reflect.get(target, key);
            },
            set: (target, key, value) => {
                if (value !== Reflect.get(target, key)) {
                    Reflect.set(target, key, value);
                    this.flush();
                }
                return true;
            }
        });
    }
    is_rended() {
        return !!this.vdomTree;
    }
    flush() {
        this.delayFlush();
    }
    _flush() {
        const f = this.flushing;
        if (!f) {
            this.flushing = true;
            setTimeout(() => {
                this.flushing = false;
            }, this.flushMs);
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
            setTimeout(() => this.emit('afterflush'));
        }
        return !f;
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
                    stop: false
                };
                for (let current = target; current; current = current.parentElement) {
                    const $ref = Reflect.get(current, '$ref');
                    if ($ref) {
                        g.currentTarget = current;
                        new Promise(res => res(null)).then(() => (!g.stop) && $ref.emit(type, g));
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
export class vHTML extends vElement {
    constructor(tag, html) {
        super(tag);
        this.html = '';
        this.html = html;
    }
}
export function f() {
    return function h(tag, comment = '') {
        return new vElement(tag);
    };
}
export function g() {
    return function ht(tag, html) {
        return new vHTML(tag, html);
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
        if (node instanceof vHTML) {
            res.innerHTML = node.html;
        }
        else {
            for (const child of children) {
                res.appendChild(rend(child));
            }
        }
        for (let [key, value] of Object.entries(attributes)) {
            isNul(value) || res.setAttribute(key, value + '');
        }
        for (let [key, value] of Object.entries(properties)) {
            Reflect.set(res, key, value);
        }
    }
    else {
        res = document.createTextNode(node.data + '');
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
    const f = () => {
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
                            $ref.setAttribute(key, v0 + '');
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
                            $ref.style[key] = v0 + '';
                        }
                    }
                }
                break;
        }
    };
    new Promise(res => res(void 0)).then(() => f());
}
function singleElementDiff(ot, nt) {
    const _ref = shiftRef(ot, nt);
    if (!_ref)
        return;
    if (nt instanceof vHTML) {
        if (!((ot instanceof vHTML) && (ot.tag === nt.tag) && (ot.html === nt.html))) {
            _ref.replaceWith(rend(nt));
        }
    }
    else if (ot instanceof vElement && nt instanceof vElement && ot.tag === nt.tag) {
        const $ref = _ref;
        chidrenDiff(ot.children, nt.children, $ref);
        attrsDiff('attributes', ot, nt, $ref);
        attrsDiff('styles', ot, nt, $ref);
        attrsDiff('properties', ot, nt, $ref);
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
//# sourceMappingURL=index.js.map

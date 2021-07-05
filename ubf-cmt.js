import { vElement } from "./ubf";
export function NumInput(o, k, options) {
    let r = new vElement('input');
    r.addEventListener('change', ({ flush, srcTarget }) => {
        o[k] = +srcTarget.value;
        flush();
    });
    if (options && options.view) {
        r.setAny({
            value: options.view(o[k])
        });
    }
    else {
        r.setAny({
            value: o[k]
        });
    }
    if (options && options.onchange) {
        r.addEventListener('change', options.onchange);
    }
    return r;
}
export function Input(o, k, options) {
    let r = new vElement('input');
    r.addEventListener('change', ({ flush, srcTarget }) => {
        o[k] = srcTarget.value;
        flush();
    });
    if (options && options.view) {
        r.setAny({
            value: options.view(o[k])
        });
    }
    else {
        r.setAny({
            value: o[k]
        });
    }
    if (options && options.onchange) {
        r.addEventListener('change', options.onchange);
    }
    return r;
}
export function numberObjectInput(o, k, t = 'change') {
    return new vElement('input').setAny({ value: o[k] }).addEventListener(t, ({ srcTarget, flush }) => {
        o[k] = +srcTarget.value;
        flush();
    });
}
export function stringObjectInput(o, k, t = 'change') {
    return new vElement('input').setAny({ value: o[k] }).addEventListener(t, ({ srcTarget, flush }) => {
        o[k] = srcTarget.value;
        flush();
    });
}
export function boolObjectInput(o, k, t = 'change') {
    return new vElement('input').setAny({ checked: o[k] }).addEventListener(t, ({ srcTarget, flush }) => {
        o[k] = srcTarget.checked;
        flush();
    }).setAttributes({
        type: 'checkbox'
    });
}
export function boolObjectSelect(o, k, [yes, no] = ['是', '否'], t = 'change') {
    const r = new vElement('select');
    r.setAny({ value: (o[k] || false) ? yes : no }).addEventListener(t, ({ srcTarget, flush }) => {
        o[k] = srcTarget.value === yes;
        flush();
    }).addChildren([
        new vElement('option').addText(yes),
        new vElement('option').addText(no),
    ]);
    return r;
}
export function dateObjectInput(o, k, t = 'change') {
    return new vElement('input').setAny({ valueAsDate: o[k] }).addEventListener(t, ({ srcTarget, flush }) => {
        o[k] = srcTarget.valueAsDate;
        flush();
    }).setAttributes({
        type: 'date'
    });
}
export function rangeObjectSelect(o, k, start, end, t = 'change') {
    const r = new vElement('select').setValue(o[k]).addEventListener(t, ({ flush, srcTarget }) => {
        o[k] = +srcTarget.value;
        flush();
    });
    for (let i = start; i <= end; i++) {
        r.addChild(new vElement('option').addText(i.toString()));
    }
    return r;
}
export function numberMapInput(o, k, t = 'change') {
    return new vElement('input').setAny({ value: Number(o.get(k)) }).addEventListener(t, ({ srcTarget, flush }) => {
        o.set(k, +srcTarget.value);
        flush();
    });
}
export function stringMapInput(o, k, t = 'change') {
    return new vElement('input').setAny({ value: o.get(k) || '' }).addEventListener(t, ({ srcTarget, flush }) => {
        o.set(k, srcTarget.value);
        flush();
    });
}
export function boolMapInput(o, k, t = 'change') {
    return new vElement('input').setAny({ checked: o.get(k) || false }).addEventListener(t, ({ srcTarget, flush }) => {
        o.set(k, srcTarget.checked);
        flush();
    }).setAttributes({
        type: 'checkbox'
    });
}
export function setInput(o, k, t = 'change') {
    return new vElement('input').setAny({ checked: o.has(k) }).addEventListener(t, ({ srcTarget, flush }) => {
        if (srcTarget.checked) {
            o.add(k);
        }
        else {
            o.delete(k);
        }
        flush();
    }).setAttributes({
        type: 'checkbox'
    });
}
export function stringMapSelect(o, k, options, t = 'change') {
    const r = new vElement('select');
    r.setAny({ value: o.get(k) || '' }).addEventListener(t, ({ srcTarget, flush }) => {
        o.set(k, srcTarget.value);
        flush();
    });
    for (let option of options) {
        let u = new vElement('option');
        r.addChild(u.addText(option));
    }
    return r;
}
export function numberMapSelect(o, k, options, t = 'change') {
    const r = new vElement('select');
    r.setAny({ value: Number(o.get(k)).toString() }).addEventListener(t, ({ srcTarget, flush }) => {
        o.set(k, +srcTarget.value);
        flush();
    });
    for (let option of options) {
        let u = new vElement('option');
        r.addChild(u.addText(option + ''));
    }
    return r;
}
export function boolMapSelect(o, k, [yes, no] = ['是', '否'], t = 'change') {
    const r = new vElement('select');
    r.setAny({ value: (o.get(k) || false) ? yes : no }).addEventListener(t, ({ srcTarget, flush }) => {
        o.set(k, srcTarget.value === yes);
        flush();
    }).addChildren([
        new vElement('option').addText(yes),
        new vElement('option').addText(no),
    ]);
    return r;
}
export function stringObjectSelect(o, k, texts, values, t = 'change') {
    if (texts.length !== values.length) {
        throw new Error('Error when generate string mapped SELECT:dismatched sizes of texts and options.');
    }
    if (texts.length === 0) {
        throw new Error('Error when generate string mapped SELECT:the size of texts should not be 0.');
    }
    const r = new vElement('select').setValue(o[k]).addEventListener(t, ({ flush, srcTarget }) => {
        o[k] = srcTarget.value;
        flush();
    });
    for (let i = 0, l = values.length; i < l; i++) {
        r.addChild(new vElement('option').addText(texts[i]).setAttributes({ value: values[i] }));
    }
    return r;
}
export function divBlock({ z = 9999999, st = false, bgColor = 'black', opacity = 0.5, width = '3000px', height = '3000px' }) {
    return new vElement('div').setStyle({
        display: st ? 'block' : 'none',
        position: 'fixed',
        zIndex: z,
        top: 0,
        left: 0,
        width: typeof width === 'string' ? width : width + 'px',
        height: typeof height === 'string' ? height : height + 'px',
        background: bgColor,
        opacity: opacity
    });
}
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

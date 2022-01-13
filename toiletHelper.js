import { Watcher, f } from './ubf.js';
import { stringObjectInput } from './ubf-cmt.js';
window.onbeforeunload = function (e) {
    return e.returnValue = '1111';
};
function padZero(n) {
    return n.toString().padStart(2, '0');
}
function nowStr() {
    const d = new Date;
    return `${d.getFullYear()}-${padZero(d.getMonth() + 1)}-${padZero(d.getDate())} ${padZero(d.getHours())}:${padZero(d.getMinutes())}:${padZero(d.getSeconds())}`;
}
void async function () {
    const h = f();
    class Data0 {
        constructor() {
            this.image = null;
            this.masterName = '';
            this.houseNo = '';
            this.warningMessage = '';
            this.comment = '';
            this.keepSurname = true;
            this.HouseNoContainedLength = 11;
            this.builtTime = '1990-1999';
            this.floors = 2;
        }
        isReady() {
            return !!this.image && !!this.masterName && !!this.houseNo;
        }
        getFileName() {
            return [
                this.houseNo + '号',
                this.masterName + '户',
                this.builtTime + '建',
                this.floors + '层',
                `[备注:${this.comment}]`
            ].join('_') + '.jpg';
        }
    }
    new Watcher({
        target: document.getElementById('app'),
        root(data) {
            function t({ model }) {
                model.warningMessage = model.isReady() ? '' : '请确保户主、村、照片不为空';
            }
            return h('div').addChildren([
                h('h3').addText('请竖直拍照'),
                h('label').addChildren([
                    h('input').setAttributes({
                        type: 'file',
                        accept: 'image/jpeg'
                    }).addEventListener('change', ({ model, srcTarget }) => {
                        const files = srcTarget.files;
                        if (files && files.length) {
                            model.image = files[0];
                        }
                    }).setStyle({
                        display: 'none'
                    })
                ]).setStyle({
                    display: 'block',
                    height: '50%',
                    width: '90%',
                    border: '5px solid black',
                }).addText(data.image ? data.getFileName() : '点击拍照'),
                h('div').addChildren([
                    '编号保留长度',
                    h('select').addChildren((function () {
                        const res = [];
                        for (let i = 0; i < 12; i++) {
                            res.push(h('option').addText(i + ''));
                        }
                        return res;
                    })()).setValue(data.HouseNoContainedLength).addEventListener('change', ({ model, srcTarget }) => {
                        model.HouseNoContainedLength = +srcTarget.value;
                    })
                ]),
                h('div').addChildren([
                    '建设年代',
                    h('select').addChildren((function () {
                        const res = [];
                        for (const t of [
                            '1959以前',
                            '1960-1969',
                            '1970-1979',
                            '1980-1989',
                            '1990-1999',
                            '2000-2010',
                            '2011-2020',
                            '2021-2022',
                        ]) {
                            res.push(h('option').addText(t));
                        }
                        return res;
                    })()).setValue(data.builtTime).addEventListener('change', ({ model, srcTarget }) => {
                        model.builtTime = srcTarget.value;
                    }),
                    '层数',
                    h('select').addChildren((function () {
                        const res = [];
                        for (let i = 1; i < 7; i++) {
                            res.push(h('option').addText(i + ''));
                        }
                        return res;
                    })()).setValue(data.floors).addEventListener('change', ({ model, srcTarget }) => {
                        model.floors = +srcTarget.value;
                    })
                ]),
                h('div').addChildren([
                    '户主',
                    stringObjectInput(data, 'masterName'),
                    h('button').addText('清除').addEventListener('click', ({ model }) => {
                        model.masterName = '';
                    }),
                ]),
                h('div').addChildren([
                    '编号',
                    stringObjectInput(data, 'houseNo'),
                ]),
                h('button').setStyle({
                    width: '90%',
                    height: '3rem',
                    textAlign: 'center'
                }).addText('保存图片').addEventListener('click', ({ model }) => {
                    if (model.isReady()) {
                        if ((model.masterName.length >= 4) && !(confirm('户主姓名超过4个字,要继续吗'))) {
                            return;
                        }
                        const img = document.createElement('img');
                        img.src = URL.createObjectURL(model.image);
                        img.onload = () => {
                            const canvas = document.createElement('canvas');
                            const zoomRate = 0.25;
                            canvas.width = img.naturalHeight * zoomRate;
                            canvas.height = img.naturalWidth * zoomRate;
                            const ctx = canvas.getContext('2d');
                            if (!ctx) {
                                return alert('运行环境有毛病');
                            }
                            ctx.save();
                            ctx.translate(canvas.width / 2, canvas.height / 2);
                            ctx.rotate(90 * Math.PI / 180);
                            ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, -canvas.height / 2, -canvas.width / 2, img.naturalWidth * zoomRate, img.naturalHeight * zoomRate);
                            ctx.restore();
                            canvas.toBlob((b) => {
                                if (!b) {
                                    return alert('生成图片过程中发生错误,请重试');
                                }
                                const a = document.createElement('a');
                                a.href = URL.createObjectURL(b);
                                a.setAttribute('target', '_blank');
                                a.download = model.getFileName();
                                a.click();
                                //revoke and reset
                                URL.revokeObjectURL(img.src);
                                URL.revokeObjectURL(a.href);
                                model.image = null;
                                img.onload = null;
                                model.masterName = model.keepSurname ? model.masterName[0] : '';
                                model.houseNo = model.houseNo.slice(0, model.HouseNoContainedLength);
                            }, 'image/jpeg', 0.5);
                        };
                    }
                }),
                h('div').addChildren([]),
                h('div').addChildren([
                    '备注:',
                    stringObjectInput(data, 'comment'),
                ]),
                h('h3').addText(data.warningMessage).setStyle({
                    color: 'red',
                    visibility: data.isReady() ? 'hidden' : 'visible'
                })
            ]).addEventListener('change', t).addEventListener('click', t);
        },
        listened: ['change', 'click'],
        data: new Data0,
    });
}();

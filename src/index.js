import * as ubf from "../ubf/index.js";
class Data {
    constructor() {
        this.downloadName = '';
    }
}
const h = ubf.f();
new ubf.Watcher({
    target: document.getElementById('app'),
    root(data) {
        return Components.app(data);
    },
    data: new Data,
    listened: ['loadedmetadata']
});
var Components;
(function (Components) {
    Components.someKeys = Array.from('789456123');
    function app(data) {
        return h('div').addChildren([
            m0(data),
            m1(data)
        ]);
    }
    Components.app = app;
    function m0(data) {
        return h('input').setStyle({ display: 'none' }).setAttributes({
            id: 'cm',
            type: 'file',
            capture: 'camera',
            accept: 'image/jpeg'
        }).on('change', ({ model, srcTarget }) => {
            const file = srcTarget.files?.[0];
            if (!file) {
                return;
            }
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const zoomRate = 0.2;
                canvas.height = img.height * zoomRate;
                canvas.width = img.width * zoomRate;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.scale(zoomRate, zoomRate);
                    ctx.drawImage(img, 0, 0);
                }
                canvas.toBlob(blob => {
                    if (!blob) {
                        return;
                    }
                    const a = document.createElement('a');
                    a.href = URL.createObjectURL(blob);
                    a.download = model.downloadName + '.jpg';
                    a.click();
                    model.downloadName = '';
                }, 'image/jpeg', 0.5);
            };
        });
    }
    function m1(data) {
        return h('div').addChild(h('h1').addText(data.downloadName ? '[序号]' + data.downloadName : '点击[序号]可将其清除').setStyle({
            gridColumn: '1/span 3'
        }).on('click', ({ model }) => {
            model.downloadName = '';
        })).addChildren(Components.someKeys.map(key => {
            return h('button').addText(key).setStyle({
                fontSize: '2rem',
                fontWeight: 'bolder'
            }).on('click', ({ model }) => {
                model.downloadName += key;
            });
        })).addChildren([
            h('button').addText('0').setStyle({
                fontSize: '2rem',
                fontWeight: 'bolder'
            }).on('click', ({ model }) => {
                model.downloadName += '0';
            }),
            h('button').addText('拍照').setStyle({
                fontSize: '2rem',
                fontWeight: 'bolder',
                gridColumn: '2/span 2'
            }).on('click', ({ model }) => {
                if (!model.downloadName) {
                    return alert('请先输入[序号]再拍照!');
                }
                document.getElementById('cm').click();
            }),
        ]).setStyle({
            display: 'grid',
            gridTemplateRows: 'repeat(5,1fr)',
            height: '100%',
            gridTemplateColumns: 'repeat(3,1fr)',
            gap: '1rem'
        });
    }
})(Components || (Components = {}));
//# sourceMappingURL=index.js.map

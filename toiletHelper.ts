import { Watcher, f } from './ubf';
import { stringObjectInput, numberObjectInput, stringObjectSelect } from './ubf-cmt';

window.onbeforeunload = function (e: BeforeUnloadEvent) {
    return e.returnValue = '1111'
}

void async function () {
    function padZero(n: number) {
        return n.toString().padStart(2, '0')
    }

    function nowStr() {
        const d = new Date
        return `${d.getFullYear()}-${padZero(d.getMonth() + 1)}-${padZero(d.getDate())} ${padZero(d.getHours())}:${padZero(d.getMinutes())}:${padZero(d.getSeconds())}`
    }

    const h = f<Data0>();

    class Data0 {
        image: File | null = null
        masterName = ''
        village = ''
        warningMessage = ''
        comment = ''
        keepSurname = true
        isReady() {
            return this.image && this.masterName && this.village
        }
        getFileName(): string {
            return [
                this.masterName + '户',
                this.village + '村',
                `[备注:${this.comment}]`
            ].join('_') + '.webp'
        }
    }

    new Watcher({
        target: document.getElementById('app')!,
        root(data) {
            return h('div').addChildren([
                h('h3').addText('请竖直拍照'),
                h('label').addChildren([
                    h('input').setAttributes({
                        type: 'file',
                        accept: 'image/*'
                    }).addEventListener('change', ({ model, srcTarget }) => {
                        const files = srcTarget.files
                        if (files && files.length) {
                            model.image = files[0]
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
                    '户主',
                    stringObjectInput(data, 'masterName'),
                    h('button').addText('清除').addEventListener('click', ({ model }) => {
                        model.masterName = ''
                    }),
                ]),
                h('div').addChildren([
                    stringObjectInput(data, 'village'),
                    '村'
                ]),
                h('button').setStyle({
                    width: '90%',
                    height: '3rem',
                    textAlign: 'center'
                }).addText('保存图片').addEventListener('click', ({ model }) => {
                    if (model.isReady()) {
                        if ((model.masterName.length >= 4) && !(confirm('户主姓名超过4个字,要继续吗'))) {
                            return
                        }
                        const img = document.createElement('img')
                        img.src = URL.createObjectURL(model.image)
                        img.onload = () => {
                            const canvas = document.createElement('canvas')
                            const zoomRate = 0.25
                            canvas.width = img.naturalHeight * zoomRate
                            canvas.height = img.naturalWidth * zoomRate
                            const ctx = canvas.getContext('2d')
                            if (!ctx) {
                                return alert('运行环境有毛病')
                            }
                            ctx.save()
                            ctx.translate(canvas.width / 2, canvas.height / 2)
                            ctx.rotate(90 * Math.PI / 180)
                            ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, -canvas.height / 2, -canvas.width / 2, img.naturalWidth * zoomRate, img.naturalHeight * zoomRate)
                            ctx.restore()
                            //
                            /*
                            ctx.shadowOffsetX = 2
                            ctx.shadowOffsetY = 2
                            ctx.shadowBlur = 2
                            ctx.fillStyle = "#ffffff"
                            ctx.textBaseline = "middle"
                            ctx.font = "bold 16px sans-serif"
                            ctx.fillText('经度: 112.406976', 15, canvas.height - 120)
                            ctx.fillText('纬度: 22.342256', 15, canvas.height - 95)
                            ctx.fillText('地址: 广东省恩平市牛江镇', 15, canvas.height - 70)
                            ctx.fillText(`时间: ${nowStr()}`, 15, canvas.height - 45)
                            ctx.fillText(`产权人/使用人: ${model.masterBig + model.masterName}`, 15, canvas.height - 20)
                            //
                            */
                            canvas.toBlob((b) => {
                                const a = document.createElement('a')
                                a.href = URL.createObjectURL(b)
                                a.setAttribute('target', '_blank')
                                a.download = model.getFileName()
                                a.click()
                                //revoke and reset
                                URL.revokeObjectURL(img.src)
                                URL.revokeObjectURL(a.href)
                                model.image = null
                                img.onload = null
                                model.masterName = model.keepSurname ? model.masterName[0] : ''
                            }, 'image/jpeg', 0.5)
                        }
                    }
                }),
                h('div').addChildren([
                    '备注:',
                    stringObjectInput(data, 'comment'),
                ]),
                h('h3').addText(data.warningMessage).setStyle({
                    color: 'red',
                    visibility: data.isReady() ? 'hidden' : 'visible'
                })
            ]).addEventListener('change', ({ model }) => {
                model.warningMessage = model.isReady() ? '' : '请确保户主、村、照片不为空'
            }).addEventListener('click', ({ model }) => {
                model.warningMessage = model.isReady() ? '' : '请确保户主、村、照片不为空'
            })
        },
        listened: ['change', 'click'],
        data: new Data0,
    })
}()


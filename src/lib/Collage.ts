import { createCanvas, Image, loadImage } from 'canvas'
import { writeFile, readFile } from 'fs/promises'
import { tmpdir } from 'os'
import { Utils } from './Utils'

export default class Collage {
    util = new Utils()

    constructor(public images: string[]) {}

    public toBuffer = async (): Promise<Buffer> => {
        const canvas = createCanvas(1050, 1800)
        const ctx = canvas.getContext('2d')
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, 1050, 1800)
        for (const [index, image] of (await this.getImages()).entries()) {
            const [x, y] = this.positions[index]
            ctx.drawImage(image, x, y, 350, 450)
        }
        return canvas.toBuffer()
    }

    getImages = async (): Promise<Image[]> => {
        return await Promise.all(
            this.images.map(async (image) => {
                return await (async () => {
                    let i: string | Buffer = image
                    console.log(image)
                    if (image.endsWith('.webm')) image = image.replace('.webm', '.gif')
                    if (image.endsWith('.gif')) {
                        const name = tmpdir().concat('/', Math.random().toString(36).substr(2, 5))
                        const filename = (ext: string) => name.concat('.', ext)
                        await writeFile(filename('gif'), await this.util.getBuffer(image))
                        await this.util.exec(
                            `ffmpeg -i "${filename('gif')}" -vf "select=eq(n\\,0)" -q:v 3 "${filename('png')}"`
                        )
                        i = await readFile(filename('png'))
                        this.util.exec(`rimraf "${filename('gif')}" "${filename('png')}"`)
                    }
                    return await loadImage(i)
                })()
            })
        )
    }

    positions: Array<Array<number>> = [
        [0, 0],
        [350, 0],
        [700, 0],
        [0, 450],
        [350, 450],
        [700, 450],
        [0, 900],
        [350, 900],
        [700, 900],
        [0, 1350],
        [350, 1350],
        [700, 1350]
    ]
}

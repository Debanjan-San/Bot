import cheerio from 'cheerio'
import { WaifuResponse } from '../Types'
import { Utils } from './Utils'

export default class MWL {
    constructor() {}

    public fetchCharacter = async (url: string): Promise<WaifuResponse | undefined> => {
        try {
            const html = await this.utils.fetch(url, {
                Host: 'mywaifulist.moe',
                ...this.utils.heders(),
                Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            })
            const $ = cheerio.load(html as string)

            const name = $('#app > div > div:nth-child(3) > div > div > div.px-3.md\\:px-0 > h1')
                .text()
                .replace(/\n/g, ' ')
                .replace(/\s+/g, ' ')
                .replace('Husbando', '')
                .trim()
            const image_link = $('.h-full.w-full.object-cover.object-center').attr('src') || ''
            const romaji_name = $('#romaji-name').text().replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()
            const gender = $('#waifu-classification').text() === 'Husbando' ? 'Male' : 'Female'
            const original_name = $('#alternate-name').text().replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()
            const appears_in = $('#waifu-core-information > div.mb-4.mt-2.flex.pb-4.md\\:mt-8.lg\\:mt-2 > div > a')
                .map((index, element) => $(element).text().replace(/\n/g, ' ').replace(/\s+/g, ' ').trim())
                .get()
                .join(', ')
            const place_of_origin = $('#origin').text().replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()
            const age = $('#age').text().replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()
            const date_of_birth = $('#birthday').text().replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()
            const height = $('#height').text().replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()
            const weight = $('#weight').text().replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()
            const blood_type = $('#blood-type').text().replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()
            const bust = $('#bust').text().replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()
            const waist = $('#waist').text().replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()
            const hip = $('#hip').text().replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()
            const description = $('#description').text().replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()

            const id = $('head > meta:nth-child(20)').attr('content') ?? ''

            return {
                name,
                image_link,
                romaji_name,
                gender,
                original_name,
                appears_in,
                place_of_origin,
                age,
                date_of_birth,
                id,
                height,
                weight,
                blood_type,
                bust,
                waist,
                hip,
                description
            }
        } catch (err) {
            console.error(err)
            return undefined
        }
    }

    private getMAXPage = async (type: string): Promise<number | undefined> => {
        try {
            const html = await this.utils.fetch('https://mywaifulist.moe/' + type, {
                Host: 'mywaifulist.moe',
                ...this.utils.heders(),
                Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            })
            const $ = cheerio.load(html as string)
            const lastPage = $(
                '#app > div > div:nth-child(3) > div > div > div > div.flex-1.p-2 > nav > div:nth-child(14) > a'
            ).text()
            return parseInt(lastPage)
        } catch (err) {
            console.error(err)
            return undefined
        }
    }

    public random = async (type: 'browse' | 'husbandos'): Promise<WaifuResponse | undefined> => {
        try {
            const MAX_PAGES = await this.getMAXPage(type)
            const randomPage = this.utils.getRandomNumber(1, MAX_PAGES as number)
            const html = await this.utils.fetch(`https://mywaifulist.moe/${type}?page=${randomPage}`, {
                Host: 'mywaifulist.moe',
                ...this.utils.heders(),
                Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            })
            const $ = cheerio.load(html as string)
            const links = $('#app > div > div:nth-child(3) > div > div > div > div.flex-1.p-2 > div > div > div > a')
                .map((index, element) => 'https://mywaifulist.moe' + $(element).attr('href'))
                .get()
            const random = this.utils.getRandomNumber(1, links.length)
            const haigusha = await this.fetchCharacter(links[random])
            return haigusha
        } catch (err) {
            console.error(err)
            return undefined
        }
    }

    public randomCharacter = async (): Promise<WaifuResponse | undefined> => {
        try {
            const html = await this.utils.fetch('https://mywaifulist.moe/random', {
                Host: 'mywaifulist.moe',
                ...this.utils.heders(),
                Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            })
            const $ = cheerio.load(html as string)

            const name = $('#app > div > div:nth-child(3) > div > div > div.px-3.md\\:px-0 > h1')
                .text()
                .replace(/\n/g, ' ')
                .replace(/\s+/g, ' ')
                .trim()
            const romaji_name = $('#romaji-name').text().replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()
            const gender = $('#waifu-classification').text() === 'Husbando' ? 'Male' : 'Female'
            const original_name = $('#alternate-name').text().replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()
            const appears_in = $('#waifu-core-information > div.mb-4.mt-2.flex.pb-4.md\\:mt-8.lg\\:mt-2 > div > a')
                .map((index, element) => $(element).text().replace(/\n/g, ' ').replace(/\s+/g, ' ').trim())
                .get()
                .join(', ')
            const place_of_origin = $('#origin').text().replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()
            const age = $('#age').text().replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()
            const date_of_birth = $('#birthday').text().replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()
            const height = $('#height').text().replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()
            const weight = $('#weight').text().replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()
            const blood_type = $('#blood-type').text().replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()
            const bust = $('#bust').text().replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()
            const waist = $('#waist').text().replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()
            const hip = $('#hip').text().replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()
            const description = $('#description').text().replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()
            const image_link = $('.h-full.w-full.object-cover.object-center').attr('src') ?? ''

            const id = $('head > meta:nth-child(20)').attr('content') ?? ''

            const character: WaifuResponse = {
                name,
                image_link,
                romaji_name,
                gender,
                original_name,
                appears_in,
                place_of_origin,
                age,
                date_of_birth,
                height,
                weight,
                blood_type,
                bust,
                waist,
                id,
                hip,
                description
            }
            return character
        } catch (err) {
            console.error(err)
            return undefined
        }
    }

    public waifuOfDay = async (): Promise<
        | {
              image: string
              name: string
          }
        | undefined
    > => {
        try {
            const html = await this.utils.fetch('https://mywaifulist.moe', {
                Host: 'mywaifulist.moe',
                ...this.utils.heders(),
                Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            })
            const $ = cheerio.load(html as string)
            const image = $('#widget-waifu-of-the-day > a > img').attr('src') ?? ''
            const name = $('#widget-waifu-of-the-day > a > div > h3')
                .text()
                .replace(/\n/g, ' ')
                .replace(/\s+/g, ' ')
                .trim()

            return {
                name,
                image
            }
        } catch (err) {
            console.log(err)
            return undefined
        }
    }

    utils = new Utils()
}

import { IArgs, WaifuResponse } from '../../Types'
import { BaseCommand, Command, Message } from '../../Structures'
import { AnyMessageContent } from '@whiskeysockets/baileys'

@Command('haigusha', {
    description: 'Summons a random anime character to marry',
    cooldown: 15,
    exp: 20,
    category: 'weeb',
    usage: 'haigusha || haigusha --waifu || haigusha --husbando'
})
export default class command extends BaseCommand {
    override execute = async ({ from, message, reply }: Message, { flags }: IArgs): Promise<void> => {
        let haigusha
        if (flags.includes('--waifu'))
            haigusha = await this.client.utils.fetch<WaifuResponse>('https://api.claustai.com/waifu')
        else if (flags.includes('--husbando'))
            haigusha = await this.client.utils.fetch<WaifuResponse>('https://api.claustai.com/husbando')
        else return void reply('Define the type of haigusha using the --waifu/ --husbando flags')
        haigusha.gender = flags.includes('--husbando') ? 'Male' : 'Female'
        this.handler.haigushaResponse.set(from, haigusha)
        let text = `🎐 *Name:* ${haigusha.name}\n\n`
        if (haigusha.original_name && haigusha.original_name !== '')
            text += `🎗 *Original Name:* ${haigusha.original_name}\n\n`
        if (haigusha.age) text += `🍀 *Age:* ${haigusha.age}\n\n`
        text += `🎀 *Gender:* ${haigusha.gender}\n\n🔗 *Appearance:* ${haigusha.appears_in}\n\n❄ *Description:* ${haigusha.description}`
        const buffer = await this.client.utils.getBuffer(haigusha.image_link)
        const buttonMessage = {
            image: buffer,
            caption: text,
            headerType: 4,
            jpegThumbnail: buffer.toString('base64'),
            contextInfo: {
                externalAdReply: {
                    title: haigusha.name,
                    mediaType: 1,
                    thumbnail: buffer,
                    sourceUrl: ''
                }
            }
        }
        return void (await this.client.sendMessage(from, buttonMessage, {
            quoted: message
        }))
    }
}

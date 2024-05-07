import { IArgs, WaifuResponse } from '../../Types'
import { BaseCommand, Command, Message } from '../../Structures'
import MWL from '../../lib/MyWaifuList'

@Command('haigusha', {
    description: 'Summons a random anime character to marry',
    cooldown: 15,
    exp: 20,
    category: 'weeb',
    usage: 'haigusha || haigusha --waifu || haigusha --husbando'
})
export default class command extends BaseCommand {
    override execute = async (
        { from, message }: Message,
        { flags }: IArgs
    ): Promise<void> => {
        const { random, randomCharacter } = new MWL()
        let haigusha
        if (flags.includes('--waifu'))
            haigusha = (await random('browse')) as WaifuResponse
        else if (flags.includes('--husbando'))
            haigusha = (await random('husbandos')) as WaifuResponse
        else haigusha = (await randomCharacter()) as WaifuResponse
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

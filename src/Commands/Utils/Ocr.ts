import { BaseCommand, Command, Message } from '../../Structures'
import { ImgurClient } from 'imgur'
import { proto } from '@whiskeysockets/baileys'

@Command('ocr', {
    description: 'Gets the text from images.',
    usage: 'ocr [quote/caption image]',
    category: 'utils',
    exp: 35,
    cooldown: 45,
    aliases: ['gettext']
})
export default class command extends BaseCommand {
    override execute = async (M: Message): Promise<void> => {
        try {
            const isImageMessage = M.quoted ? M.quoted.type === 'imageMessage' : M.type === 'imageMessage'
            if (!isImageMessage) return void (await M.reply('Quote a image to use the ocr, Baka!'))
            const buffer = await M.downloadMediaMessage(M.quoted?.message as proto.IMessage)
            const imgurClient = new ImgurClient({
                clientId: '66745e931f7c91f'
            })

            const { data } = await imgurClient.upload({
                image: buffer
            })
            const text: {
                ParsedResults: [
                    {
                        ParsedText: string
                    }
                ]
            } = await this.client.utils.fetch(
                `https://api.ocr.space/parse/imageurl?apikey=K86862197988957&url=${data.link}&language=eng&isOverlayRequired=false`
            )
            return void (await M.reply(
                `🔍 *OCR:*\n\n ${text.ParsedResults.map(({ ParsedText }) => ParsedText).join('\n\n ')}`
            ))
        } catch (err) {
            return void (await M.reply('Error!!'))
        }
    }
}

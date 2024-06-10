import { BaseCommand, Command, Message } from '../../Structures'
import { proto } from '@whiskeysockets/baileys'

@Command('removebg', {
    description: 'Removes background from the image.',
    usage: 'rbg [quote/caption image]',
    category: 'utils',
    exp: 35,
    cooldown: 15,
    aliases: ['rgb']
})
export default class command extends BaseCommand {
    override execute = async (M: Message): Promise<void> => {
        try {
            const isImageMessage = M.quoted
                ? M.quoted.type === 'imageMessage'
                : M.type === 'imageMessage'
            if (!isImageMessage)
                return void (await M.reply(
                    'Quote a image to use the removes background, Baka!'
                ))
            const buffer = await M.downloadMediaMessage(
                (!M.quoted
                    ? M.message.message
                    : M.quoted?.message) as proto.IMessage
            )
            const image = (await this.client.utils.removeBackground(
                buffer
            )) as Buffer
            return void (await M.reply(image, 'image'))
        } catch (err) {
            return void (await M.reply('Error!!'))
        }
    }
}

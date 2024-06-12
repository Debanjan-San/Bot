import { BaseCommand, Command, Message } from '../../Structures'
import { proto } from '@whiskeysockets/baileys'

@Command('gc-profile', {
    description: 'To update your group icon.',
    usage: 'gcprofile [quote/caption image]',
    category: 'moderation',
    exp: 35,
    cooldown: 5,
    aliases: ['gcicon']
})
export default class command extends BaseCommand {
    override execute = async (M: Message): Promise<void> => {
        try {
            const isImageMessage = M.quoted
                ? M.quoted.type === 'imageMessage'
                : M.type === 'imageMessage'
            if (!isImageMessage)
                return void (await M.reply(
                    'Quote a image to use it as the group icon, Baka!'
                ))
            const buffer = await M.downloadMediaMessage(
                (!M.quoted
                    ? M.message.message
                    : M.quoted?.message) as proto.IMessage
            )
            return void (await this.client.updateProfilePicture(M.from, buffer))
        } catch (err) {
            return void (await M.reply('Error!!'))
        }
    }
}

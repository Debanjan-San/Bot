import { AnyMessageContent } from '@whiskeysockets/baileys'
import { BaseCommand, Command, Message } from '../../Structures'
import { WaifuResponse } from '../../Types'

@Command('hg', {
    description: "Displays user's haigusha",
    usage: '${helper.config.prefix}hg [tag/quote user]',
    category: 'weeb',
    cooldown: 15,
    exp: 10
})
export default class command extends BaseCommand {
    override execute = async (M: Message): Promise<void> => {
        const users = M.mentioned
        if (M.quoted && !users.includes(M.quoted.sender.jid))
            users.push(M.quoted.sender.jid)
        while (users.length < 1) users.push(M.sender.jid)
        let user = users[0]
        if (M.type === 'buttonsResponseMessage') user = M.sender.jid
        const { haigusha: Haigusha, username: name } =
            await this.client.DB.getUser(user)
        if (!Haigusha.married)
            return void M.reply(
                `${
                    user === M.sender.jid
                        ? "You aren't"
                        : `*@${user.split('@')[0]}* isn't`
                } married to anyone`,
                'text',
                undefined,
                undefined,
                undefined,
                user === M.sender.jid ? undefined : [user]
            )
        let username = this.client.contact.getContact(user).jid
        if (user === M.sender.jid) username = M.sender.username
        if (name.custom) username = name.name as string
        const haigusha = Haigusha.data as WaifuResponse
        let text = `🎐 *Name:* ${haigusha.name}\n\n`
        if (haigusha.original_name && haigusha.original_name !== '')
            text += `🎗 *Original Name:* ${haigusha.original_name}\n\n`
        text += `❤️‍🩹 *Married to:* ${username}\n\n`
        if (haigusha.age) text += `🍀 *Age:* ${haigusha.age}\n\n`
        text += `🎀 *Gender:* ${haigusha.gender}\n\n🔗 *Appearance:* ${haigusha.appears_in}\n\n❄ *Description:* ${haigusha.description}`
        const buffer = await this.client.utils.getBuffer(
            haigusha.image_link as string
        )
        return void (await this.client.sendMessage(
            M.from,
            {
                image: buffer,
                caption: text,
                jpegThumbnail: buffer.toString('base64'),
                contextInfo: {
                    externalAdReply: {
                        title: haigusha.name,
                        mediaType: 1,
                        thumbnail: buffer,
                        sourceUrl: ''
                    }
                }
            } as unknown as AnyMessageContent,
            {
                quoted: M.message
            }
        ))
    }
}

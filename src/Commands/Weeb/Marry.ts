import { BaseCommand, Command, Message } from '../../Structures'
import { Ship } from '@shineiichijo/canvas-chan'
import { AnyMessageContent } from '@whiskeysockets/baileys'
import { WaifuResponse } from '../../Types'

@Command('marry', {
    description: 'Marries the summoned haigusha',
    usage: 'marry',
    cooldown: 45,
    category: 'weeb',
    exp: 10
})
export default class command extends BaseCommand {
    override execute = async ({
        from,
        sender,
        reply,
        message
    }: Message): Promise<void> => {
        if (!this.handler.haigushaResponse.has(from))
            return void reply(
                `There are no summoned haigusha to marry. Use *${this.client.config.prefix}haigusha* to marry one`
            )
        const { haigusha } = await this.client.DB.getUser(sender.jid)
        if (haigusha.married) {
            const buttonMessage = {
                text: `You are already married to *${haigusha.data?.name}*`
            }
            return void (await this.client.sendMessage(from, buttonMessage, {
                quoted: message
            }))
        }
        const slugs = await this.client.DB.getMarriedSlugs()
        const res = this.handler.haigushaResponse.get(from) as WaifuResponse
        if (slugs.includes(res.id)) return void reply('💔 Already taken')
        slugs.push(res.id)
        await this.client.DB.characters.updateOne(
            { mwl: 'married' },
            { $set: { slugs } }
        )
        await this.client.DB.user.updateOne(
            { jid: sender.jid },
            { $set: { 'haigusha.married': true, 'haigusha.data': res } }
        )
        this.handler.haigushaResponse.delete(from)
        let pfp: Buffer
        try {
            pfp = await this.client.utils.getBuffer(
                (await this.client.profilePictureUrl(sender.jid, 'image')) || ''
            )
        } catch (error) {
            pfp = this.client.assets.get('404') as Buffer
        }
        const ship = [
            {
                name: sender.username,
                image: pfp
            },
            {
                name: res?.name as string,
                image: await this.client.utils.getBuffer(
                    res?.image_link as string
                )
            }
        ]
        const percentage = Math.floor(Math.random() * (100 - 65) + 65)
        const buffer = await new Ship(ship, percentage).build()
        const buttonMessage = {
            image: buffer,
            caption: `🎉 You are now married to *${res?.name}*`,
            jpegThumbnail: buffer.toString('base64')
        }
        return void (await this.client.sendMessage(
            from,
            buttonMessage as AnyMessageContent,
            {
                quoted: message
            }
        ))
    }
}

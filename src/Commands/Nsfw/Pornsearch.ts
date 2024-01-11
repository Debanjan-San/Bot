import { BaseCommand, Command, Message } from '../../Structures'
import { IArgs } from '../../Types'

@Command('pornsearch', {
    description: 'Will search porn from the given term.',
    category: 'nsfw',
    usage: 'pornsearch [term]',
    aliases: ['prns'],
    exp: 15,
    cooldown: 20
})
export default class extends BaseCommand {
    public override execute = async (M: Message, { context }: IArgs): Promise<void> => {
        if (!context) return void (await M.reply('Baka!! what porn you wnt?'))
        const texas = context.trim().split('|')
        const term = texas[0]
        const amount = parseInt(texas[1])
        if (!amount)
            return void M.reply(
                `Give me the number, Baka!\n\nExample: *${this.client.config.prefix}pornsearch russian|5*`
            )
        if (amount > 20) return void M.reply(`Do you want me to spam in this group?`)
        for (let i = 0; i < amount; i++) {
            const { data, status } = await this.client.utils.fetch<{
                status?: number
                creator: string
                response: string
                data: {
                    normal: string
                    best: string
                    lowest: string
                }
            }>(`https://weeb-api-neko.onrender.com/weeb/api/nsfw/porn/xnxx/single?q=${term}&api_key=mta3elttdphm8ryd`)
            if (status) return void (await M.reply('*404 Error! Found no Results*'))
            const buffer = await this.client.utils.getBuffer(data.best)
            await M.reply(buffer, 'video').catch(() => {
                return void M.reply('An error occurred. Try again later')
            })
        }
    }
}

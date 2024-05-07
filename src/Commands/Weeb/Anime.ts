import { BaseCommand, Command, Message } from '../../Structures'
import { IArgs, AnimeSearch } from '../../Types'

@Command('anime', {
    description: 'Searches an anime of the given query',
    aliases: ['ani'],
    category: 'weeb',
    usage: 'anime [query]',
    exp: 20,
    cooldown: 10
})
export default class extends BaseCommand {
    public override execute = async (
        M: Message,
        { context }: IArgs
    ): Promise<void> => {
        if (!context)
            return void M.reply('Provide a query for the search, Baka!')
        const query = context.trim()
        await this.client.utils
            .fetch<AnimeSearch[]>(
                `https://weeb-api.vercel.app/anime?search=${query}`
            )
            .then(async (data) => {
                if (!data.length)
                    return void M.reply('Not Found - Invalid Input')
                let msg = ''
                msg += `🎀 *Name: ${data[0].title.english}*\n`
                msg += `👁️‍🗨️ *Romanji: ${data[0].title.romaji}*\n`
                msg += `💮 *Japanese:* *${data[0].title.native}*\n`
                msg += `♨ *Type: ${data[0].format}*\n`
                msg += `🔞 *Is-Adult: ${data[0].isAdult}*\n`
                msg += `💫 *Status: ${data[0].status}*\n`
                msg += `🚥 *Episodes: ${data[0].episodes}*\n`
                msg += `🕛 *Duration: ${data[0].duration} Per Ep.*\n`
                msg += `🎐 *First Aired: ${data[0].startDate}*\n`
                msg += `🍥 *Last Aired: ${data[0].endDate}*\n`
                msg += `🧧 *Genres: ${data[0].genres.join(', ')}*\n`
                msg += `🎭 *Studios: ${data[0].studios}*\n`
                msg += `🎞 *Trailer: https://youtu.be/${
                    data[0].trailer ? data[0].trailer.id : 'null'
                }*\n\n`
                msg += `📃 *Description:* ${data[0].description}`
                const image = await this.client.utils.getBuffer(
                    data[0].imageUrl
                )
                return void (await M.reply(
                    image,
                    'image',
                    undefined,
                    undefined,
                    msg
                ))
            })
            .catch(() => {
                return void M.reply(`Couldn't find any anime | *"${query}"*`)
            })
    }
}

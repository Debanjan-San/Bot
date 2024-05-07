import { BaseCommand, Command, Message } from '../../Structures'
import { IArgs, MangaSearch } from '../../Types'

@Command('manga', {
    description: 'Searches a manga of the given query.',
    category: 'weeb',
    exp: 10,
    usage: 'manga [query]',
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
            .fetch<MangaSearch[]>(
                `https://weeb-api.vercel.app/manga?search=${query}`
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
                msg += `🚥 *Chapters: ${data[0].chapters}*\n`
                msg += `🎭 *Volumes: ${data[0].volumes}*\n`
                msg += `🎐 *First Aired: ${data[0].startDate}*\n`
                msg += `🍥 *Last Aired: ${data[0].endDate}*\n`
                msg += `🧧 *Genres: ${data[0].genres.join(', ')}*\n`
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
                return void M.reply(`Couldn't find any manga | *"${query}"*`)
            })
    }
}

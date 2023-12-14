import { BaseCommand, Command, Message } from '../../Structures'
import { IArgs } from '../../Types'
import { Anime } from '@shineiichijo/marika'
import { AnyMessageContent } from '@whiskeysockets/baileys'

@Command('anime', {
    description: 'Searches an anime in MyAnimeList',
    aliases: ['ani'],
    cooldown: 20,
    exp: 20,
    category: 'weeb',
    usage: '${helper.config.prefix}anime [query]'
})
export default class command extends BaseCommand {
    override execute = async (M: Message, { context }: IArgs): Promise<void> => {
        if (!context) return void M.reply('Provide the query, Baka!')
        const { searchAnime } = new Anime()
        const term = context.trim()
        await searchAnime(term)
            .then(async ({ data }) => {
                const result = data[0]
                let text: string = ''
                text += `🎀 *Title:* ${result.title}\n`
                text += `🎋 *Format:* ${result.type}\n`
                text += `📈 *Status:* ${this.client.utils.capitalize(result.status.replace(/\_/g, ' '))}\n`
                text += `🍥 *Total episodes:* ${result.episodes}\n`
                text += `🎈 *Duration:* ${result.duration}\n`
                text += `🧧 *Genres:* ${result.genres.map((genre) => genre.name).join(', ')}\n`
                text += `✨ *Based on:* ${this.client.utils.capitalize(result.source)}\n`
                text += `📍 *Studios:* ${result.studios.map((studio) => studio.name).join(', ')}\n`
                text += `🎴 *Producers:* ${result.producers.map((producer) => producer.name).join(', ')}\n`
                text += `💫 *Premiered on:* ${result.aired.from}\n`
                text += `🎗 *Ended on:* ${result.aired.to}\n`
                text += `🎐 *Popularity:* ${result.popularity}\n`
                text += `🎏 *Favorites:* ${result.favorites}\n`
                text += `🎇 *Rating:* ${result.rating}\n`
                text += `🏅 *Rank:* ${result.rank}\n\n`
                if (result.background !== null) text += `🎆 *Background:* ${result.background}*\n\n`
                text += `❄ *Description:* ${result.synopsis.replace(/\[Written by MAL Rewrite]/g, '')}`
                const image = await this.client.utils.getBuffer(result.images.jpg.large_image_url)
                return void (await this.client.sendMessage(
                    M.from,
                    {
                        image,
                        caption: text,
                        jpegThumbnail: image.toString('base64'),
                        contextInfo: {
                            externalAdReply: {
                                title: result.title,
                                mediaType: 1,
                                thumbnail: image,
                                sourceUrl: result.url
                            }
                        }
                    } as unknown as AnyMessageContent,
                    {
                        quoted: M.message
                    }
                ))
            })
            .catch(() => M.reply(`Couldn't find any anime | *"${term}"*`))
    }
}

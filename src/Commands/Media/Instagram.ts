import { Message, Command, BaseCommand } from '../../Structures'

@Command('instagramdl', {
    description: 'Download instagram video',
    usage: 'instagramdl [song]',
    aliases: ['igdl'],
    cooldown: 10,
    exp: 20,
    category: 'media'
})
export default class extends BaseCommand {
    public override execute = async (M: Message): Promise<void> => {
        if (!M.urls.length)
            return void M.reply('Please provide a instagram URL')
        let [url] = M.urls
        if (
            !(
                url.includes('instagram.com/p/') ||
                url.includes('instagram.com/reel/') ||
                url.includes('instagram.com/tv/')
            )
        )
            return void M.reply(
                `Wrong URL! Only Instagram posted videos, tv and reels can be downloaded`
            )
        await this.client.utils
            .fetch<{
                urls: {
                    type: 'image' | 'video'
                    url: string
                }[]
            }>(`https://weeb-api.vercel.app/insta?url=${url}`)
            .then(({ urls }) => {
                urls.forEach(async ({ url, type }) => {
                    const buffer = await this.client.utils.getBuffer(url)
                    M.reply(buffer, type)
                })
            })
            .catch(() => M.reply('Error while getting video/image data'))
    }
}

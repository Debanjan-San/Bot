import { BaseCommand, Command, Message } from '../../Structures'

@Command('rpaper', {
    description: 'Sends random anime wallpaper',
    category: 'weeb',
    cooldown: 10,
    exp: 20,
    usage: 'rpaper'
})
export default class command extends BaseCommand {
    override execute = async ({ reply }: Message): Promise<void> => {
        const { url } = await this.client.utils.fetch<{ url: string }>('https://nekos.life/api/v2/img/wallpaper')
        return void (await reply(await this.client.utils.getBuffer(url), 'image'))
    }
}

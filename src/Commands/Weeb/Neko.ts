import { BaseCommand, Command, Message } from '../../Structures'

@Command('neko', {
    description: 'Sends a random neko image',
    usage: 'neko',
    cooldown: 5,
    category: 'weeb',
    exp: 15
})
export default class command extends BaseCommand {
    override execute = async ({ reply }: Message): Promise<void> => {
        const { url } = await this.client.utils.fetch<{ url: string }>('https://nekos.life/api/v2/img/neko')
        return void (await reply(await this.client.utils.getBuffer(url), 'image'))
    }
}

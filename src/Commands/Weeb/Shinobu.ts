import { BaseCommand, Command, Message } from '../../Structures'

@Command('kitsune', {
    description: 'Sends a random kitsune image',
    usage: 'kitsune',
    cooldown: 5,
    category: 'weeb',
    exp: 20
})
export default class command extends BaseCommand {
    override execute = async ({ reply }: Message): Promise<void> => {
        const { url } = await this.client.utils.fetch<{ url: string }>(
            'https://api.waifu.pics/sfw/shinobu'
        )
        return void (await reply(
            await this.client.utils.getBuffer(url),
            'image'
        ))
    }
}

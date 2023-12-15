import { BaseCommand, Command, Message } from '../../Structures'

@Command('boobs', {
    description: 'send you a sexy nsfw gif ',
    category: 'nsfw',
    usage: 'boobs',
    exp: 20,
    cooldown: 5
})
export default class extends BaseCommand {
    public override execute = async ({ reply }: Message): Promise<void> => {
        const { url } = await this.client.utils.fetch<{ url: string }>('https://hmtai.hatsunia.cfd/v2/boobs')
        const buffer = await this.client.utils.getBuffer(url)
        return void (await reply(await this.client.utils.gifToMp4(buffer), 'video', true))
    }
}

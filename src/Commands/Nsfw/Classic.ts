import { BaseCommand, Command, Message } from '../../Structures'

@Command('classic', {
    description: 'send you a sexy nsfw image ',
    category: 'nsfw',
    usage: 'classic',
    exp: 20,
    cooldown: 5
})
export default class extends BaseCommand {
    public override execute = async ({ reply }: Message): Promise<void> => {
        const { link } = await this.client.utils.fetch<{ link: string }>('https://hmtai.hatsunia.cfd/v2/classic')
        const buffer = await this.client.utils.getBuffer(link)
        return void (await reply(await this.client.utils.gifToMp4(buffer), 'video', true))
    }
}

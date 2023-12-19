import { BaseCommand, Command, Message } from '../../Structures'

@Command('blowjob', {
    description: 'blowjob',
    category: 'nsfw',
    usage: 'blowjob',
    exp: 20,
    cooldown: 5
})
export default class extends BaseCommand {
    public override execute = async ({ reply }: Message): Promise<void> => {
        const { link } = await this.client.utils.fetch<{ link: string }>(
            'https://purrbot.site/api/img/nsfw/blowjob/gif'
        )
        const buffer = await this.client.utils.getBuffer(link)
        return void (await reply(await this.client.utils.gifToMp4(buffer), 'video', true))
    }
}

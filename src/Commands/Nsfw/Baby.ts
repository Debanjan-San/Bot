import { BaseCommand, Command, Message } from '../../Structures'

@Command('baby', {
    description: 'Sends a random kakashi image',
    category: 'weeb',
    usage: 'baby',
    exp: 20,
    cooldown: 5
})
export default class extends BaseCommand {
    public override execute = async ({ reply }: Message): Promise<void> => {
        const buffer = await this.client.utils.getBuffer('https://ray-senpai-api.onrender.com/l')
        return void (await reply(buffer, 'image'))
    }
}

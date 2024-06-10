import { BaseCommand, Command, Message } from '../../Structures'
import MWL from '../../lib/MyWaifuList'

@Command('waifuofday', {
    description: 'Shows the Waifu of the day.',
    usage: 'waifuofday',
    cooldown: 5,
    category: 'weeb',
    exp: 15
})
export default class command extends BaseCommand {
    override execute = async ({ reply }: Message): Promise<void> => {
        const { waifuOfDay } = new MWL()
        const { image, name } = (await waifuOfDay()) as {
            image: string
            name: string
        }
        return void (await reply(
            await this.client.utils.getBuffer(image),
            'image',
            undefined,
            undefined,
            `_Waifu of the Day:_ *${name}*`
        ))
    }
}

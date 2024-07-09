import { BaseCommand, Command, Message } from '../../Structures'
import { IArgs } from '../../Types'

@Command('gc-description', {
    description: 'To change the group description',
    usage: 'gcdes [caption]',
    category: 'moderation',
    exp: 35,
    cooldown: 5,
    aliases: ['gcicon']
})
export default class command extends BaseCommand {
    override execute = async (M: Message, { context }: IArgs): Promise<void> => {
        try {
            if (!context) return void (await M.reply('Provite the description to change.'))
            return void (await this.client.groupUpdateDescription(M.from, context))
        } catch (err) {
            return void (await M.reply('Error!!'))
        }
    }
}

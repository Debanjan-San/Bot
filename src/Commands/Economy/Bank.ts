import { BaseCommand, Command, Message } from '../../Structures'

@Command('bank', {
    description: '',
    usage: 'bank',
    category: 'economy',
    exp: 10,
    cooldown: 10
})
export default class command extends BaseCommand {
    override execute = async ({ from, sender, message }: Message): Promise<void> => {
        const { bank } = await this.client.DB.getUser(sender.jid)
        const buttonMessage = {
            text: `🪪 You have ${bank} as your bank balance`
        }
        return void (await this.client.sendMessage(from, buttonMessage, {
            quoted: message
        }))
    }
}

import { BaseCommand, Command, Message } from '../../Structures'

@Command('wallet', {
    description: '',
    usage: 'wallet',
    category: 'economy',
    exp: 10,
    cooldown: 10
})
export default class command extends BaseCommand {
    override execute = async ({ from, sender, message }: Message): Promise<void> => {
        const { wallet } = await this.client.DB.getUser(sender.jid)
        const buttonMessage = {
            text: `💼 Total wallet balance: ${wallet}`
        }
        return void (await this.client.sendMessage(from, buttonMessage, {
            quoted: message
        }))
    }
}

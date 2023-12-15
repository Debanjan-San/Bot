import { Command, BaseCommand, Message } from '../../Structures'

@Command('store', {
    description: 'Shows the available items in the store',
    aliases: ['shop'],
    cooldown: 15,
    exp: 10,
    category: 'economy',
    usage: 'store'
})
export default class command extends BaseCommand {
    override execute = async ({ from, message }: Message): Promise<void> => {
        let text = await this.client.DB.getStore()
        text += `\n📕 *Note:* Use *${this.client.config.prefix}buy <item_index_number>* to buy an item`
        return void (await this.client.sendMessage(
            from,
            {
                text
            },
            {
                quoted: message
            }
        ))
    }
}

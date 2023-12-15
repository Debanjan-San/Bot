import { BaseCommand, Command, Message } from '../../Structures'

@Command('buy', {
    description: 'Buys an item',
    category: 'economy',
    usage: 'buy <item_index_number_in_the_store>',
    cooldown: 25,
    exp: 20
})
export default class command extends BaseCommand {
    override execute = async (M: Message): Promise<void> => {
        if (M.numbers.length < 1)
            return void M.reply(
                `Provide the index number of item in the store that you wanna buy. Example: *${this.client.config.prefix}buy 2*`
            )
        const index = M.numbers[0]
        const { items } = await this.client.DB.getFeature('store')
        if (items.length < index || index < 1) {
            const buttonMessage = {
                text: `Invalid index of an item. Use *${this.client.config.prefix}store* to see all of the available items`
            }
            return void (await this.client.sendMessage(M.from, buttonMessage, {
                quoted: M.message
            }))
        }
        const { name, price, emoji } = items[index - 1]
        const x = await this.client.DB.getUser(M.sender.jid)
        if (x.wallet < price)
            return void M.reply(`You need ${price - x.wallet} more gold in your wallet to buy this item`)
        if (2073600000 - (Date.now() - x.inventory.find((x) => x.item === name)?.usageLeft!) > 0)
            return void M.reply("You can't have two same items in your inventory!")
        x.inventory.push({ item: name, usageLeft: Date.now() as number })
        await this.client.DB.updateUser(M.sender.jid, 'inventory', 'set', x.inventory)
        await this.client.DB.setGold(M.sender.jid, -price)
        const buttonMessage = {
            text: `${emoji} You have bought ${name.startsWith('e') ? 'an' : 'a'} *${name
                .split(' ')
                .map((x) => this.client.utils.capitalize(x))
                .join(' ')}* for *${price} gold*`
        }
        return void (await this.client.sendMessage(M.from, buttonMessage, {
            quoted: M.message
        }))
    }
}

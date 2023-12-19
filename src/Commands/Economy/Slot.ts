import { SlotMachine, SlotSymbol } from 'slot-machine'
import { BaseCommand, Command, Message } from '../../Structures'

@Command('slot', {
    category: 'economy',
    description: 'Bets the given amount of gold in a slot machine',
    casino: true,
    usage: 'slot <amount>',
    cooldown: 35,
    exp: 10,
    aliases: ['bet']
})
export default class command extends BaseCommand {
    override execute = async (M: Message): Promise<void> => {
        if (M.numbers.length < 1) return void M.reply(`Have not provided any ammount`)
        const amount = M.numbers[0]
        const { wallet } = await this.client.DB.getUser(M.sender.jid)
        if (amount < 100) return void (await M.reply('The minimum amount for slot is *100*'))
        if (amount > 15000) return void (await M.reply('The maximum amount for slot is *15000*'))
        if (amount > wallet) return void M.reply(`You need to have a look in your wallet!!`)
        if (this.handler.highestBit.get(M.from)?.buyer == M.sender.jid) return void M.reply('Auction is Ongoing, Baka!')
        const machine = new SlotMachine(3, this.symbols)
        const results = machine.play()
        const lines = results.lines.filter((line) => !line.diagonal)
        const points = results.lines.reduce((total, line) => total + line.points, 0)
        const resultAmount = points <= 0 ? -amount : amount * points
        await this.client.DB.setGold(M.sender.jid, resultAmount)
        let text = '🎰 *SLOT MACHINE* 🎰\n\n'
        text += results.visualize()
        text += `\n\n🍀 You had ${wallet} gold`
        text += `\n🔆 Now you have ${wallet + resultAmount} gold`
        text += points <= 0 ? `\n📉 You lost ${amount} gold` : `\n📈 You won ${resultAmount} gold`
        const buttonMessage = {
            text: text
        }
        return void (await this.client.sendMessage(M.from, buttonMessage, {
            quoted: M.message
        }))
    }

    private symbols = [
        new SlotSymbol('1', {
            display: '🍒',
            points: 1,
            weight: 100
        }),
        new SlotSymbol('2', {
            display: '🍀',
            points: 1,
            weight: 100
        }),
        new SlotSymbol('b', {
            display: '💰',
            points: 5,
            weight: 40
        })
    ]
}

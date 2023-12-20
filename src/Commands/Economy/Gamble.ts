import { Sticker } from 'wa-sticker-formatter'
import { BaseCommand, Command, Message } from '../../Structures'
import { IArgs } from '../../Types'

@Command('gamble', {
    description: '',
    usage: 'gamble <amount> <direction>',
    category: 'economy',
    cooldown: 25,
    exp: 20,
    casino: true
})
export default class command extends BaseCommand {
    private isDirection = (str: string) => ['left', 'right'].includes(str)
    override execute = async (M: Message, { args }: IArgs): Promise<void> => {
        if (M.from !== this.client.config.casinoGroup) return void M.reply('Bruh! Do not gamble here!')
        let arr = args.map((arg) => arg.toLowerCase().trim())
        if (Number(arr[0]) && !arr[1]) {
            return void (await M.reply(`Left or Right?`))
        }
        const { wallet } = await this.client.DB.getUser(M.sender.jid)
        if (!arr[0] || !arr[1])
            return void (await M.reply(`Usage: *${this.client.config.prefix}gamble right/left amount*`))
        arr = this.isDirection(arr[0]) ? [arr[0], arr[1]] : this.isDirection(arr[1]) ? [arr[1], arr[0]] : []
        if (!arr[0] || !arr[1])
            return void (await M.reply(`Usage: *${this.client.config.prefix}gamble right/left amount*`))
        let amt = Math.abs(parseInt(arr[1])) || 0
        if (isNaN(amt)) return void (await M.reply("That's not a number."))
        if (amt < 100) return void (await M.reply('The minimum amount for gambling is *100*'))
        if (amt > 15000) return void (await M.reply('The maximum amount for gambling is *15000*'))
        if (!wallet) return void (await M.reply(`You don't have any gold in your wallet!`))
        const sub = wallet - amt
        if (sub < 0) return void (await M.reply(`You don't have enough gold!`))
        const roll = Math.floor(Math.random() * 2) + 1
        const win = (roll === 1 && arr[0] === 'right') || (roll === 2 && arr[0] === 'left') ? true : false
        let [newAmt, text] = [sub, `📉 You lost *${amt}* gold`]
        if (win) {
            const extra = Math.floor(Math.random() * 500) === 250
            amt = extra ? amt * 100 : amt
            newAmt = wallet + amt
            text = `${extra ? '🍀 Jackpot!' : '🎊 Congratulations!'} You won *${amt} gold!*`
        }
        await this.client.DB.updateUser(M.sender.jid, 'wallet', 'set', newAmt)
        const sticker = () =>
            (win && arr[0] === 'right') || (!win && arr[0] === 'left')
                ? this.client.assets.get('right')
                : this.client.assets.get('left')
        await M.reply(
            await new Sticker(sticker() as Buffer, {
                pack: '',
                author: ``,
                quality: 90,
                type: 'full'
            }).build(),
            'sticker'
        )
        await M.reply(text)
    }
}

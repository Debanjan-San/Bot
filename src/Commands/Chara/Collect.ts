import { Command, BaseCommand, Message } from '../../Structures'

@Command('collect', {
    description: 'collects charactr',
    exp: 10,
    cooldown: 10,
    usage: 'collect',
    category: 'characters'
})
export default class extends BaseCommand {
    public override execute = async (M: Message): Promise<void> => {
        const res = this.handler.charaResponse.get(M.from)
        if (!res) return void M.reply('There is no character spawned in this group right now.')
        const { wallet, gallery } = await this.client.DB.getUser(M.sender.jid)
        if (res.price > wallet) return void M.reply('You do not have enough in your wallet!!')
        this.handler.charaResponse.delete(M.from)
        await this.client.DB.updateUser(M.sender.jid, 'wallet', 'inc', -res.price)
        gallery.push(res.data)
        await this.client.DB.updateUser(M.sender.jid, 'gallery', 'set', gallery)
        return void M.reply(`🎉 You have collected ${res.data.name}`)
    }
}

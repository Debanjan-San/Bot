import { Message, Command, BaseCommand } from '../../Structures'

@Command('gcard', {
    description: 'Gives card to people',
    usage: 'gcard [index of deck]',
    exp: 10,
    cooldown: 10,
    category: 'cards'
})
export default class extends BaseCommand {
    public override execute = async (M: Message): Promise<void> => {
        const { deck } = await this.client.DB.getUser(M.sender.jid)
        if (!deck.length) return void M.reply('You have not claimed any card')
        if (!M.numbers.length || M.numbers[0] < 1 || M.numbers[0] > deck.length)
            return void M.reply('Provide a valid deck index to give with tagged or quoted person')
        const user = M.mentioned.length ? M.mentioned[0] : M.quoted ? M.quoted.sender.jid : ''
        if (user === '') return void M.reply('Tag or quote is required!!')
        const t = deck[M.numbers[0] - 1]
        const { deck: targetDeck } = await this.client.DB.getUser(user)
        targetDeck.push(t)
        deck.splice(M.numbers[0] - 1, 1)
        await this.client.DB.updateUser(M.sender.jid, 'deck', 'set', deck)
        await this.client.DB.updateUser(user, 'deck', 'set', targetDeck)
        return void M.reply(
            `🎉 @${M.sender.jid.split('@')[0]} gave ${t.name} to @${user.split('@')[0]}`,
            'text',
            undefined,
            user,
            undefined,
            [M.sender.jid, user]
        )
    }
}

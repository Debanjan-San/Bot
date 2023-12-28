import { Message, Command, BaseCommand } from '../../Structures'
import { IArgs } from '../../Types'

@Command('learn', {
    description: 'Learns Pokemon move',
    category: 'pokemon',
    cooldown: 5,
    usage: 'learn --[move]',
    exp: 20
})
export default class extends BaseCommand {
    override execute = async (M: Message, { flags }: IArgs): Promise<void> => {
        try {
        const Data = this.handler.pokemonMoveLearningResponse.get(`${M.from}${M.sender.jid}`)
        if (!flags.length || !Data) return void M.reply(!Data ? `You can't use this command yet-` : 'Invalid usage')
        const { party } = await this.client.DB.getUser(M.sender.jid)
        const { data, move } = Data
        const Move = move.name.split('-').map(this.client.utils.capitalize).join(' ')
        const i = party.findIndex((x) => x.name === data.name && x.level === data.level)
        if (flags.includes('--cancel')) {
            party[i].rejectedMoves.push(move.name)
            await this.client.DB.updateUser(M.sender.jid, 'party', 'set', party)
            return void M.reply(`Cancelled learning *${Move}*`)
        }
        const MOve = flags[0].replace('--', '')
        const pkmn = party[i]
        const index = pkmn.moves.findIndex((x) => x.name === MOve)
        if (index < 0) return void (await M.reply('Invalid move'))
        const deletedMove = party[i].moves[index].name.split('-').map(this.client.utils.capitalize).join(' ')
        party[i].rejectedMoves.push(party[i].moves[index].name)
        party[i].moves[index] = move
        await this.client.DB.updateUser(M.sender.jid, 'party', 'set', party)
        const c = this.handler.pokemonBattlePlayerMap.get(M.from)
        if (c) {
            const data = this.handler.pokemonBattleResponse.get(c)
            if (data) {
                const turn = data.player1.user === M.sender.jid ? 'player1' : 'player2'
                if (party[i].tag === data[turn].activePokemon.tag) {
                    data[turn].activePokemon = party[i]
                    this.handler.pokemonBattleResponse.set(c, data)
                }
            }
        }
        this.handler.pokemonMoveLearningResponse.delete(`${M.from}${M.sender.jid}`)
        return void (await M.reply(
            `Your *${this.client.utils.capitalize(
                party[i].name
            )}* forgot the move *${deletedMove}* and learnt the move *${Move}*`
        ))
        } catch (err) {
         M.reply(JSON.stringify(err))
       }
    }
}
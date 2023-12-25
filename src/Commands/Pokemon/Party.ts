import { summaryScreen, partyScreen } from '@shineiichijo/team-preview'
import { Command, BaseCommand, Message } from '../../Structures'
import { IArgs, IPokemonAPIResponse } from '../../Types'

@Command('party', {
    description: "Displays user's pokemon party",
    usage: 'party',
    category: 'pokemon',
    cooldown: 5,
    exp: 25
})
export default class command extends BaseCommand {
    override execute = async (M: Message, { flags }: IArgs): Promise<void> => {
        const { party, tag } = await this.client.DB.getUser(M.sender.jid)
        if (party.length < 1) return void M.reply("You don't have any pokemon in your party")
        if (!M.numbers.length || M.numbers[0] > party.length) {
            let text = `⚗ *Party*\n\n🎴 *ID:*\n\t🏮 *Username:* ${M.sender.username}\n\t🧧 *Tag:* #${tag}`
            for (let i = 0; i < party.length; i++) {
                if (!party[i].types.length) {
                    const { types } = await this.client.utils.fetch<IPokemonAPIResponse>(
                        `https://pokeapi.co/api/v2/pokemon/${party[i].name}`
                    )
                    party[i].types = types.map((type) => type.type.name)
                    await this.client.DB.user.updateOne({ jid: M.sender.jid }, { $set: { party } })
                }
            }
            party.forEach((x, y) => {
                text += `\n\n*🔰 #${y + 1}: Name:* ${this.client.utils.capitalize(x.name)}\n🔮 *Level:* ${
                    x.level
                }\n🪄 *XP:* ${x.displayExp}`
            })
            const buffer = await this.client.utils.getBuffer(party[0].image)
            text += `\n\n*[Use ${this.client.config.prefix}party <index_number> to see the stats of a pokemon in your party]*`
            return void (await M.reply(buffer, 'image', true, undefined, text))
        } else {
            const index = M.numbers[0] - 1
            const pokemon = party[index]
            const moves: { name: string; pp: number; maxPp: number; type: string }[] = []
            for (const move of pokemon.moves)
                moves.push({ name: move.name, pp: move.pp, type: move.type, maxPp: move.maxPp })
            const buffer = await this.client.utils.gifToMp4(
                await summaryScreen({
                    pokemon: { name: pokemon.name, moves, level: pokemon.level, female: pokemon.female },
                    pokeball: 'pokeball'
                })
            )
            const pokemonLevelCharts = await this.client.utils.fetch<{ level: number; expRequired: number }[]>(
                'https://gist.githubusercontent.com/Debanjan-San/5d129eadfcb7cf49250c767b378f05b2/raw/e2985d056368677d1a60106c71da23970b452800/pokelevel.json'
            )
            const expArr = pokemonLevelCharts.filter((x) => x.level >= pokemon.level)
            const Exp = expArr[0].expRequired
            const exp = expArr[1] && expArr[1].expRequired ? expArr[1].expRequired : 0
            const required = exp - Exp
            const image = await this.client.utils.getBuffer(pokemon.image)
            let text = `🟩 *Name:* ${this.client.utils.capitalize(pokemon.name)}\n\n🌿 *Gender:* ${
                pokemon.female ? 'Female' : 'Male'
            }\n\n🟧 *Types:* ${pokemon.types.map(this.client.utils.capitalize).join(', ')}\n\n🟨 *Level:* ${
                pokemon.level
            }\n\n🟦 *XP:* ${pokemon.displayExp} / ${required > 0 ? required : 0}\n\n♻ *State:* ${
                pokemon.hp <= 0
                    ? 'Fainted'
                    : pokemon.state.status === ''
                      ? 'Fine'
                      : this.client.utils.capitalize(pokemon.state.status)
            }\n\n🟢 *HP:* ${pokemon.hp} / ${pokemon.maxHp}\n\n⬜ *Speed:* ${pokemon.speed} / ${
                pokemon.maxSpeed
            }\n\n🛡 *Defense:* ${pokemon.defense} / ${pokemon.maxDefense}\n\n🟥 *Attack:* ${pokemon.attack} / ${
                pokemon.maxAttack
            }\n\n⬛ *Moves:* ${pokemon.moves
                .map((x) => x.name.split('-').map(this.client.utils.capitalize).join(' '))
                .join(', ')}\n\n*[Use ${this.client.config.prefix}party ${
                index + 1
            } --moves to see all of the moves of the pokemon with details]*`
            if (flags.includes('--moves')) {
                text = `*Moves | ${this.client.utils.capitalize(pokemon.name)}*`
                for (let i = 0; i < pokemon.moves.length; i++)
                    text += `\n\n*#${i + 1}*\n❓ *Move:* ${pokemon.moves[i].name
                        .split('-')
                        .map(this.client.utils.capitalize)
                        .join(' ')}\n〽 *PP:* ${pokemon.moves[i].pp} / ${
                        pokemon.moves[i].maxPp
                    }\n🎗 *Type:* ${this.client.utils.capitalize(pokemon.moves[i].type)}\n🎃 *Power:* ${
                        pokemon.moves[i].power
                    }\n🎐 *Accuracy:* ${pokemon.moves[i].accuracy}\n🧧 *Description:* ${pokemon.moves[i].description}`
            }
            return void (await M.reply(buffer, 'video', true, undefined, text, undefined, {
                body: this.client.utils.capitalize(pokemon.name),
                thumbnail: image,
                mediaType: 1
            }))
        }
    }
}

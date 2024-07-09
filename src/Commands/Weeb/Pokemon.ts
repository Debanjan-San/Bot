import { BaseCommand, Command, Message } from '../../Structures'
import { IArgs, IPokemonAPIResponse } from '../../Types'

@Command('pokemon', {
    description: 'Displays the info of the given pokemon',
    usage: 'pokemon <name/pokedex_id>',
    category: 'weeb',
    cooldown: 10,
    exp: 5
})
export default class command extends BaseCommand {
    override execute = async (M: Message, { context }: IArgs): Promise<void> => {
        if (!context) return void M.reply('Provide the name or pokedex ID of the pokemon')
        const term = context.trim().split(' ')[0].toLowerCase().trim()
        await this.client.utils
            .fetch<IPokemonAPIResponse>(`https://pokeapi.co/api/v2/pokemon/${term}`)
            .then(async (res) => {
                const text = `🎈 *Name:* ${this.client.utils.capitalize(res.name)}\n\n🧧 *Pokedex ID:* ${
                    res.id
                }\n\n🎗 *${res.types.length > 1 ? 'Types' : 'Type'}:* ${res.types
                    .map((type) => `${this.client.utils.capitalize(type.type.name)}`)
                    .join(', ')}\n\n🎏 *${res.abilities.length > 1 ? 'Abilities' : 'Ability'}:* ${res.abilities
                    .map((ability) => `${this.client.utils.capitalize(ability.ability.name)}`)
                    .join(', ')}`
                const image = await this.client.utils.getBuffer(
                    res.sprites.other['official-artwork'].front_default as string
                )
                return void (await M.reply(image, 'image', undefined, undefined, text))
            })
            .catch(() => {
                return void M.reply('Invalid pokemon name or pokedex ID')
            })
    }
}

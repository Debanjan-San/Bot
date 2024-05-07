import { BaseCommand, Command, Message } from '../../Structures'
import { IArgs } from '../../Types'
import axios from 'axios'

@Command('joke', {
    description: 'sends a random joke for you.',
    category: 'fun',
    usage: `joke`,
    cooldown: 5,
    exp: 30,
    dm: false
})
export default class extends BaseCommand {
    public override execute = async (
        M: Message,
        args: IArgs
    ): Promise<void> => {
        await axios
            .get(`https://v2.jokeapi.dev/joke/Any`)
            .then((response) => {
                // console.log(response);
                const text = `🎀 *Category:* ${response.data.category}\n📛 *Joke:* ${response.data.setup}\n🎗️ *Delivery:* ${response.data.delivery}`
                M.reply(text)
            })
            .catch((err) => {
                M.reply(`✖  An error occurred.`)
            })
    }
}

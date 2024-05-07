import { Command, BaseCommand, Message } from '../../Structures'
import { IArgs, CharacterSearch } from '../../Types'

@Command('character', {
    description: 'Searches a character of the given query.',
    usage: 'character [query]',
    category: 'weeb',
    aliases: ['chara'],
    exp: 20,
    cooldown: 5
})
export default class extends BaseCommand {
    public override execute = async (
        M: Message,
        { context }: IArgs
    ): Promise<void> => {
        if (!context)
            return void M.reply('Provide a query for the search, Baka!')
        const query = context.trim()
        await this.client.utils
            .fetch<CharacterSearch[]>(
                `https://weeb-api.vercel.app/character?search=${query}`
            )
            .then(async (data) => {
                if (!data.length)
                    return void M.reply('Not Found - Invalid Input')
                let msg = ''
                msg += `🎀 *Full: ${data[0]?.name?.full}*\n`
                msg += `💮 *Japanese:* *${data[0]?.name?.native}*\n`
                msg += `💫 *Age: ${data[0]?.age}*\n`
                msg += `🚻 *Gender: ${data[0]?.gender}*\n`
                msg += `🩸 *Blood Type: ${data[0]?.bloodType}*\n`
                msg += `📃 *Description:* ${data[0]?.description.replace(
                    /\([^)]*\)*/g,
                    ''
                )}`
                const image = await this.client.utils.getBuffer(data[0]?.image)
                return void (await M.reply(
                    image,
                    'image',
                    undefined,
                    undefined,
                    msg
                ))
            })
            .catch(() => {
                return void M.reply(`No character found | *"${query}"*`)
            })
    }
}

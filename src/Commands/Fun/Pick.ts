import { BaseCommand, Command, Message } from '../../Structures'
import { IArgs } from '../../Types'

@Command('pick', {
    description: 'Picks random users from a guild',
    category: 'fun',
    exp: 30,
    cooldown: 25,
    usage: 'pick [text]'
})
export default class command extends BaseCommand {
    override execute = async (M: Message, { context }: IArgs): Promise<void> => {
        const users = M.groupMetadata?.participants.map((x) => x.id) as string[]
        const random = users[Math.floor(Math.random() * users.length)]
        return void (await M.reply(
            `😛 ${context ? `*${context}:*` : '*Random_Pick:*'} @${random.split('@')[0]}`,
            'text',
            undefined,
            undefined,
            undefined,
            [random]
        ))
    }
}

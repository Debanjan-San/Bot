import { BaseCommand, Command, Message } from '../../Structures'
import { IArgs } from '../../Types'
import moment from 'moment-timezone'

@Command('afk', {
    description: 'Make yourself AFK (Away from keyboard)',
    category: 'general',
    usage: 'afk [reason]',
    exp: 20,
    cooldown: 5
})
export default class extends BaseCommand {
    public override execute = async (
        M: Message,
        { context }: IArgs
    ): Promise<void> => {
        const reason = context ? context.trim() : ''
        const time = moment.tz('Etc/GMT').format('MMM D, YYYY HH:mm:s')
        await this.client.DB.updateUser(M.sender.jid, 'afk', 'set', {
            isOffline: true,
            reason,
            time
        })
        return void (await M.reply(`${M.sender.username} is now Away!`))
    }
}

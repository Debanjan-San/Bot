import { BaseCommand, Command, Message } from '../../Structures'
import { IArgs } from '../../Types'

const checks = [
    'awesomecheck',
    'greatcheck',
    'gaycheck',
    'cutecheck',
    'lesbiancheck',
    'hornycheck',
    'prettycheck',
    'lovelycheck',
    'uglycheck',
    'beautifulcheck',
    'handsomecheck',
    'charactercheck'
]

@Command('checkuser', {
    description: 'Checks on use!',
    category: 'fun',
    aliases: ['cu', ...checks],
    exp: 20,
    cooldown: 10,
    usage: 'checkuser (check) [tag/quote users] || (check) [tag/quote users]'
})
export default class command extends BaseCommand {
    override execute = async (M: Message, { context }: IArgs): Promise<void> => {
        const command = M.content.split(' ')[0].toLowerCase().slice(this.client.config.prefix.length).trim()
        let flag = true
        if (command === 'cu' || command === 'checkuser') flag = false
        if (!flag && !context)
            return void (await M.reply(
                `🪧 *Available Checks:*\n\n📍 ${checks
                    .map((c) => this.client.utils.capitalize(c))
                    .join('\n📍 ')}\n\n🔗 *Usage:* ${this.client.config.prefix}checkuser (check) [tag/quote user] | ${
                    this.client.config.prefix
                }(check) [tag/quote user]\nExample: ${this.client.config.prefix}awesomecheck`
            ))
        const check = (flag ? command : context.split(' ')[0].trim().toLowerCase()) as string
        if (!flag && !checks.includes(check))
            return void (await M.reply(
                `Invalid option. Use *${this.client.config.prefix}checkuser* to see all of the available checks`
            ))
        const users = M.mentioned
        if (M.quoted && !users.includes(M.quoted.sender.jid)) users.push(M.quoted.sender.jid)
        while (users.length < 1) users.push(M.sender.jid)
        const reactant = users[0]

        return void (await M.reply(
            `🎆 _*${check.toUpperCase()}*_ 🎆\n\n @${reactant.split('@')[0]} \`\`\`is ${
                check !== 'charactercheck'
                    ? `${this.client.utils.getRandomNumber(1, 100)}% ${check.split('check')[0]}`
                    : `${this.client.utils.getRandomNumber(1, 100)}% ${this.client.utils.randomItems([
                          'Compassionate',
                          'Generous',
                          'Grumpy',
                          'Forgiving',
                          'Obedient',
                          'Good',
                          'Simp',
                          'Kind-Hearted',
                          'patient',
                          'UwU',
                          'top, anyway',
                          'Helpful'
                      ])}`
            }\`\`\``,
            'text',
            undefined,
            undefined,
            undefined,
            [reactant]
        ))
    }
}

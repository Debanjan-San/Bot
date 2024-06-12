import { BaseCommand, Command, Message } from '../../Structures'
import { IArgs } from '../../Types'

@Command('help', {
    description: "Displays the bot's usable commands",
    aliases: ['h'],
    cooldown: 10,
    exp: 20,
    usage: 'help || help <command_name>',
    category: 'general'
})
export default class extends BaseCommand {
    private replaceWithCustomAlphabet = (sentence: string): string => {
        const customAlphabetMap: { [key: string]: string } = {
            a: 'ᴀ',
            b: 'ʙ',
            c: 'ᴄ',
            d: 'ᴅ',
            e: 'ᴇ',
            f: 'ꜰ',
            g: 'ɢ',
            h: 'ʜ',
            i: 'ɪ',
            j: 'ᴊ',
            k: 'ᴋ',
            l: 'ʟ',
            m: 'ᴍ',
            n: 'ɴ',
            o: 'ᴏ',
            p: 'ᴘ',
            q: 'φ',
            r: 'ʀ',
            s: 'ꜱ',
            t: 'ᴛ',
            u: 'ᴜ',
            v: 'ᴠ',
            w: 'ᴡ',
            x: 'x',
            y: 'ʏ',
            z: 'ᴢ'
        }

        return sentence
            .split('')
            .map(
                (letter: string) =>
                    customAlphabetMap[letter.toLowerCase()] || letter
            )
            .join('')
    }

    private readonly list = [
        { id: 'general', font: '𝙂𝙀𝙉𝙀𝙍𝘼𝙇', emoji: '🔰' },
        { id: 'dev', font: '𝘿𝙀𝙑', emoji: '👨‍💻' },
        { id: 'fun', font: '𝙁𝙐𝙉', emoji: '🎡' },
        { id: 'nsfw', font: '𝙉𝙎𝙁𝙒', emoji: '🔞' },
        { id: 'media', font: '𝙈𝙀𝘿𝙄𝘼', emoji: '🔉' },
        { id: 'games', font: '𝙂𝘼𝙈𝙀𝙎', emoji: '🎮' },
        { id: 'moderation', font: '𝙈𝙊𝘿𝙀𝙍𝘼𝙏𝙄𝙊𝙉', emoji: '💮' },
        { id: 'utils', font: '𝙐𝙏𝙄𝙇𝙎', emoji: '⚙️' },
        { id: 'weeb', font: '𝙒𝙀𝙀𝘽', emoji: '🎐' }
    ] as const
    public override execute = async (
        M: Message,
        { context }: IArgs
    ): Promise<void> => {
        if (!context) {
            let commands = Array.from(
                this.handler.commands,
                ([command, data]) => ({
                    command,
                    data
                })
            ).filter((command) => command.data.config.category !== 'dev')
            const { nsfw } = await this.client.DB.getGroup(M.from)
            if (!nsfw)
                commands = commands.filter(
                    ({ data }) => data.config.category !== 'nsfw'
                )
            let text = `🤖 ${this.client.config.name.toUpperCase()} Command List 🤖\n\n💡 *Prefix:* ${
                this.client.config.prefix
            }\n⛩️ *User:* @${M.sender.jid.split('@')[0]}`
            const categories: string[] = []
            for (const command of commands) {
                if (categories.includes(command.data.config.category)) continue
                categories.push(command.data.config.category)
            }
            for (const category of categories) {
                const categoryCommands: string[] = []
                const filteredCommands = commands.filter(
                    (command) => command.data.config.category === category
                )
                const { font, emoji } = this.list.find(
                    (x) => x.id === category
                ) as {
                    font: string
                    emoji: string
                }
                text += `\n\n*${font}* ${emoji}\n`
                filteredCommands.forEach((command) =>
                    categoryCommands.push(command.data.name)
                )
                text += `\`\❐ ${categoryCommands
                    .map((cmd) => this.replaceWithCustomAlphabet(cmd))
                    .join(', ')}\``
            }
            text += '\n\n'
            text += `*📇 Notes:*
*➪ Use ${this.client.config.prefix}help <command name> from help the list to see its description and usage*
*➪ Eg: ${this.client.config.prefix}help profile*
*➪ <> means required and [ ] means optional, don't include <> or [ ] when using command.*`
            return void (await M.reply(
                text,
                'text',
                undefined,
                undefined,
                undefined,
                [M.sender.jid]
            ))
        } else {
            const cmd = context.trim().toLowerCase()
            const command =
                this.handler.commands.get(cmd) || this.handler.aliases.get(cmd)
            if (!command)
                return void M.reply(`No command found | *"${context.trim()}"*`)
            return void M.reply(
                `📗 *Command:* ${this.client.utils.capitalize(
                    command.name
                )}\n📕 *Aliases:* ${
                    !command.config.aliases
                        ? ''
                        : command.config.aliases
                              .map((alias) =>
                                  this.client.utils.capitalize(alias)
                              )
                              .join(', ')
                }\n📔 *Category:* ${this.client.utils.capitalize(
                    command.config.category
                )}\n📓 *Cooldown:* ${
                    command.config.cooldown ?? 3
                }s\n📘 *Usage:* ${command.config.usage
                    .split('||')
                    .map(
                        (usage) => `${this.client.config.prefix}${usage.trim()}`
                    )
                    .join(' | ')}\n📙 *Description:* ${
                    command.config.description
                }`
            )
        }
    }
}

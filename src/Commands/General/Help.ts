import { BaseCommand, Command, Message } from '../../Structures'
import { IArgs, ICommand } from '../../Types'

@Command('help', {
    description: "Displays the bot's usable commands",
    aliases: ['h'],
    cooldown: 10,
    exp: 20,
    usage: 'help || help <command_name>',
    category: 'general'
})
export default class extends BaseCommand {
    private list = [
        {
            id: 'general',
            font: '𝙂𝙀𝙉𝙀𝙍𝘼𝙇',
            emoji: '🔰',
            description: 'General commands for basic usage. 🔍'
        },
        {
            id: 'dev',
            font: '𝘿𝙀𝙑',
            emoji: '👨‍💻',
            description: 'Developer commands for development purposes. 🛠️'
        },
        {
            id: 'fun',
            font: '𝙁𝙐𝙉',
            emoji: '🎡',
            description: 'Fun commands for entertainment. 🎮'
        },
        {
            id: 'nsfw',
            font: '𝙉𝙎𝙁𝙒',
            emoji: '🔞',
            description: 'Commands related to NSFW content. 🍑'
        },
        {
            id: 'media',
            font: '𝙈𝙀𝘿𝙄𝘼',
            emoji: '🔉',
            description: 'Media-related commands. 🎥'
        },
        {
            id: 'games',
            font: '𝙂𝘼𝙈𝙀𝙎',
            emoji: '🎮',
            description: 'Commands related to games. 🎮'
        },
        {
            id: 'moderation',
            font: '𝙈𝙊𝘿𝙀𝙍𝘼𝙏𝙄𝙊𝙉',
            emoji: '💮',
            description: 'Commands for moderating the server. 🛡️'
        },
        {
            id: 'utils',
            font: '𝙐𝙏𝙄𝙇𝙎',
            emoji: '⚙️',
            description: 'Utility commands for miscellaneous tasks. 🛠️'
        },
        {
            id: 'weeb',
            font: '𝙒𝙀𝙀𝘽',
            emoji: '🎐',
            description: 'Weeb-related commands for anime fans. 🍱'
        }
    ]

    public override execute = async (
        M: Message,
        { context, flags }: IArgs
    ): Promise<void> => {
        let commands = Array.from(this.handler.commands, ([command, data]) => ({
            command,
            data
        })).filter((command) => command.data.config.category !== 'dev')
        const { nsfw } = await this.client.DB.getGroup(M.from)
        if (!nsfw)
            commands = commands.filter(
                ({ data }) => data.config.category !== 'nsfw'
            )
        const categories: string[] = []
        for (const command of commands) {
            if (categories.includes(command.data.config.category)) continue
            categories.push(command.data.config.category)
        }
        let text: string = `👋🏻 (❤️ω❤️) Konnichiwa, senpai ${M.sender.username}! this is ${this.client.config.name}\n\n🎋 *Support us by following us on instagram:*
https://www.instagram.com/das_abae
                                    
This help menu is designed to help you get started with the bot.\n\n    ⇓ *📪 Command list 📪* ⇓`
        if (!context) {
            const sections: {
                title: string
                highlight_label: string
                rows: {
                    header: string
                    title: string
                    description: string
                    id: string
                }[]
            }[] = categories.map((category) => {
                return {
                    title: category.toUpperCase(),
                    highlight_label: '',
                    rows: commands
                        .filter(
                            (command) =>
                                command.data.config.category === category
                        )
                        .map((cmd) => {
                            return {
                                header: '',
                                title: this.client.utils.capitalize(
                                    cmd.data.name
                                ),
                                description: '',
                                id: `${this.client.config.prefix}help ${cmd.data.name}`
                            }
                        })
                }
            })

            return void (await M.sendButtonMessage({
                header: `   ⛩️ *❯──「  ${this.client.config.name.toUpperCase()} 」──❮* ⛩️\n`,
                body: text,
                footer: `${this.client.config.name}© 2024`,
                buttons: new Array({
                    name: 'single_select',
                    buttonParamsJson: JSON.stringify({
                        title: '𝘾𝘼𝙏𝙀𝙂𝙊𝙍𝙔',
                        sections
                    })
                })
            }))
        } else if (flags.includes('--list')) {
            const catagoryiesWithCommnads = categories.map((category) => {
                return {
                    category,
                    style: this.list.find(
                        ({ id }) => id == category.toLocaleLowerCase()
                    ),
                    commands: commands
                        .filter(
                            (command) =>
                                command.data.config.category === category
                        )
                        .map(({ data }) => data)
                }
            })
            text += '\n\n'
            text += catagoryiesWithCommnads
                .map(
                    (e, i) =>
                        `*Category:* ${this.client.utils.capitalize(
                            e.category
                        )} ${e.style?.emoji} \n*Description:* ${
                            e.style?.description
                        }\n*Usage:* ${this.client.config.prefix}help ${i + 1}`
                )
                .join('\n\n')

            text += '\n\n'
            text += `*📇 Notes:*
*➪ Use ${this.client.config.prefix}help <category number> from help the list to see its description and usage*
*➪ Eg: ${this.client.config.prefix}help 1*`

            return void (await M.reply(text))
        } else {
            const cmd = context.trim().toLowerCase()
            const command =
                this.handler.commands.get(cmd) || this.handler.aliases.get(cmd)
            if (!command)
                return void (await M.reply(
                    `No command found | *"${context.trim()}"*`
                ))
            return void (await M.reply(
                `🎐 *Command:* ${this.client.utils.capitalize(
                    command.name
                )}\n🎴 *Aliases:* ${
                    !command.config.aliases
                        ? ''
                        : command.config.aliases
                              .map((alias) =>
                                  this.client.utils.capitalize(alias)
                              )
                              .join(', ')
                }\n🔗 *Category:* ${this.client.utils.capitalize(
                    command.config.category
                )}\n⏰ *Cooldown:* ${
                    command.config.cooldown ?? 3
                }s\n🎗 *Usage:* ${command.config.usage
                    .split('||')
                    .map(
                        (usage) => `${this.client.config.prefix}${usage.trim()}`
                    )
                    .join(' | ')}\n🧧 *Description:* ${
                    command.config.description
                }`
            ))
        }
    }
}

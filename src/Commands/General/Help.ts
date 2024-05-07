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
            let text = `👋🏻 (❤️ω❤️) Konnichiwa, senpai ${M.sender.username}! this is ${this.client.config.name}\n\n🎋 *Support us by following us on instagram:*
https://www.instagram.com/das_abae
                        
This help menu is designed to help you get started with the bot.\n\n    ⇓ *📪 Command list 📪* ⇓`
            const categories: string[] = []
            for (const command of commands) {
                if (categories.includes(command.data.config.category)) continue
                categories.push(command.data.config.category)
            }
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
        } else {
            const cmd = context.trim().toLowerCase()
            const command =
                this.handler.commands.get(cmd) || this.handler.aliases.get(cmd)
            if (!command)
                return void M.reply(`No command found | *"${context.trim()}"*`)
            return void M.reply(
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
            )
        }
    }
}

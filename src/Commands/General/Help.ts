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
  public override execute = async (M: Message, { context }: IArgs): Promise<void> => {
    if (!context) {
      let commands = Array.from(this.handler.commands, ([command, data]) => ({
        command,
        data
      })).filter((command) => command.data.config.category !== 'dev')
      const { nsfw } = await this.client.DB.getGroup(M.from)
      if (!nsfw) commands = commands.filter(({ data }) => data.config.category !== 'nsfw')
      let text = `*👋🏻 (❤️ω❤️) Konnichiwa, senpai *@${M.sender.jid.split('@')[0]}*! I am ${this.client.config.name}, your trusty companion. 🌟 Prepare for an adventure with my mighty powers! 🚀✨ My command prefix is set to "${this.client.config.prefix}"—the key to unlock my magic! 🔮✨:*`
      const categories: string[] = []
      for (const command of commands) {
        if (categories.includes(command.data.config.category)) continue
        categories.push(command.data.config.category)
      }
      for (const category of categories) {
        const categoryCommands: string[] = []
        const filteredCommands = commands.filter((command) => command.data.config.category === category)
        text += `\n\n*┏━━━━━━°⌜ ${this.client.utils.capitalize(category)} ⌟°━━━━━━┓*\n`
        filteredCommands.forEach((command) => categoryCommands.push(command.data.name))
        text += `➤ \`\`\`${categoryCommands.join(', ')}\`\`\``
      }
      text += '\n\n'
      text += `*📇 Notes:*
*➪ Use ${this.client.config.prefix}help <command name> from help the list to see its description and usage*
*➪ Eg: ${this.client.config.prefix}help profile*
*➪ <> means required and [ ] means optional, don't include <> or [ ] when using command.*`
      return void (await M.reply(text, 'text', undefined, undefined, undefined, [M.sender.jid]))
    } else {
      const cmd = context.trim().toLowerCase()
      const command = this.handler.commands.get(cmd) || this.handler.aliases.get(cmd)
      if (!command) return void M.reply(`No command found | *"${context.trim()}"*`)
      return void M.reply(
        `🎐 *Command:* ${this.client.utils.capitalize(command.name)}\n🎴 *Aliases:* ${!command.config.aliases
          ? ''
          : command.config.aliases.map((alias) => this.client.utils.capitalize(alias)).join(', ')
        }\n🔗 *Category:* ${this.client.utils.capitalize(command.config.category)}\n⏰ *Cooldown:* ${command.config.cooldown ?? 3
        }s\n🎗 *Usage:* ${command.config.usage
          .split('||')
          .map((usage) => `${this.client.config.prefix}${usage.trim()}`)
          .join(' | ')}\n🧧 *Description:* ${command.config.description}`
      )
    }
  }
}

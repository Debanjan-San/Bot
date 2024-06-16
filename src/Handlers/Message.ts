import { join } from 'path'
import { readdirSync } from 'fs-extra'
import chalk from 'chalk'
import { AnyMessageContent } from '@whiskeysockets/baileys'
import { Message, Client, BaseCommand } from '../Structures'
import { chatBot } from '../lib/ChatBot'
import { getStats } from '../lib'
import { ICommand, IArgs, WaifuResponse, TMessage } from '../Types'
import Game from 'chess-node'
import MWL from '../lib/MyWaifuList'

export class MessageHandler {
    constructor(private client: Client) {}

    public groups!: string[]

    public chess = {
        games: new Map<string, Game | undefined>(),
        challenges: new Map<
            string,
            { challenger: string; challengee: string } | undefined
        >(),
        ongoing: new Set<string>()
    }

    public summonHaigusha = async (
        jid: string,
        slug: string
    ): Promise<void> => {
        const { fetchCharacter } = new MWL()
        const haigusha = (await fetchCharacter(slug)) as WaifuResponse
        if (!haigusha) return void undefined
        this.haigushaResponse.set(jid, haigusha)
        let text = `🎐 *Name:* ${haigusha.name}\n\n`
        if (haigusha.original_name && haigusha.original_name !== '')
            text += `🎗 *Original Name:* ${haigusha.original_name}\n\n`
        if (haigusha.age) text += `🍀 *Age:* ${haigusha.age}\n\n`
        text += `🎀 *Gender:* ${haigusha.gender}\n\n🔗 *Appearance:* ${haigusha.appears_in}\n\n❄ *Description:* ${haigusha.description}`
        const buffer = await this.client.utils.getBuffer(haigusha.image_link)
        const buttonMessage = {
            image: buffer,
            caption: text,
            headerType: 4,
            jpegThumbnail: buffer.toString('base64'),
            contextInfo: {
                externalAdReply: {
                    title: haigusha.name,
                    mediaType: 1,
                    thumbnail: buffer,
                    sourceUrl: ''
                }
            }
        }
        return void (await this.client.sendMessage(
            jid,
            buttonMessage as unknown as AnyMessageContent
        ))
    }

    public handleMessage = async (M: Message): Promise<void> => {
        const { prefix } = this.client.config
        const args = M.content.split(' ')
        const title =
            M.chat === 'dm' ? 'DM' : M.groupMetadata?.subject || 'Group'
        await this.moderate(M)
        await this.chatBot(M)
        await this.isOfflineUser(M)
        if (!args[0] || !args[0].startsWith(prefix))
            return void this.client.log(
                `${chalk.cyanBright('Message')} from ${chalk.yellowBright(
                    M.sender.username
                )} in ${chalk.blueBright(title)}`
            )
        this.client.log(
            `${chalk.cyanBright(
                `Command ${args[0]}[${args.length - 1}]`
            )} from ${chalk.yellowBright(
                M.sender.username
            )} in ${chalk.blueBright(title)}`
        )
        const { bot } = await this.client.DB.getGroup(M.from)
        const commands = ['switch', 'hello', 'hi']
        const { ban, tag } = await this.client.DB.getUser(M.sender.jid)
        if (!tag)
            await this.client.DB.updateUser(
                M.sender.jid,
                'tag',
                'set',
                this.client.utils.generateRandomUniqueTag()
            )
        const cmd = args[0].toLowerCase().slice(prefix.length)
        if (
            bot != this.client.config.name.split(' ')[0] &&
            bot !== 'all' &&
            !commands.includes(cmd)
        )
            return void null
        if (ban.banned)
            return void M.reply(
                `You are banned from using commands. Banned by *${ban.bannedBy}* at *${ban.bannedIn}* in *${ban.time} (GMT)*. ❓ Reason: *${ban.reason}*`
            )
        const command = this.commands.get(cmd) || this.aliases.get(cmd)
        if (!command) return void M.reply('No such command, Baka!')
        const disabledCommands = await this.client.DB.getDisabledCommands()
        const index = disabledCommands.findIndex(
            (CMD) => CMD.command === command.name
        )
        if (index >= 0)
            return void M.reply(
                `💈 *${this.client.utils.capitalize(
                    cmd
                )}* is currently disabled by *${
                    disabledCommands[index].deniedBy
                }* in *${disabledCommands[index].time} (GMT)*. 🎈 Reason: *${
                    disabledCommands[index].reason
                }*`
            )
        if (M.chat === 'dm' && !command.config.dm)
            return void M.reply('You can use this command only in groups')
        if (command.config.category === 'moderation' && !M.sender.isAdmin)
            return void M.reply(
                'This command can only be used by the group admins'
            )
        if (
            command.config.category === 'nsfw' &&
            !(await this.client.DB.getGroup(M.from)).nsfw
        )
            return void M.reply(
                'This comand can ONLY be used in NSFW enabled groups!'
            )

        if (
            command.config.category === 'nsfw' &&
            !(await this.client.DB.getGroup(M.from)).nsfw
        )
            return void M.reply(
                "Don't be a pervert, Baka! This comand can only be used in NSFW enabled groups"
            )
        if (command.config.category === 'dev' && !M.sender.isMod)
            return void M.reply('This command can only be used by the MODS')
        const isAdmin = M.groupMetadata?.admins?.includes(
            this.client.correctJid(this.client.user?.id || '')
        )
        if (command.config.adminRequired && !isAdmin)
            return void M.reply('I need to be an admin to use this command')

        const cooldownAmount = (command.config.cooldown ?? 3) * 1000
        const time = cooldownAmount + Date.now()
        if (this.cooldowns.has(`${M.sender.jid}${command.name}`)) {
            const cd = this.cooldowns.get(`${M.sender.jid}${command.name}`)
            const remainingTime = this.client.utils.convertMs(
                (cd as number) - Date.now()
            )
            return void M.reply(
                `Woahh! Slow down. You can use this command again in *${remainingTime}* ${
                    remainingTime > 1 ? 'seconds' : 'second'
                }`
            )
        } else this.cooldowns.set(`${M.sender.jid}${command.name}`, time)
        setTimeout(
            () => this.cooldowns.delete(`${M.sender.jid}${command.name}`),
            cooldownAmount
        )
        await this.client.DB.setExp(M.sender.jid, command.config.exp || 10)
        await this.handleUserStats(M)
        try {
            await M.react('✅')
            await command.execute(M, this.formatArgs(args))
        } catch (error) {
            this.client.log((error as any).message, true)
        }
    }

    public isOfflineUser = async (M: Message): Promise<void> => {
        if (M.chat !== 'group') return void null
        const { afk } = await this.client.DB.getUser(M.sender.jid)
        if (!afk) return void null
        if (M.message.key.fromMe) return void null
        if (afk.isOffline) {
            await this.client.DB.updateUser(M.sender.jid, 'afk', 'set', {
                isOffline: false
            })
            return void M.reply(
                `${M.sender.username} is back to Online! \nTime you were AFK for ${afk.time}`
            )
        }
        if (M.quoted || M.mentioned.length) {
            const mentions = M.quoted ? [M.quoted.sender.jid] : M.mentioned
            for (const mention of mentions) {
                const { username } = this.client.contact.getContact(mention)
                const { afk: info } = await this.client.DB.getUser(mention)
                if (info.isOffline)
                    return void M.reply(
                        `${username} is afk!\nReason: ${info.reason}\nLast seen: ${info.time}`
                    )
            }
        }
    }

    private moderate = async (M: Message): Promise<void> => {
        if (M.chat !== 'group') {
            const urls = M.urls
            if (!urls.length) return void null
            const groupinvites = urls.filter((url) =>
                url.includes('chat.whatsapp.com')
            )
            if (!groupinvites.length) return void null
            this.client.log(
                `${chalk.blueBright('GROUP REQUEST')} from ${chalk.yellowBright(
                    M.sender.username
                )} in ${chalk.cyanBright('DM')}`
            )
            const text = `Request from *@${M.sender.jid.split('@')[0]}*\n\n${
                M.content
            }`
            if (M.message.key.fromMe) return void null
            await this.client.sendMessage(this.client.config.adminsGroup, {
                text,
                mentions: [M.sender.jid]
            })
            return void M.reply('Your request has been sent')
        }
        const { mods } = await this.client.DB.getGroup(M.from)
        if (
            !mods ||
            M.sender.isAdmin ||
            !M.groupMetadata?.admins?.includes(
                this.client.correctJid(this.client.user?.id || '')
            )
        )
            return void null
        const urls = M.urls
        if (urls.length > 0) {
            const groupinvites = urls.filter((url) =>
                url.includes('chat.whatsapp.com')
            )
            if (groupinvites.length > 0) {
                groupinvites.forEach(async (invite) => {
                    const code = await this.client.groupInviteCode(M.from)
                    const inviteSplit = invite.split('/')
                    if (inviteSplit[inviteSplit.length - 1] !== code) {
                        const title = M.groupMetadata?.subject || 'Group'
                        this.client.log(
                            `${chalk.blueBright('MOD')} ${chalk.green(
                                'Group Invite'
                            )} by ${chalk.yellow(
                                M.sender.username
                            )} in ${chalk.cyanBright(title)}`
                        )
                        return void (await this.client.groupParticipantsUpdate(
                            M.from,
                            [M.sender.jid],
                            'remove'
                        ))
                    }
                })
            }
        }
    }

    private chatBot = async (M: Message) => {
        if (M.chat !== 'group') return void null
        const { chatbot } = await this.client.DB.getGroup(M.from)
        if (!chatbot || M.message.key.fromMe) return void null
        if (M.quoted?.sender) M.mentioned.push(M.quoted.sender.jid)
        if (
            !M.mentioned.includes(
                this.client.utils.sanitizeJid(this.client.user?.id ?? '')
            )
        )
            return
        M.mentioned.pop()
        const text = M.content.replace(
            /\b(\d+)\b/g,
            (match: string, user: string) =>
                this.client.contact.getContact(user).username || match
        )
        const previousChats = this.memories.get(M.sender.jid) ?? []
        const { response, memories, error } = await chatBot(text, previousChats)
        if (error) return void (await M.reply(error))
        this.memories.set(M.sender.jid, memories)
        return void (await M.reply(response as string))
    }

    private formatArgs = (args: string[]): IArgs => {
        args.splice(0, 1)
        return {
            args,
            context: args.join(' ').trim(),
            flags: args.filter((arg) => arg.startsWith('--'))
        }
    }

    public loadCommands = (): void => {
        this.client.log('Loading Commands...')
        const files = readdirSync(join(...this.path)).filter(
            (file) => !file.startsWith('_')
        )
        for (const file of files) {
            this.path.push(file)
            const Commands = readdirSync(join(...this.path))
            for (const Command of Commands) {
                this.path.push(Command)
                const command: BaseCommand = new (require(join(
                    ...this.path
                )).default)()
                command.client = this.client
                command.handler = this
                this.commands.set(command.name, command)
                if (command.config.aliases)
                    command.config.aliases.forEach((alias) =>
                        this.aliases.set(alias, command)
                    )
                this.client.log(
                    `Loaded: ${chalk.yellowBright(
                        command.name
                    )} from ${chalk.cyanBright(command.config.category)}`
                )
                this.path.splice(this.path.indexOf(Command), 1)
            }
            this.path.splice(this.path.indexOf(file), 1)
        }
        return this.client.log(
            `Successfully loaded ${chalk.cyanBright(this.commands.size)} ${
                this.commands.size > 1 ? 'commands' : 'command'
            } with ${chalk.yellowBright(this.aliases.size)} ${
                this.aliases.size > 1 ? 'aliases' : 'alias'
            }`
        )
    }

    private handleUserStats = async (M: Message): Promise<void> => {
        const { experience, level } = await this.client.DB.getUser(M.sender.jid)
        const { requiredXpToLevelUp } = getStats(level)
        if (requiredXpToLevelUp > experience) return void null
        await this.client.DB.updateUser(M.sender.jid, 'level', 'inc', 1)
    }

    public commands = new Map<string, ICommand>()

    public aliases = new Map<string, ICommand>()

    private memories = new Map<string, TMessage[] | undefined>()

    private cooldowns = new Map<string, number>()

    private path = [__dirname, '..', 'Commands']

    public haigushaResponse = new Map<string, WaifuResponse>()

    public quiz = {
        game: new Map<string, { answer: string; options: string[] }>(),
        timer: new Map<string, { id: NodeJS.Timer }>(),
        board: new Map<
            string,
            { players: { jid: string; points: number }[] }
        >(),
        answered: new Map<string, { players: string[] }>(),
        forfeitable: new Map<string, boolean>()
    }
}

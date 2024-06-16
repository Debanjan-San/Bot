import { BaseCommand, Command, Message } from '../../Structures'
import { IArgs, TGroupFeature } from '../../Types'

@Command('enable', {
    description: 'Enables a certain feature of a group',
    category: 'moderation',
    usage: 'enable [feature]',
    dm: true,
    exp: 10,
    cooldown: 10
})
export default class command extends BaseCommand {
    override execute = async (
        M: Message,
        { context }: IArgs
    ): Promise<void> => {
        if (!context) {
            let text = `🚀 *Available Features* 🚀`
            for (const info of this.info) {
                text += `\n\n${info.emoji} *${this.client.utils.capitalize(
                    info.feature
                )}* ${info.emoji}\n📄 *Description:* ${
                    info.description
                }\n🔰 *Option:* ${this.client.config.prefix}enable ${
                    info.feature
                }`
            }
            return void M.reply(text)
        }
        const feature = context
            .split(' ')[0]
            .toLowerCase()
            .trim() as TGroupFeature
        if (this.info.findIndex((x) => x.feature === feature) < 0)
            return void M.reply(
                `*Invalid option.* Use *${this.client.config.prefix}enable* to see all of the available features`
            )
        const group = await this.client.DB.getGroup(M.from)
        if (group[feature])
            return void M.reply(
                `🟨 *${this.client.utils.capitalize(
                    feature
                )}* is already enabled, Baka!`
            )
        await this.client.DB.updateGroup(M.from, feature, true)
        return void M.reply(
            `🟩 *${this.client.utils.capitalize(feature)}* is enabled.`
        )
    }

    private info: IGroupFeatureInfo[] = [
        {
            feature: 'events',
            description:
                'Enables the bot to welcome new members or give farewell to the ones who left the group',
            emoji: '🎉'
        },
        {
            feature: 'mods',
            description:
                'Enables the bot to remove the member which sent an invite link for other group (will work if and only if the bot is admin)',
            emoji: '🧧'
        },
        {
            feature: 'nsfw',
            description: 'Enables the bot to send NSFW contents in the group',
            emoji: '🍀'
        },
        {
            feature: 'chatbot',
            description: 'Enables the bot to chat',
            emoji: '🤖'
        }
    ]
}

interface IGroupFeatureInfo {
    feature: TGroupFeature
    description: string
    emoji: '🧧' | '🎉' | '🍀' | '🤖'
}

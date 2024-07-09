import { BaseCommand, Message, Command } from '../../Structures'
import { IArgs } from '../../Types'

@Command('instauser', {
    aliases: ['igstalk'],
    description: 'Search instagram user',
    category: 'utils',
    usage: 'instauser [username]',
    exp: 10
})
export default class extends BaseCommand {
    public override execute = async (M: Message, { context }: IArgs): Promise<void> => {
        if (!context) return void (await M.reply('Provide a username!!'))
        const term = context.trim()
        const data = await this.client.utils.fetch<{
            id: string
            name: string
            username: string
            bio: string
            type: 'public' | 'private'
            followers: number
            following: number
            profileUrl: string
            error?: string
        }>(`https://weeb-api.vercel.app/insta?username=${term}`)
        if (data.error) return void (await M.reply('User not found!'))
        return void (await M.reply(
            await this.client.utils.getBuffer(data.profileUrl),
            'image',
            undefined,
            undefined,
            `📛 *Username: ${data.name}*

        ◻️ *Tag: @${data.username}*
        
        💭 *Type: ${data.type}*
        
        👥 *Followers: ${data.followers}*
        
        ⛩ *Following: ${data.following}*
        
        💮 *Bio:* ${data.bio}`
        ))
    }
}

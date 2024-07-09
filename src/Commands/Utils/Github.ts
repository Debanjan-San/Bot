import { BaseCommand, Message, Command } from '../../Structures'
import { IArgs } from '../../Types'

@Command('github', {
    aliases: ['git'],
    description: 'Search on the github ',
    category: 'utils',
    usage: 'github [query]',
    exp: 10
})
export default class extends BaseCommand {
    public override execute = async (M: Message, { context }: IArgs): Promise<void> => {
        if (!context) return void M.reply('Provide a search term')
        const term = context.trim()
        const data = await this.client.utils
            .fetch<{
                items: {
                    name: string
                    watchers_count: string
                    stargazers_count: string
                    forks_count: string
                    description: string
                    html_url: string
                }[]
            }>(`https://api.github.com/search/repositories?q=${term}`)
            .catch(() => null)
        if (!data?.items) return void M.reply('Could not find')
        let text = `☆☆💥 *GITHUB SEARCH* 💥☆☆\n\n`
        for (let i = 0; i < data.items.length; i++) {
            text += `🪧 *Name:* ${data.items[i].name}\n👤 *Watchers:* ${data.items[i].watchers_count}\n⭐️ *Stars:* ${data.items[i].stargazers_count}\n📛 *Forks:* ${data.items[i].forks_count}\n🖥 *Description:* ${data.items[i].description}\n🌐 *Link:* ${data.items[i].html_url}\n\n`
        }
        M.reply(text)
    }
}

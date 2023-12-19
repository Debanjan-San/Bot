import { BaseCommand, Command, Message } from '../../Structures'

@Command('husbando', {
    description: 'Sends a random husbando image',
    category: 'weeb',
    usage: 'husbando',
    exp: 20,
    cooldown: 5
})
export default class extends BaseCommand {
    public override execute = async ({ reply }: Message): Promise<void> => {
        const { results } = await this.client.utils.fetch<{
            results: {
                artist_href: string
                artist_name: string
                source_url: string
                url: string
            }[]
        }>('https://nekos.best/api/v2/husbando')
        return void (await reply(await this.client.utils.getBuffer(results[0].url), 'image'))
    }
}

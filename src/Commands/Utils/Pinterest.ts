import { BaseCommand, Message, Command } from '../../Structures'
import { IArgs } from '../../Types'

interface IPinterestResponse {
    title: string
    type: string
    pinner: {
        name: string
        username: string
        image: string
    }
    imageUrl: string
}

@Command('pinterest', {
    aliases: ['pin'],
    description: 'Sends a image from pinterest of a given topic',
    category: 'utils',
    usage: 'pinterest [query]',
    exp: 10
})
export default class extends BaseCommand {
    public override execute = async (M: Message, { context }: IArgs): Promise<void> => {
        if (!context) return void (await M.reply('Sorry you did not give any search term!'))
        const data: IPinterestResponse[] = await this.client.utils.fetch(
            `https://weeb-api.vercel.app/pinterest?query=${context}`
        )
        const buffer = await this.client.utils.getBuffer(
            data?.[Math.floor(Math.random() * data.length)]?.imageUrl as string
        )

        return void (await M.reply(buffer, 'image', true, undefined, `Here you go`, undefined))
    }
}

import axios from 'axios'
import { BaseCommand, Message, Command } from '../../Structures'
import { IArgs } from '../../Types'

@Command('imagine', {
    description: 'Sends an image accorcing to your promt',
    category: 'utils',
    usage: 'imagin [query]',
    exp: 10
})
export default class extends BaseCommand {
    private imagination = async (
        query: string
    ): Promise<
        {
            id: string
            prompt: string
            nsfw: string
            author: string
            imageUrl: string
        }[]
    > => {
        const { data } = (
            await axios.post('https://www.seaart.ai/api/v1/square/search', {
                obj_name: query,
                obj_type: 1,
                offset: 0,
                page: 1,
                page_size: 50,
                order_by: 'new'
            })
        ).data
        const results = data.items.map(
            (item: { id: string; prompt: string; nsfw: boolean; author: { name: string }; cover: string }) => ({
                id: item.id,
                prompt: item.prompt,
                nsfw: item.nsfw,
                author: item.author.name || '',
                imageUrl: item.cover.replace('_low', '_high')
            })
        )
        return results
    }
    public override execute = async (M: Message, { context }: IArgs): Promise<void> => {
        if (!context) return void (await M.reply('Baka!! what image you wnt?'))
        const term = context.trim()
        const img = await this.imagination(term)
        if (!img.length) return void (await M.reply('*404 Error! Found no Results*'))
        const buffer = await this.client.utils.getBuffer(img?.[Math.floor(Math.random() * img.length)]?.imageUrl)
        await M.reply(buffer, 'image').catch(() => {
            return void M.reply('An error occurred. Try again later')
        })
    }
}

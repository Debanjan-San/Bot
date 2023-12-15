import { BaseCommand, Command, Message } from '../../Structures'
import axios from 'axios'

@Command('maal', {
    description: 'Sends a random nsfw video',
    category: 'nsfw',
    usage: 'maal',
    exp: 20,
    cooldown: 20
})
export default class extends BaseCommand {
    public override execute = async ({ reply }: Message): Promise<void> => {
        const results = await axios.get('https://onlytik.com')
        const content = results.data.match(/var initialVideo = (\{.*\});/)[1]
        const data = JSON.parse(content)
        const id = Object.keys(data.videoData)[0]
        const result = data.videoData[id]
        const buffer = await this.client.utils.getBuffer(result.url)
        return void (await reply(buffer, 'video'))
    }
}

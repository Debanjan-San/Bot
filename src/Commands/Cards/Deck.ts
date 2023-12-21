import { BaseCommand, Command, Message } from '../../Structures'
import Collage from '../../lib/Collage'

@Command('deck', {
    description: "Displays user's deck",
    cooldown: 15,
    category: 'cards',
    usage: 'deck',
    exp: 10
})
export default class command extends BaseCommand {
    override execute = async (M: Message): Promise<void> => {
        try {
            const { deck, tag } = await this.client.DB.getUser(M.sender.jid)
            if (deck.length < 1) return void M.reply("You don't have any cards in your deck")
            if (M.numbers.length < 1 || M.numbers[0] > deck.length) {
                let text = `🃏 *Deck*\n\n🎴 *ID:*\n\t🏮 *Username:* ${M.sender.username}\n\t🧧 *Tag:* #${tag}\n`
                for (let i = 0; i < deck.length; i++)
                    text += `\n*#${i + 1}*\n🎈 *Name:* ${deck[i].name}\n🎐 *Tier:* ${deck[i].tier}\n`
                const collage = await new Collage(deck.map(({ image }) => image)).toBuffer()
                return void (await M.reply(collage, 'image', undefined, undefined, text, undefined, undefined, collage))
            } else {
                const i = M.numbers[0] - 1
                let { name, image, tier, description } = deck[i]
                if (image.endsWith('.webm')) image = image.replace('.webm', '.gif')
                let buffer = await this.client.utils.getBuffer(image)
                if (tier === '6' || tier === 'S') buffer = await this.client.utils.gifToMp4(buffer)
                const text = `🎈 *Name:* ${name}\n📘 *Description:* ${description}\n🎐 *Tier:* ${tier}`
                return void (await M.reply(
                    buffer,
                    tier === '6' || tier === 'S' ? 'video' : 'image',
                    tier === '6' || tier === 'S',
                    undefined,
                    text,
                    undefined,
                    undefined,
                    await this.client.utils.getBuffer('https://cdn.shoob.gg/images/content/card_back.png')
                ).catch((err) => console.log(err)))
            }
        } catch (e) {
            M.reply(JSON.stringify(e))
        }
    }
}

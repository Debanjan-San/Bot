import { BaseCommand, Command, Message } from '../../Structures'

@Command('collection', {
    description: "Displays user's collection of cards",
    cooldown: 15,
    category: 'cards',
    usage: 'collection',
    exp: 10,
    aliases: ['collec', 'coll']
})
export default class command extends BaseCommand {
    override execute = async (M: Message): Promise<void> => {
        const { cardCollection, tag } = await this.client.DB.getUser(M.sender.jid)
        if (cardCollection.length < 1) return void M.reply("You don't have any cards in your collection")
        if (M.numbers.length < 1 || M.numbers[0] > cardCollection.length) {
            let text = `🃏 *Collection*\n\n🎴 *ID:*\n\t🏮 *Username:* ${M.sender.username}\n\t🧧 *Tag:* #${tag}\n\n`
            for (let i = 0; i < cardCollection.length; i++)
                text += `\n*#${i + 1}* ${cardCollection[i].name} (Tier ${cardCollection[i].tier})`
            let { image, tier } = cardCollection[0]
            if (image.endsWith('.webm')) image = image.replace('.webm', '.gif')
            let buffer = await this.client.utils.getBuffer(image)
            if (tier === '6' || tier === 'S') buffer = await this.client.utils.gifToMp4(buffer)
            return void (await M.reply(
                buffer,
                tier === '6' || tier === 'S' ? 'video' : 'image',
                tier === '6' || tier === 'S',
                undefined,
                text
            ))
        } else {
            const i = M.numbers[0] - 1
            let { name, image, tier, description } = cardCollection[i]
            if (image.endsWith('.webm')) image = image.replace('.webm', '.gif')
            let buffer = await this.client.utils.getBuffer(image)
            if (tier === '6' || tier === 'S') buffer = await this.client.utils.gifToMp4(buffer)
            const text = `🎈 *Name:* ${name}\n📘 *Description:* ${description}\n🎐 *Tier:* ${tier}`
            return void (await M.reply(
                buffer,
                tier === '6' || tier === 'S' ? 'video' : 'image',
                tier === '6' || tier === 'S',
                undefined,
                text
            ))
        }
    }
}

import { Command, BaseCommand, Message } from '../../Structures'
import { TCardsTier } from '../../Types'

@Command('claim', {
    description: 'Claims the last appeared card',
    usage: 'claim',
    category: 'cards',
    cooldown: 15,
    exp: 10
})
export default class command extends BaseCommand {
    override execute = async (M: Message): Promise<void> => {
        if (!this.handler.cardResponse.has(M.from)) return void M.reply("🟥 *There aren't any cards to claim*")
        const data = this.handler.cardResponse.get(M.from) as {
            price: number
            name: string
            tier: TCardsTier
            id: string
            image: string
            url: string
            description: string
        }
        const { deck, cardCollection: collection, wallet } = await this.client.DB.getUser(M.sender.jid)
        if (data.price > wallet)
            return void M.reply(`🟥 *You need ${data.price - wallet} more gold in your wallet to claim this card*`)
        this.handler.cardResponse.delete(M.from)
        let flag = false
        if (deck.length >= 12) flag = true
        flag
            ? collection.push({
                  name: data.name,
                  tier: data.tier,
                  image: data.image,
                  id: data.id,
                  url: data.url,
                  description: data.description
              })
            : deck.push({
                  name: data.name,
                  tier: data.tier,
                  image: data.image,
                  id: data.id,
                  url: data.url,
                  description: data.description
              })
        await this.client.DB.setGold(M.sender.jid, -data.price)
        await this.client.DB.user.updateOne({ jid: M.sender.jid }, { $set: { deck, cardCollection: collection } })
        const claimedCards = (await this.client.DB.getClaimedCards()).data
        const index = claimedCards.findIndex((x) => x.tier === data.tier && x.name === data.name)
        if (index < 0) {
            claimedCards.push({ name: data.name, tier: data.tier })
            await this.client.DB.updateClaimedCards(claimedCards)
        }
        const buttonMessage = {
            text: `🎉 You have claimed *${data.name} - ${data.tier}*. It has been stored in your ${
                flag ? 'collection' : 'deck'
            }`
        }
        return void (await this.client.sendMessage(M.from, buttonMessage, {
            quoted: M.message
        }))
    }
}

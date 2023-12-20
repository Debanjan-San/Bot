import { BaseCommand, Command, Message } from '../../Structures'
import { IArgs, TCardsTier } from '../../Types'

@Command('cards', {
    description: "Displays user's claimed cards",
    category: 'cards',
    usage: 'cards',
    cooldown: 10,
    exp: 10
})
export default class command extends BaseCommand {
    override execute = async (M: Message, { flags }: IArgs): Promise<void> => {
        let sorted = flags.includes('--tier')
        const { deck, cardCollection } = await this.client.DB.getUser(M.sender.jid)
        const cards = [...deck, ...cardCollection]
        if (cards.length < 1) return void M.reply("You haven't claimed any cards yet")
        let text = `🃏 *Cards | ${M.sender.username}*\n`
        if (!sorted) {
            for (const card of cards) text += `\n*❯ ${card.name}*`
            let image = cards[0].image
            if (image.endsWith('.webm')) image = image.replace('.webm', '.gif')
            let buffer = await this.client.utils.getBuffer(image)
            if (cards[0].tier === '6' || cards[0].tier === 'S') buffer = await this.client.utils.gifToMp4(buffer)
            return void (await M.reply(
                buffer,
                cards[0].tier === '6' || cards[0].tier === 'S' ? 'video' : 'image',
                cards[0].tier === '6' || cards[0].tier === 'S',
                undefined,
                text,
                undefined,
                undefined,
                await this.client.utils.getBuffer('https://cdn.shoob.gg/images/content/card_back.png')
            ))
        } else {
            const tiers: TCardsTier[] = []
            cards.sort((x, y) => y.tier.localeCompare(x.tier))
            for (const card of cards) {
                if (tiers.includes(card.tier)) continue
                tiers.push(card.tier)
            }
            for (const tier of tiers) {
                text += `\n${this.emojis[tier]} *Tier ${tier}*\n\n`
                const filteredCards = cards.filter((card) => card.tier === tier)
                for (const card of filteredCards) text += `*❯ ${card.name}*\n`
            }
            let image = cards[0].image
            if (image.endsWith('.webm')) image = image.replace('.webm', '.gif')
            let buffer = await this.client.utils.getBuffer(image)
            if (cards[0].tier === '6' || cards[0].tier === 'S') buffer = await this.client.utils.gifToMp4(buffer)
            return void (await M.reply(
                buffer,
                cards[0].tier === '6' || cards[0].tier === 'S' ? 'video' : 'image',
                cards[0].tier === '6' || cards[0].tier === 'S',
                undefined,
                text,
                undefined,
                undefined,
                await this.client.utils.getBuffer('https://cdn.shoob.gg/images/content/card_back.png')
            ))
        }
    }

    private emojis = {
        S: '👑',
        6: '💎',
        5: '🔮',
        4: '🎗',
        3: '🧿',
        2: '♦',
        1: '🎴'
    }
}

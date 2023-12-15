import { BaseCommand, Command, Message } from '../../Structures'

@Command('fact', {
    description: 'Sends a random fact',
    usage: 'fact',
    cooldown: 5,
    category: 'fun',
    exp: 20
})
export default class command extends BaseCommand {
    override execute = async ({ reply }: Message): Promise<void> => {
        const { fact } = await this.client.utils.fetch<{
            fact: string
        }>('https://api.factslip.com/fact')
        return void (await reply(fact))
    }
}

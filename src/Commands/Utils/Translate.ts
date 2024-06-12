import { BaseCommand, Command, Message } from '../../Structures'
import { IArgs } from '../../Types'

@Command('translate', {
    description: 'Translate text.',
    usage: 'translate [quote/caption] --[langTo]',
    category: 'utils',
    exp: 25,
    cooldown: 5,
    aliases: ['tl']
})
export default class command extends BaseCommand {
    override execute = async (
        M: Message,
        { flags, context }: IArgs
    ): Promise<void> => {
        const text = (
            M.quoted ? M.quoted.message.conversation : context
        ) as string
        if (!text || !flags)
            return void (await M.reply(
                `You are using wrong format ${this.client.config.prefix}tts [quote/caption] --[langTo]`
            ))
        const langTo = flags[0].replace('--', '')
        if (!this.supportedLanguages.includes(langTo))
            return void (await M.reply(
                `🔊 *Available languages:*\n\n ${this.supportedLanguages.join(
                    ', '
                )}\n\n${
                    this.client.config.prefix
                }tts [quote/caption] --[langTo]`
            ))
        const { error, translatedText } = await this.getTranslate(langTo, text)
        return void M.reply((translatedText ?? error) as string)
    }

    private supportedLanguages: string[] = [
        'ar',
        'ur',
        'en',
        'fr',
        'de',
        'id',
        'gu',
        'hi',
        'it',
        'ja',
        'kn',
        'ta',
        'te',
        'bn',
        'ml',
        'mr',
        'ne',
        'pa',
        'es',
        'ru',
        'pt',
        'tr',
        'vi'
    ]

    private getTranslate = async (
        langTo: string,
        text: string
    ): Promise<{
        langTo?: string
        translatedText?: string
        supportedLanguages?: string[]
        error?: string
    }> => {
        try {
            const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${langTo}&ie=UTF-8&dt=t&q=${encodeURIComponent(
                text
            )}`
            const data = (await this.client.utils.fetch(url, {
                Host: 'translate.google.com',
                ...this.client.utils.heders(),
                Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            })) as string[][]

            const translatedText = data[0]
                .map((item: string) => item[0])
                .join('')
            return translatedText.trim().length > 1
                ? { langTo, translatedText }
                : { error: 'Invalid Input!!' }
        } catch (error) {
            return { error: 'Failed to translate!!' }
        }
    }
}

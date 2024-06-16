import axios from 'axios'
import { TMessage, ChatBotResponse, Data } from '../Types'

const messages: TMessage[] = []

export const chatBot = async (
    text: string = '',
    memories: TMessage[] = []
): Promise<ChatBotResponse> => {
    messages.push(...memories)
    messages.push({
        id: 'K07GJTEoYUzi6Rl3Iz8p-',
        content: text,
        role: 'user'
    })

    try {
        const data: Data = {
            messages,
            id: 'K07GJTEoYUzi6Rl3Iz8p-',
            previewToken: null,
            userId: '88818298-97fd-4afd-a695-c87de3e662fd',
            codeModelMode: true,
            agentMode: {
                mode: true,
                id: 'AlicejQIth0N',
                name: 'Alice'
            },
            trendingAgentMode: {},
            isMicMode: false,
            isChromeExt: false,
            userSystemPrompt: 'beast-mode',
            githubToken: null,
            clickedAnswer2: false,
            clickedAnswer3: false,
            visitFromDelta: null
        }

        const response = await axios.post(
            'https://www.blackbox.ai/api/chat',
            data,
            {
                headers: {
                    Host: 'blackbox.ai',
                    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
                }
            }
        )

        const responseText = response.data.replace(/\$@\$.+?\$@\$/g, '')

        messages.push({
            content: responseText,
            createdAt: new Date().toISOString(),
            id: Math.random().toString(36).substring(2, 10),
            role: 'assistant'
        })

        return {
            response: responseText,
            memories: messages
        }
    } catch (error) {
        console.log(error)
        return {
            error: 'Something went wrong!!'
        }
    }
}

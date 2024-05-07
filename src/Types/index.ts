import Baileys, {
    ParticipantAction,
    GroupMetadata
} from '@whiskeysockets/baileys'

export * from './Config'
export * from './Command'
export * from './Message'
export * from './Pokemon'

export interface IContact {
    jid: string
    username: string
    isMod: boolean
}

export interface ISender extends IContact {
    isAdmin: boolean
}

export interface IGroup extends GroupMetadata {
    admins?: string[]
}

export interface AnimeSearch {
    title: {
        romaji: string
        english?: string
        native: string
    }
    status: string
    format: string
    isAdult: boolean
    duration?: number
    episodes?: number
    genres: string[]
    startDate: string
    endDate: string
    studios: string
    trailer?: {
        id: string
        site: string
        thumbnail: string
    }
    imageUrl: string
    description: string
}

export interface MangaSearch {
    title: {
        romaji: string
        english?: string
        native: string
    }
    status: string
    format: string
    isAdult: boolean
    genres: string[]
    startDate: string
    endDate: string
    volumes?: number
    chapters?: number
    trailer?: {
        id: string
        site: string
        thumbnail: string
    }
    imageUrl: string
    description: string
}

export interface CharacterSearch {
    name: {
        full: string
        native: string
    }
    age?: string
    gender?: string
    bloodType?: any
    image: string
    siteUrl: string
    description: string
}

export interface ICall {
    content: {
        attrs: {
            'call-creator': string
        }
        tag: string
    }[]
}

export interface IEvent {
    jid: string
    participants: string[]
    action: ParticipantAction
}

export interface WaifuResponse {
    name: string
    image_link: string
    id: string
    romaji_name: string
    gender: 'Male' | 'Female'
    original_name: string
    appears_in: string
    place_of_origin: string
    age: string
    date_of_birth: string
    height: string
    weight: string
    blood_type: string
    bust: string
    waist: string
    hip: string
    description: string
}

export type TGroupFeature = 'events' | 'nsfw' | 'mods'

export type client = ReturnType<typeof Baileys>

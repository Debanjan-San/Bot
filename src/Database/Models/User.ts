import {
    prop,
    getModelForClass,
    modelOptions,
    Severity
} from '@typegoose/typegoose'
import { Document } from 'mongoose'
import { WaifuResponse } from '../../Types'

class Afk {
    @prop({ type: Boolean, required: true, default: false })
    public isOffline!: boolean

    @prop({ type: String })
    public reason?: string

    @prop({ type: String })
    public time?: string
}

class Ban {
    @prop({ type: Boolean, required: true, default: false })
    public banned!: boolean

    @prop({ type: String })
    public reason?: string

    @prop({ type: String })
    public bannedBy?: string

    @prop({ type: String })
    public bannedIn?: string

    @prop({ type: String })
    public time?: string
}

class Icon {
    @prop({ type: Boolean, required: true, default: false })
    public custom!: boolean

    @prop({ type: String })
    public hash?: string

    @prop({ type: String })
    public url?: string
}

class About {
    @prop({ type: Boolean, required: true, default: false })
    public custom!: boolean

    @prop({ type: String })
    public bio?: string
}

class Username {
    @prop({ type: Boolean, required: true, default: false })
    public custom!: boolean

    @prop({ type: String })
    public name?: string
}

@modelOptions({
    options: {
        allowMixed: Severity.ALLOW
    }
})
class Haigusha {
    @prop({ type: Boolean, required: true, default: false })
    public married!: boolean

    @prop({ type: Object, required: true, default: () => ({}) })
    public data!: WaifuResponse
}

@modelOptions({
    options: {
        allowMixed: Severity.ALLOW
    }
})
export class User {
    @prop({ type: String, required: true, unique: true })
    public jid!: string

    @prop({ type: Number, required: true, default: 0 })
    public experience!: number

    @prop({ type: Number, required: true, default: 0 })
    public wallet!: number

    @prop({ type: Number, required: true, default: 0 })
    public bank!: number

    @prop({ type: Number, required: true, default: 0 })
    public quizWins!: number

    @prop({ type: Number, required: true, default: 0 })
    public lastDaily!: number

    @prop({ type: Number, required: true, default: 0 })
    public lastRob!: number

    @prop({
        type: () => Ban,
        required: true,
        default: () => ({ banned: false })
    })
    public ban!: Ban

    @prop({
        type: () => Afk,
        required: true,
        default: () => ({ isOffline: false })
    })
    public afk!: Afk

    @prop({ type: Number, required: true, default: 1 })
    public level!: number

    @prop({ type: String, required: true })
    public tag!: string

    @prop({
        type: () => Icon,
        required: true,
        default: () => ({ custom: false })
    })
    public icon!: Icon

    @prop({
        type: () => About,
        required: true,
        default: () => ({ custom: false })
    })
    public about!: About

    @prop({
        type: () => Username,
        required: true,
        default: () => ({ custom: false })
    })
    public username!: Username

    @prop({
        type: () => Haigusha,
        required: true,
        default: () => ({ married: false, data: {} })
    })
    public haigusha!: Haigusha
}

export type TUserModel = User & Document

export const userSchema = getModelForClass(User)

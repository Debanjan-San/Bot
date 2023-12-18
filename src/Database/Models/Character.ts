import { prop, getModelForClass } from '@typegoose/typegoose'
import { WaifuResponse } from '../../Types'
import { Document } from 'mongoose'

export class Character {
    @prop({ type: String, unique: true, required: true })
    public mwl!: string

    @prop({ type: () => [Object], required: true, default: [] })
    public slugs!: WaifuResponse[]
}

export type TCharacterModel = Character & Document

export const characterSchema = getModelForClass(Character)

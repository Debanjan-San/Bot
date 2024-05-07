import { Contact } from '@whiskeysockets/baileys'
import {
    userSchema,
    groupSchema,
    contactSchema,
    sessionSchema,
    disabledCommandsSchema,
    TCommandModel,
    TGroupModel,
    TSessionModel,
    TUserModel,
    User,
    Group,
    characterSchema
} from '../Database'
import moment from 'moment-timezone'
import { Utils } from '../lib'

export class Database {
    public getUser = async (jid: string): Promise<TUserModel> =>
        (await this.user.findOne({ jid })) ||
        (await new this.user({
            jid,
            tag: this.utils.generateRandomUniqueTag()
        }).save())

    public setExp = async (jid: string, experience: number): Promise<void> => {
        experience = experience + Math.floor(Math.random() * 25)
        await this.updateUser(jid, 'experience', 'inc', experience)
    }

    public updateUser = async (
        jid: string,
        field: keyof User,
        method: 'inc' | 'set',
        update: User[typeof field]
    ): Promise<void> => {
        await this.getUser(jid)
        await this.user.updateOne(
            { jid },
            { [`$${method}`]: { [field]: update } }
        )
    }

    public banUser = async (
        jid: string,
        bannedBy: string,
        bannedIn: string,
        reason: string
    ) => {
        await this.getUser(jid)
        const time = moment.tz('Etc/GMT').format('MMM D, YYYY HH:mm:ss')
        await this.user.updateOne(
            { jid },
            {
                $set: {
                    'ban.banned': true,
                    'ban.bannedBy': bannedBy,
                    'ban.bannedIn': bannedIn,
                    'ban.time': time,
                    'ban.reason': reason
                }
            }
        )
    }

    public unbanUser = async (jid: string) => {
        await this.user.updateOne(
            { jid },
            {
                $set: { 'ban.banned': false },
                $unset: {
                    'ban.bannedBy': '',
                    'ban.bannedIn': '',
                    'ban.time': '',
                    'ban.reason': ''
                }
            }
        )
    }

    public removeUser = async (jid: string): Promise<void> => {
        await this.user.deleteOne({ jid })
    }

    public getGroup = async (jid: string): Promise<TGroupModel> =>
        (await this.group.findOne({ jid })) ||
        (await new this.group({ jid }).save())

    public updateGroup = async (
        jid: string,
        field: keyof Group,
        update: boolean | string
    ): Promise<void> => {
        await this.getGroup(jid)
        await this.group.updateOne({ jid }, { $set: { [field]: update } })
    }

    public getMarriedSlugs = async (): Promise<string[]> => {
        const result = (await this.characters.findOne({ mwl: 'married' })) ?? {
            slugs: []
        }
        return result.slugs
    }

    public getSession = async (
        sessionId: string
    ): Promise<TSessionModel | null> =>
        await this.session.findOne({ sessionId })

    public saveNewSession = async (sessionId: string): Promise<void> => {
        await new this.session({ sessionId }).save()
    }

    public updateSession = async (
        sessionId: string,
        session: string
    ): Promise<void> => {
        await this.session.updateOne({ sessionId }, { $set: { session } })
    }

    public removeSession = async (sessionId: string): Promise<void> => {
        await this.session.deleteOne({ sessionId })
    }

    public getContacts = async (): Promise<Contact[]> => {
        const result =
            (await this.contact.findOne({ ID: 'contacts' })) ||
            (await new this.contact({ ID: 'contacts' }))
        return result.data
    }

    public updateOfflineStatus = async (
        jid: string,
        action: boolean,
        reason: string = ''
    ) => {
        const time = action
            ? moment.tz('Etc/GMT').format('MMM D, YYYY HH:mm:ss')
            : ''
        await this.user.updateOne(
            { jid },
            {
                $set: {
                    isOffline: action,
                    time: time,
                    reason: reason
                }
            }
        )
    }

    public denyCommand = async (
        command: string,
        reason: string,
        username: string
    ) => {
        const disabledCommands = await this.getDisabledCommands()
        const time = moment.tz('Etc/GMT').format('MMM D, YYYY HH:mm:ss')
        disabledCommands.push({ command, reason, time, deniedBy: username })
        await this.disabledCommands.updateOne(
            { title: 'commands' },
            { $set: { disabledCommands } }
        )
    }

    public acceptCommand = async (index: number) => {
        const disabledCommands = await this.getDisabledCommands()
        disabledCommands.splice(index, 1)
        await this.disabledCommands.updateOne(
            { title: 'commands' },
            { $set: { disabledCommands } }
        )
    }

    public getDisabledCommands = async (): Promise<
        TCommandModel['disabledCommands']
    > => {
        const result =
            (await this.disabledCommands.findOne({ title: 'commands' })) ||
            (await new this.disabledCommands({ title: 'commands' }).save())
        return result.disabledCommands
    }

    public updateDisabledCommands = async (
        update: TCommandModel['disabledCommands']
    ): Promise<void> => {
        await this.getDisabledCommands()
        await this.disabledCommands.updateOne(
            { title: 'commands' },
            { $set: { disabledCommands: update } }
        )
    }

    private utils = new Utils()

    public user = userSchema

    public group = groupSchema

    public contact = contactSchema

    public session = sessionSchema

    public disabledCommands = disabledCommandsSchema

    public characters = characterSchema
}

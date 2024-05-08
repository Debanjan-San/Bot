import axios from 'axios'
import { tmpdir } from 'os'
import { promisify } from 'util'
import { exec } from 'child_process'
import { readFile, unlink, writeFile } from 'fs-extra'
import puppeteer from 'puppeteer-extra'
import plugin from 'puppeteer-extra-plugin-stealth'
import regex from 'emoji-regex'
import chrome from '@sparticuz/chromium'
import * as linkify from 'linkifyjs'
import { Canvacord } from 'canvacord'
import { MessageHandler } from '../Handlers'
import { Client } from '../Structures'

export class Utils {
    public verifyWin = (
        board: string[],
        player1: string,
        player2: string
    ): string => {
        const winningCombos = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6]
        ]
        const hasWon = (board: string[], symbol: 'X' | 'O') => {
            let winner = false
            winningCombos.map((combo) => {
                if (
                    board[combo[0]] === symbol &&
                    board[combo[1]] === symbol &&
                    board[combo[2]] === symbol
                ) {
                    winner = true
                }
            })
            return winner
        }
        const player1Symbol = 'X'
        const player2Symbol = 'O'
        if (hasWon(board, player1Symbol)) return player1
        if (hasWon(board, player2Symbol)) return player2
        return 'draw'
    }

    public getRandomNumber = (min: number, max: number): number =>
        Math.floor(Math.random() * (max - min + 1)) + min

    public pad = (s: number): string => (s < 10 ? '0' : '') + s

    public formatTime = (seconds: number): string => {
        const hours = Math.floor(seconds / (60 * 60))
        const minutes = Math.floor((seconds % (60 * 60)) / 60)
        const secs = Math.floor(seconds % 60)
        return `*${this.pad(hours)} hour(s), ${this.pad(
            minutes
        )} minute(s), ${this.pad(secs)} second(s)*`
    }

    public displayBoard = async (Board: string[]): Promise<Buffer> => {
        const board = Board as ('X' | 'O')[]
        const data = {
            a1: board[0],
            b1: board[1],
            c1: board[2],
            a2: board[3],
            b2: board[4],
            c2: board[5],
            a3: board[6],
            b3: board[7],
            c3: board[8]
        }
        return Canvacord.tictactoe(data, {
            bg: 'black',
            bar: 'blue',
            x: 'red',
            o: 'white'
        })
    }

    public superFetch = async (url: string): Promise<string> => {
        puppeteer.use(plugin())
        const browser = await puppeteer.launch({
            args: chrome.args,
            defaultViewport: chrome.defaultViewport,
            executablePath: await chrome.executablePath(),
            headless: true,
            ignoreHTTPSErrors: true
        })
        const page = await browser.newPage()
        await page.setExtraHTTPHeaders({
            'Accept-Language': 'en-US,en;q=0.9'
        })
        await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36'
        )
        try {
            await page.goto(url, {
                waitUntil: 'domcontentloaded',
                timeout: 30000
            })
            return await page.evaluate(
                // @ts-ignore: Object is possibly 'null'.
                () => document.querySelector('*').outerHTML
            )
        } catch (err) {
            console.log(err)
            console.error('Website is not loading')
            return ''
        } finally {
            await browser.close()
        }
    }

    public generateRandomHex = (): string =>
        `#${(~~(Math.random() * (1 << 24))).toString(16)}`

    public capitalize = (content: string): string =>
        `${content[0].toUpperCase()}${content.substring(1).toLowerCase()}`

    public generateRandomUniqueTag = (n: number = 4): string => {
        let max = 11
        if (n > max)
            return `${this.generateRandomUniqueTag(
                max
            )}${this.generateRandomUniqueTag(n - max)}`
        max = Math.pow(10, n + 1)
        const min = max / 10
        return (Math.floor(Math.random() * (max - min + 1)) + min)
            .toString()
            .substring(1)
    }

    public extractNumbers = (content: string): number[] => {
        const search = content.match(/(-\d+|\d+)/g)
        if (search !== null) {
            const result = search.map((string) => parseInt(string))
            for (let i = 0; i < result.length; i++) {
                if (result[i] > 0) continue
                result[i] = 0
            }
            return result
        }
        return []
    }

    public shuffleArray = <T>(array: any[]): T => {
        let counter = array.length
        while (counter > 0) {
            const index = Math.floor(Math.random() * counter)
            counter--
            const temp = array[counter]
            array[counter] = array[index]
            array[index] = temp
        }
        return array as unknown as T
    }

    public extractUrls = (content: string): string[] => {
        const urls = linkify.find(content)
        const arr = []
        for (const url of urls) {
            arr.push(url.value)
        }
        return arr
    }

    public extractEmojis = (content: string): string[] =>
        content.match(regex()) || []

    public formatSeconds = (seconds: number): string =>
        new Date(seconds * 1000).toISOString().substr(11, 8)

    public convertMs = (
        ms: number,
        to: 'seconds' | 'minutes' | 'hours' = 'seconds'
    ): number => {
        const seconds = parseInt((ms / 1000).toString().split('.')[0])
        const minutes = parseInt((seconds / 60).toString().split('.')[0])
        const hours = parseInt((minutes / 60).toString().split('.')[0])
        if (to === 'hours') return hours
        if (to === 'minutes') return minutes
        return seconds
    }

    public webpToImage = async (webp: Buffer): Promise<Buffer> => {
        const filename = `${tmpdir()}/${Math.random().toString(36)}`
        await writeFile(`${filename}.webp`, webp)
        await this.exec(`dwebp "${filename}.webp" -o "${filename}.png"`)
        const buffer = await readFile(`${filename}.png`)
        Promise.all([unlink(`${filename}.png`), unlink(`${filename}.webp`)])
        return buffer
    }

    public mp3ToOpus = async (mp3: Buffer): Promise<Buffer> => {
        const filename = `${tmpdir()}/${Math.random().toString(36)}`
        await writeFile(`${filename}.mp3`, mp3)
        await this.exec(
            `ffmpeg -i ${filename}.mp3 -c:a libopus ${filename}.opus`
        )
        const buffer = await readFile(`${filename}.opus`)
        Promise.all([unlink(`${filename}.mp3`), unlink(`${filename}.opus`)])
        return buffer
    }

    public gifToMp4 = async (gif: Buffer): Promise<Buffer> => {
        const filename = `${tmpdir()}/${Math.random().toString(36)}`
        await writeFile(`${filename}.gif`, gif)
        await this.exec(
            `ffmpeg -f gif -i ${filename}.gif -movflags faststart -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" ${filename}.mp4`
        )
        const buffer = await readFile(`${filename}.mp4`)
        Promise.all([unlink(`${filename}.gif`), unlink(`${filename}.mp4`)])
        return buffer
    }

    public fetch = async <T>(url: string): Promise<T> =>
        (await axios.get(url)).data

    public getBuffer = async (url: string): Promise<Buffer> =>
        (
            await axios.get<Buffer>(url, {
                responseType: 'arraybuffer'
            })
        ).data

    public exec = promisify(exec)

    public chunk = <T>(arr: T[], length: number): T[][] => {
        const result = []
        for (let i = 0; i < arr.length / length; i++)
            result.push(arr.slice(i * length, i * length + length))
        return result
    }

    public parseChessBoard = (board: string[]): string[][] =>
        this.chunk(
            board.map((tile) => {
                if (tile === 'bK') return 'k'
                if (tile === 'wK') return 'K'
                if (tile === 'wk') return 'N'
                if (tile === 'bk') return 'n'
                if (tile[0] === 'w') return tile[1].toUpperCase()
                return tile[1].toLowerCase()
            }),
            8
        ).reverse()

    public endChess = async (
        handler: MessageHandler,
        client: Client,
        jid: string,
        winner?: 'Black' | 'White' | string
    ): Promise<void> => {
        const game = handler.chess.games.get(jid)
        const challenge = handler.chess.challenges.get(jid)
        if (!game || !challenge) return void null
        const w = winner?.endsWith('.net')
            ? winner
            : winner === 'White'
            ? challenge.challenger
            : winner === 'Black'
            ? challenge.challengee
            : null
        handler.chess.challenges.set(jid, undefined)
        handler.chess.games.set(jid, undefined)
        handler.chess.ongoing.delete(jid)
        if (!w)
            return void (await client.sendMessage(jid, {
                text: 'Match ended in a Draw!'
            }))
        await client.DB.setExp(w, 1500)
        if (w)
            return void (await client.sendMessage(jid, {
                text: `@${w.split('@')[0]} Won`,
                mentions: [w]
            }))
    }
}

import { Message } from "discord.js";
import { db } from "../models";
import { Collections } from "../models/enum/collections";
import { QuerySnapshot, DocumentSnapshot, CollectionReference } from "@google-cloud/firestore";
import { NovelArgs } from "../models/novel.model";
import { RichEmbed } from "discord.js";
import { User } from "discord.js";


export async function findNovel(message: Message, args: string[]): Promise<NovelArgs> {
    let novelString = args.join(" ").trim().toLowerCase()
    const match = novelString.match(/babelnovel.com\/books\/(?<canonical>[\w-]{1,})/i)
    if (match) novelString = match.groups.canonical

    let returnNovel;
    let queries = novelString.includes("-") ? ['name.canonical', 'babelId', 'name.search'] : ['name.abbr', 'name.search']
    let query: CollectionReference;
    let results: QuerySnapshot;
    const collection = db.collection(Collections.novels)

    for (let i in queries) {
        query = collection.where(queries[i], '==', novelString).limit(1)
        results = await query.get()
        if (results.empty) continue
        results.forEach((result: DocumentSnapshot) => returnNovel = result.data());
        if (returnNovel) return returnNovel
    }
    if (novelString.length > 2) {
        query = collection.where('name.search', '>=', novelString).orderBy('name.search').limit(5)
        results = await query.get()
        if (!results.empty) {
            const alternatives = []
            results.forEach(r => alternatives.push(r.data()))
            returnNovel = await MessageTemplate(message, alternatives, novelString)
        }
    }


    if (!returnNovel) {
        const notFound = `Novel '${novelString}' not found`
        await message.channel.send(notFound, { code: true }).then((msg: Message) => msg.expire(message, false))
    }
    return returnNovel
}



function MessageTemplate(message: Message, alternatives: NovelArgs[], novelString: string): Promise<NovelArgs> {
    const emoji = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '⛔']
    let description = alternatives.map((alt, index) => `${emoji[index]} - ${alt.name.en}`)

    const emb = new RichEmbed()
        .setColor('#0099ff')
        .setTitle('Which novel did you mean?')
        .setAuthor(`Couldnt find ${novelString}`, null, null)
        .setDescription(description)

    const filter = (reaction: any, user: User) => {
        return emoji.includes(reaction.emoji.name) && user.id === message.member.id
    }

    return new Promise((resolve) => {
        message.channel.send(emb).then(async (msg: Message) => {
            try {
                for (var i = 0; i < alternatives.length; ++i) await msg.react(emoji[i])
                await msg.react(emoji[5])
            } catch (error) { }

            msg.awaitReactions(filter, { max: 1, time: 20000, errors: ['time'] })
                .then((collected) => {
                    const reaction = collected.first()
                    if (reaction.emoji.name === emoji[5]) {
                        msg.expire(message, false, 1)
                    } else {
                        msg.expire(null, false, 1)
                        return resolve(alternatives[emoji.indexOf(reaction.emoji.name)])
                    }
                }).catch(collected => {
                    msg.expire(message, false, 1)
                    resolve(null)
                });
        })
    })
}
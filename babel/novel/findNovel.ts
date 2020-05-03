import { Message } from "discord.js";
import { MessageEmbed } from "discord.js";
import { User } from "discord.js";
import { Novel } from "../../models";
import { Novels } from "../../models/novel.model";

const minimumQuery = 3;

export async function findNovel(message: Message, args: string[]): Promise<Novels> {
    let novelString = args.join(" ").trim().toLowerCase()
    if (novelString.length < minimumQuery) {
        message.channel.send(`Query needs to have atleast ${minimumQuery} characters`, { code: true }).then(msg => msg.expire(message))
        return null;
    }
    const match = novelString.match(/babelnovel.com\/books\/(?<canonical>[\w-]{1,})/i)
    if (match) novelString = match.groups.canonical
    let returnNovel;


    const novels = await Novel.find({
        $or: [
            { "name.canonical": novelString },
            { "babelId": novelString },
            { "name.abbr": novelString },
            { "name.en": { "$regex": novelString, "$options": "i" } },
        ]
    });

    if(novels.length === 1)
        return novels.pop();
    
    novels.sort((a, b) => a.name.en.length - b.name.en.length).splice(5, novels.length);

    returnNovel = await MessageTemplate(message, novels, novelString)

    if (!returnNovel) {
        const notFound = `Novel '${novelString}' not found`
        await message.channel.send(notFound, { code: true }).then((msg: Message) => msg.expire(message, false))
    }
    return returnNovel
}



function MessageTemplate(message: Message, alternatives: Novels[], novelString: string): Promise<Novels> {
    const emoji = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '⛔']
    let description = alternatives.map((alt, index) => `${emoji[index]} - ${alt.name.en}`)

    const emb = new MessageEmbed()
        .setColor('#0099ff')
        .setTitle('Which novel did you mean?')
        .setAuthor(`Couldnt find '${novelString}'`, null, null)
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
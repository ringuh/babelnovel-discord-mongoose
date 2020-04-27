import { Guild } from "discord.js";
import { Role } from "discord.js";
import { GuildMember } from "discord.js";
import { GuildChannel } from "discord.js";

const IsUser = (mention: string, guild: Guild): GuildMember => {
    if (!mention) return;

    if (mention.startsWith('<@') && mention.endsWith('>')) {
        mention = mention.slice(2, -1);

        if (mention.startsWith('!')) {
            mention = mention.slice(1);
        }
        return guild.members.resolve(mention)
    }

    return guild.members.resolve(mention)
};


const IsChannel = (mention: string, guild: Guild): GuildChannel => {
    if (!mention) return;

    if (mention.startsWith('<#') && mention.endsWith('>')) {
        mention = mention.slice(2, -1);

        if (mention.startsWith('!')) {
            mention = mention.slice(1);
        }

        return guild.channels.resolve(mention)
    }

    return guild.channels.resolve(mention)
};

const IsRole = (mention: string, guild: Guild): Role => {
    if (!mention) return;

    if (mention.startsWith('@')) {
        let roleFound = guild.roles.cache.find(role => role.name.toLowerCase() === mention.replace(/^@/, "").toLowerCase())
        if (roleFound) return roleFound
    }
    if (mention.startsWith('<@&') && mention.endsWith('>')) {
        mention = mention.slice(3, -1);
        return guild.roles.resolve(mention);
    };
}

const IsMention = (mention: string, guild: Guild): string | GuildChannel | GuildMember | Role => {
    const role = IsRole(mention, guild);
    if(role) return role;

    const user = IsUser(mention, guild);
    if(user) return user;

    const channel = IsChannel(mention, guild);
    if(channel) return channel;

    return mention;
};

const StripMentions = (args: string[], guild: Guild): [string, GuildMember[], GuildChannel[], Role[]] => {
    let users: GuildMember[] = []
    let channels: GuildChannel[] = []
    let roles: Role[] = []
    let stripped: string[] = []


    args.map(word => {
        const role = IsRole(word, guild);
        if(role) return roles.push(role);

        const user = IsUser(word, guild);
        if(user) return users.push(user);

        const channel = IsChannel(word, guild);
        if(channel) return channels.push(channel);

        stripped.push(word);
    });

    return [stripped.join(" "), users, channels, roles]
};

export { IsUser, IsChannel, IsRole, IsMention, StripMentions }
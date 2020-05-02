import { Message } from "discord.js";
import { usageMessage } from "../../funcs/commandTools";
import { findNovel } from "../../babel/novel/findNovel";

export default {
    name: ['script'],
    description: 'Prints the script to add the novel to babel library',
    args: "<novel>",
    async execute(message: Message, args: string[], params: string[]) {
        if (args.length < 1) return usageMessage(message, this)
        const novel = await findNovel(message, args);
        if (!novel) return false

        const codeStr = `!((id) => { \/\/ ${novel.name.canonical}\n` +
            `const cookie = document.cookie.split(";").map(c => c.trim())\n` +
            `const token = cookie.find(c => c.startsWith("_bc_novel_token=")).slice(16, 99)\n` +
            `const xhttp = new XMLHttpRequest();\n` +
            `xhttp.open("POST", "/api/user/libraries", true);\n` +
            `xhttp.setRequestHeader("Content-type", "application/json");\n` +
            `xhttp.setRequestHeader("token", token);\n` +
            `xhttp.send(JSON.stringify({ bookId: id }));\n` +
            `})('${novel.babelId}');\n`;

        await message.channel.send(codeStr, { code: "js" }).then(
            (msg: Message) => msg.bin(message)
        );
    }
};
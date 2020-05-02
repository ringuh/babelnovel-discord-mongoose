
const sharp = require('sharp');
import axios from 'axios';
import { Novel, Novels } from '../../models/novel.model';

const { yellow, red } = require('chalk').bold

async function downloadCover(novel: Novels): Promise<string> {
    if (!novel.cover?.startsWith("http")) return novel.cover
    
    return new Promise(async (resolve, reject) => {
        const url = encodeURI(novel.cover)
        const defaultCover = `static/cover/default_cover.png`
        const path = `static/cover/${novel.name.canonical}.png`

        console.log(yellow(novel.cover), '\n', yellow(url))

        const response = await axios.request({
            url,
            method: 'GET',
            responseType: 'arraybuffer' // stream
        }).then(async response => {
            const buffer = Buffer.from(response.data, 'binary')
            await sharp(buffer).resize(200).png({ lossless: false }).toFile(path)
                .then(f => resolve(path))
                .catch(err => {
                    console.log(red(`Fetching cover failed: ${err.message}`))
                    reject(defaultCover)
                });
        }).catch(err => {
            console.log(red(`Fetching cover failed: ${err.message}`))
            reject(defaultCover)
        });
    });
};

export { downloadCover }
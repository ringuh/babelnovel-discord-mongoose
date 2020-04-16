import { config } from "../models";
const { gray } = require('chalk').bold;

export async function waitFor(ms: number = config.numerics.retry_seconds) {
    console.log(gray(`Waiting for ${ms}`))
    await new Promise(resolve => setTimeout(() => resolve(), ms))
    console.log("return")
    return true
}
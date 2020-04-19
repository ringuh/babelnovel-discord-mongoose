import { config } from "../models";
const { gray } = require('chalk').bold;

export function waitFor(ms: number = config.numerics.retry_after): Promise<boolean> {
    console.log(gray(`Waiting for ${ms}`))
    return new Promise(resolve => setTimeout(() => resolve(true), ms))
}
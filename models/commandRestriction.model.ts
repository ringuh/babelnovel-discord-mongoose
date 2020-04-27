import { getModelForClass, prop } from '@typegoose/typegoose';
import { CommandRestrictionType } from './enums/restriction.enum';

class CommandRestrictionClass {
    @prop() server: string;
    @prop() channel: string;
    @prop() type: CommandRestrictionType
    @prop() command: string;
}

const CommandRestriction = getModelForClass(CommandRestrictionClass);

export { CommandRestriction }
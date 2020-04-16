import { getModelForClass, prop } from '@typegoose/typegoose';
enum SETTING_TYPES {
    channel = 'discord_channel',
    user = 'discord_user',
    guild = 'discord_guild',
    role = 'discord_role'
}


class SettingClass {
    @prop() server: string;
    @prop() key: string;
    @prop() value: string | number | boolean;
    @prop() type?: SETTING_TYPES;
}

const Setting = getModelForClass(SettingClass);


export { Setting }
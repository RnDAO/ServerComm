import fetch from 'node-fetch';
import { Snowflake } from 'discord.js';
import config from '../config';
import { IDiscordUser, IUser, User } from '@togethercrew.dev/db';
import { ApiError } from '../utils';
import httpStatus = require('http-status');
import parentLogger from '../config/logger';
import { IUserUpdateBody } from '@togethercrew.dev/db';
import { ITwitterUser } from 'src/interfaces/twitter.interface';

const logger = parentLogger.child({ module: 'UserService' });

/**
 * Create user base on discord profile
 * @param {IDiscordUser} data
 * @returns {Promise<IUser>}
 */
async function createUser(data: IDiscordUser): Promise<IUser> {
    return User.create({
        discordId: data.id,
        ...data
    });
}

/**
 * get user data from discord api by access token
 * @param {String} accessToken
 * @returns {Promise<IDiscordUser>}
 */
async function getUserFromDiscordAPI(accessToken: string): Promise<IDiscordUser> {
    try {
        const response = await fetch('https://discord.com/api/users/@me', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        if (response.ok) {
            return await response.json();
        }
        else {
            throw new Error();
        }
    } catch (error) {
        logger.error({ accessToken, error }, 'Failed to get user from Discord API');
        throw new ApiError(590, 'Can not fetch from discord API');
    }
}

/**
 * get user data from discord api by access token
 * @param {String} accessToken
 * @returns {Promise<IDiscordUser>}
 */
async function getBotFromDiscordAPI(): Promise<IDiscordUser> {
    try {
        const response = await fetch('https://discord.com/api/users/@me', {
            method: 'GET',
            headers: { 'Authorization': `Bot ${config.discord.botToken}` }
        });
        if (response.ok) {
            return await response.json();
        }
        else {
            throw new Error();
        }
    } catch (error) {
        logger.error({ bot_token: config.discord.botToken, error }, 'Failed to get bot from Discord API');
        throw new ApiError(590, 'Can not fetch from discord API');
    }
}

/**
 * Get user by discordId
 * @param {Snowflake} discordId
 * @returns {Promise<IUser | null>}
 */
async function getUserByDiscordId(discordId: Snowflake): Promise<IUser | null> {
    const user = await User.findOne({ discordId });
    return user;
}

/**
 * Get user guilds
 * @param {String} accessToken
 * @returns {Promise<Array<IDiscordGuild>>}
 */
async function getCurrentUserGuilds(accessToken: string) {
    try {
        const response = await fetch('https://discord.com/api/users/@me/guilds', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        if (response.ok) {
            return await response.json();
        }
        else {
            throw new Error();
        }
    } catch (error) {
        logger.error({ bot_token: config.discord.botToken, error }, 'Failed to get user\'s guilds from disocrd API');
        throw new ApiError(590, 'Can not fetch from discord API');
    }
}


/**
 * update user by discordId
 * @param {Snowflake} discordId
 * @param {IGuildUpdateBody} updateBody
 * @returns {Promise<IGuild>}
 */
async function updateUserByDiscordId(discordId: Snowflake, updateBody: IUserUpdateBody) {
    const user = await User.findOne({ discordId });
    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
    if (updateBody.email && (await User.findOne({ email: updateBody.email, discordId: { $ne: discordId } }))) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
    }
    Object.assign(user, updateBody);
    await user.save();
    return user;
}

/**
 * get user data from twitter api by access token
 * @param {String} accessToken
 * @returns {Promise<ITwitterUser>}
 */
async function getUserFromTwitterAPI(accessToken: string): Promise<ITwitterUser> {
    try {
        const response = await fetch('https://api.twitter.com/2/users/me?user.fields=profile_image_url,name,id', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        if (response.ok) {
            return (await response.json()).data;
        }
        else {
            throw new Error();
        }
    } catch (error) {
        logger.error({ accessToken, error }, 'Failed to get user from twitter API');
        throw new ApiError(590, 'Can not fetch from twitter API');
    }
}

export default {
    createUser,
    getUserFromDiscordAPI,
    getBotFromDiscordAPI,
    getUserByDiscordId,
    getCurrentUserGuilds,
    updateUserByDiscordId,
    getUserFromTwitterAPI
}
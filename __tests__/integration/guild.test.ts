import request from 'supertest';
import httpStatus from 'http-status';
import moment from 'moment';
import app from '../../src/app';
import setupTestDB from '../utils/setupTestDB';
import { userOne, insertUsers } from '../fixtures/user.fixture';
import { userOneAccessToken } from '../fixtures/token.fixture';
import { discordResponseGuildOne, guildOne, guildTwo, guildThree, guildFour, insertGuilds } from '../fixtures/guilds.fixture';
import { discordResponseChannelOne, discordResponseChannelTwo, discordResponseChannelThree, discordResponseChannelFour } from '../fixtures/channels.fixture';
import { IGuildUpdateBody } from '../../src/interfaces/guild.interface';
import { guildService } from '../../src/services';
import { Guild } from 'tc-dbcomm';
setupTestDB();

describe('Guild routes', () => {


    describe('GET /api/v1/guilds/:guildId/channels', () => {
        beforeEach(() => {
            guildService.getGuildChannels = jest.fn().mockReturnValue([discordResponseChannelOne, discordResponseChannelTwo, discordResponseChannelThree, discordResponseChannelFour]);
            guildService.isBotAddedToGuild = jest.fn().mockReturnValue(true);
        });

        test('should return 200 and array of channels of guild', async () => {
            await insertUsers([userOne]);
            const res = await request(app)
                .get(`/api/v1/guilds/${discordResponseGuildOne.id}/channels`)
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .send()
                .expect(httpStatus.OK);

            expect(res.body).toHaveLength(2);
            expect(res.body[0]).toEqual({
                id: discordResponseChannelTwo.id,
                title: discordResponseChannelTwo.name,
                subChannels: [discordResponseChannelFour]
            });

            expect(res.body[1]).toEqual({
                id: discordResponseChannelThree.id,
                title: discordResponseChannelThree.name,
                subChannels: [discordResponseChannelOne]
            });


        })
        test('should return 400 if bot is not added to guild', async () => {
            guildService.isBotAddedToGuild = jest.fn().mockReturnValue(false);
            await insertUsers([userOne]);
            await request(app)
                .get(`/api/v1/guilds/${discordResponseGuildOne.id}/channels`)
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .send()
                .expect(httpStatus.BAD_REQUEST);
        })
        test('should return 401 if access token is missing', async () => {
            await insertUsers([userOne]);
            await request(app)
                .get(`/api/v1/guilds/${discordResponseGuildOne.id}/channels`)
                .send()
                .expect(httpStatus.UNAUTHORIZED);
        })
        test('should return 400 if can not fetch guild channels', async () => {
            guildService.isBotAddedToGuild = jest.fn().mockReturnValue(false);
            await insertUsers([userOne]);
            await request(app)
                .get(`/api/v1/guilds/${discordResponseGuildOne.id}/channels`)
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .send()
                .expect(httpStatus.BAD_REQUEST);

        })
    })

    describe('GET /api/v1/guilds/:guildId', () => {
        test('should return 200 and the guild object if data is ok', async () => {
            await insertUsers([userOne]);
            await insertGuilds([guildOne]);

            const res = await request(app)
                .get(`/api/v1/guilds/${guildOne.guildId}`)
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .expect(httpStatus.OK);

            expect(res.body).toEqual({
                id: guildOne._id.toHexString(),
                guildId: guildOne.guildId,
                user: userOne.discordId,
                name: guildOne.name,
                selectedChannels: [],
                isInProgress: guildOne.isInProgress,
                isDisconnected: guildOne.isDisconnected,
                connectedAt: expect.anything()
            });
        })

        test('should return 401 if access token is missing', async () => {
            await insertUsers([userOne]);
            await insertGuilds([guildOne]);

            await request(app)
                .get(`/api/v1/guilds/${guildOne.guildId}`)
                .expect(httpStatus.UNAUTHORIZED);
        })

        test('should return 404 if guild not found', async () => {
            await insertUsers([userOne]);

            await request(app)
                .get(`/api/v1/guilds/${guildOne.guildId}`)
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .expect(httpStatus.NOT_FOUND);
        })
    })

    describe('PATCH /api/v1/guilds/:guildId', () => {
        let updateBody: IGuildUpdateBody;

        beforeEach(() => {
            updateBody = {
                period: moment("2022-02-01 08:30:26.127Z").toDate(),
                selectedChannels: [
                    {
                        channelId: discordResponseChannelOne.id,
                        channelName: discordResponseChannelOne.name
                    }
                ],
                isDisconnected: false
            };
        });
        test('should return 200 and successfully update guild if data is ok', async () => {
            await insertUsers([userOne]);
            await insertGuilds([guildOne]);

            const res = await request(app)
                .patch(`/api/v1/guilds/${guildOne.guildId}`)
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .send(updateBody)
                .expect(httpStatus.OK);

            expect(res.body).toMatchObject({
                id: guildOne._id.toHexString(),
                guildId: guildOne.guildId,
                user: userOne.discordId,
                name: guildOne.name,
                selectedChannels: updateBody.selectedChannels
            });

            const dbGuild = await Guild.findById(guildOne._id);
            expect(dbGuild).toBeDefined();
            expect(dbGuild).toMatchObject({ period: updateBody.period, selectedChannels: updateBody.selectedChannels });
        })

        test('should return 401 if access token is missing', async () => {
            await insertUsers([userOne]);
            await insertGuilds([guildOne]);

            await request(app)
                .patch(`/api/v1/guilds/${guildOne.guildId}`)
                .send(updateBody)
                .expect(httpStatus.UNAUTHORIZED);
        })

        test('should return 404 if guild not found', async () => {
            await insertUsers([userOne]);

            await request(app)
                .patch(`/api/v1/guilds/${guildOne.guildId}`)
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .send(updateBody)
                .expect(httpStatus.NOT_FOUND);
        })


        test('should return 400 if selectedChannels is invalid', async () => {
            await insertUsers([userOne]);
            const updateBody = { selectedChannels: ':(' };

            await request(app)
                .patch(`/api/v1/guilds/${guildOne.guildId}`)
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .send(updateBody)
                .expect(httpStatus.BAD_REQUEST);
        });

        test('should return 400 if isDisconneted is invalid', async () => {
            await insertUsers([userOne]);
            const updateBody = { isDisconneted: ':(' };

            await request(app)
                .patch(`/api/v1/guilds/${guildOne.guildId}`)
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .send(updateBody)
                .expect(httpStatus.BAD_REQUEST);
        });
    })

    describe('GET /api/v1/guilds/discord-api/:guildId', () => {
        beforeEach(() => {
            guildService.getGuildFromDiscordAPI = jest.fn().mockReturnValue(discordResponseGuildOne);
            guildService.isBotAddedToGuild = jest.fn().mockReturnValue(true);
        });

        test('should return 200 and the guild object (from Discord API) if data is ok', async () => {
            await insertUsers([userOne]);
            await insertGuilds([guildOne]);

            const res = await request(app)
                .get(`/api/v1/guilds/discord-api/${guildOne.guildId}`)
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .expect(httpStatus.OK);

            expect(res.body).toEqual(discordResponseGuildOne);
        })

        test('should return 401 if access token is missing', async () => {
            await insertUsers([userOne]);
            await insertGuilds([guildOne]);

            await request(app)
                .get(`/api/v1/guilds/discord-api/${guildOne.guildId}`)
                .expect(httpStatus.UNAUTHORIZED);
        })

        test('should return 400 if can not fetch guild channels', async () => {
            guildService.isBotAddedToGuild = jest.fn().mockReturnValue(false);
            await insertUsers([userOne]);
            await request(app)
                .get(`/api/v1/guilds/discord-api/${guildOne.guildId}`)
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .send()
                .expect(httpStatus.BAD_REQUEST);

        })
    })

    describe('GET /api/v1/guilds', () => {
        test('should return 200 and apply the default query options', async () => {
            await insertUsers([userOne]);
            await insertGuilds([guildOne, guildTwo, guildThree, guildFour]);
            const res = await request(app)
                .get('/api/v1/guilds')
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .send()
                .expect(httpStatus.OK);

            expect(res.body).toEqual({
                results: expect.any(Array),
                page: 1,
                limit: 10,
                totalPages: 1,
                totalResults: 2,
            });
            expect(res.body.results).toHaveLength(2);
            expect(res.body.results[0]).toEqual({
                id: guildOne._id.toHexString(),
                guildId: guildOne.guildId,
                user: userOne.discordId,
                name: guildOne.name,
                selectedChannels: [],
                isInProgress: guildOne.isInProgress,
                isDisconnected: guildOne.isDisconnected,
                connectedAt: expect.anything()
            });
        });

        test('should return 401 if access token is missing', async () => {
            await insertUsers([userOne]);

            await request(app)
                .get('/api/v1/guilds')
                .send()
                .expect(httpStatus.UNAUTHORIZED);
        });

        test('should correctly apply filter on isInProgress field', async () => {
            await insertUsers([userOne]);
            await insertGuilds([guildOne, guildTwo, guildThree, guildFour]);

            const res = await request(app)
                .get('/api/v1/guilds')
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .query({ isInProgress: guildOne.isInProgress })
                .send()
                .expect(httpStatus.OK);

            expect(res.body).toEqual({
                results: expect.any(Array),
                page: 1,
                limit: 10,
                totalPages: 1,
                totalResults: 1,
            });
            expect(res.body.results).toHaveLength(1);
            expect(res.body.results[0].id).toBe(guildOne._id.toHexString());
        });

        test('should correctly apply filter on isDisconnected field', async () => {
            await insertUsers([userOne]);
            await insertGuilds([guildOne, guildTwo, guildThree, guildFour]);

            const res = await request(app)
                .get('/api/v1/guilds')
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .query({ isDisconnected: guildTwo.isDisconnected })
                .send()
                .expect(httpStatus.OK);

            expect(res.body).toEqual({
                results: expect.any(Array),
                page: 1,
                limit: 10,
                totalPages: 1,
                totalResults: 1,
            });
            expect(res.body.results).toHaveLength(1);
            expect(res.body.results[0].id).toBe(guildTwo._id.toHexString());
        });

        test('should correctly sort the returned array if descending sort param is specified', async () => {
            await insertUsers([userOne]);
            await insertGuilds([guildOne, guildTwo, guildThree, guildFour]);

            const res = await request(app)
                .get('/api/v1/guilds')
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .query({ sortBy: 'name:desc' })
                .send()
                .expect(httpStatus.OK);

            expect(res.body).toEqual({
                results: expect.any(Array),
                page: 1,
                limit: 10,
                totalPages: 1,
                totalResults: 2,
            });
            expect(res.body.results).toHaveLength(2);
            expect(res.body.results[0].id).toBe(guildTwo._id.toHexString());
            expect(res.body.results[1].id).toBe(guildOne._id.toHexString());
        });

        test('should correctly sort the returned array if ascending sort param is specified', async () => {
            await insertUsers([userOne]);
            await insertGuilds([guildOne, guildTwo, guildThree, guildFour]);

            const res = await request(app)
                .get('/api/v1/guilds')
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .query({ sortBy: 'name:asc' })
                .send()
                .expect(httpStatus.OK);

            expect(res.body).toEqual({
                results: expect.any(Array),
                page: 1,
                limit: 10,
                totalPages: 1,
                totalResults: 2,
            });
            expect(res.body.results).toHaveLength(2);
            expect(res.body.results[0].id).toBe(guildOne._id.toHexString());
            expect(res.body.results[1].id).toBe(guildTwo._id.toHexString());
        });

        test('should correctly sort the returned array if multiple sorting criteria are specified', async () => {
            await insertUsers([userOne]);
            await insertGuilds([guildOne, guildTwo, guildThree, guildFour]);

            const res = await request(app)
                .get('/api/v1/guilds')
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .query({ sortBy: 'isInProgress:desc,name:asc' })
                .send()
                .expect(httpStatus.OK);

            expect(res.body).toEqual({
                results: expect.any(Array),
                page: 1,
                limit: 10,
                totalPages: 1,
                totalResults: 2,
            });
            expect(res.body.results).toHaveLength(2);

            expect(res.body.results[0].id).toBe(guildOne._id.toHexString());
            expect(res.body.results[1].id).toBe(guildTwo._id.toHexString());
        });

        test('should limit returned array if limit param is specified', async () => {
            await insertUsers([userOne]);
            await insertGuilds([guildOne, guildTwo, guildThree, guildFour]);

            const res = await request(app)
                .get('/api/v1/guilds')
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .query({ limit: 1 })
                .send()
                .expect(httpStatus.OK);

            expect(res.body).toEqual({
                results: expect.any(Array),
                page: 1,
                limit: 1,
                totalPages: 2,
                totalResults: 2,
            });
            expect(res.body.results).toHaveLength(1);
            expect(res.body.results[0].id).toBe(guildOne._id.toHexString());
        });

        test('should return the correct page if page and limit params are specified', async () => {
            await insertUsers([userOne]);
            await insertGuilds([guildOne, guildTwo, guildThree, guildFour]);

            const res = await request(app)
                .get('/api/v1/guilds')
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .query({ page: 2, limit: 1 })
                .send()
                .expect(httpStatus.OK);

            expect(res.body).toEqual({
                results: expect.any(Array),
                page: 2,
                limit: 1,
                totalPages: 2,
                totalResults: 2,
            });
            expect(res.body.results).toHaveLength(1);
            expect(res.body.results[0].id).toBe(guildTwo._id.toHexString());
        });
    });

});
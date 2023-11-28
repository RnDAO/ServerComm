import request from 'supertest';
import httpStatus from 'http-status';
import app from '../../src/app';
import setupTestDB from '../utils/setupTestDB';
import { userOne, insertUsers, userTwo } from '../fixtures/user.fixture';
import { userOneAccessToken } from '../fixtures/token.fixture';
import { Platform, Community, IPlatformUpdateBody, DatabaseManager } from '@togethercrew.dev/db';
import { communityOne, communityTwo, communityThree, insertCommunities } from '../fixtures/community.fixture';
import { platformOne, platformTwo, platformThree, platformFour, platformFive, insertPlatforms, } from '../fixtures/platform.fixture';
import { discordRole1, discordRole2, discordRole3, discordRole4, insertRoles } from '../fixtures/discord/roles.fixture';
import { discordChannel1, discordChannel2, discordChannel3, discordChannel4, discordChannel5, insertChannels } from '../fixtures/discord/channels.fixture';

setupTestDB();

describe('Platform routes', () => {
    beforeEach(() => {
        userOne.communities = [communityOne._id, communityTwo._id];
        userTwo.communities = [communityThree._id];

        communityOne.users = [userOne._id];
        communityTwo.users = [userOne._id];
        communityThree.users = [userTwo._id];

        communityOne.platforms = [platformOne._id, platformTwo._id, platformFive._id]
        communityTwo.platforms = [platformThree._id];
        communityThree.platforms = [platformFour._id];

        platformOne.community = communityOne._id
        platformTwo.community = communityOne._id
        platformThree.community = communityTwo._id
        platformFour.community = communityThree._id
        platformFive.community = communityOne._id

    });

    describe('POST api/v1/platforms', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let newPlatform: any;

        beforeEach(() => {
            newPlatform = {
                name: 'discord',
                community: communityOne._id,
                metadata: {
                    id: "1234",
                    name: 'guild',
                    icon: 'path'
                }
            };
        });

        test('should return 201 and successfully create new platform if data is ok', async () => {
            userOne.communities = [communityOne._id];
            communityOne.users = [userOne._id]
            await insertCommunities([communityOne]);
            await insertUsers([userOne]);

            const res = await request(app)
                .post(`/api/v1/platforms`)
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .send(newPlatform)
                .expect(httpStatus.CREATED);

            expect(res.body).toEqual({
                id: expect.anything(),
                name: newPlatform.name,
                metadata: newPlatform.metadata,
                community: communityOne._id.toHexString(),
                disconnectedAt: null,
                isInProgress: true,
                connectedAt: expect.anything()
            });


            const dbPlatform = await Platform.findById(res.body.id);
            expect(dbPlatform).toBeDefined();
            expect(dbPlatform).toMatchObject({
                name: newPlatform.name, metadata: newPlatform.metadata, isInProgress: true

            });

            const dbCommunity = await Community.findById(res.body.community);
            expect(dbCommunity).toMatchObject({ id: communityOne._id.toHexString(), name: communityOne.name, avatarURL: communityOne.avatarURL, users: [userOne._id], });

        });

        test('should return 201 and successfully connect a disconneced platform if data is ok', async () => {
            userOne.communities = [communityOne._id];
            communityOne.users = [userOne._id]
            await insertCommunities([communityOne]);
            await insertUsers([userOne]);
            platformOne.disconnectedAt = new Date();
            await insertPlatforms([platformOne]);
            platformOne.disconnectedAt = null;
            newPlatform.metadata.id = platformOne.metadata?.id;

            const res = await request(app)
                .post(`/api/v1/platforms`)
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .send(newPlatform)
                .expect(httpStatus.CREATED);

            expect(res.body).toEqual({
                id: expect.anything(),
                name: platformOne.name,
                metadata: platformOne.metadata,
                community: communityOne._id.toHexString(),
                disconnectedAt: null,
                isInProgress: true,
                connectedAt: expect.anything()
            });


            const dbPlatform = await Platform.findById(res.body.id);
            expect(dbPlatform).toBeDefined();
            expect(dbPlatform).toMatchObject({
                name: platformOne.name, metadata: platformOne.metadata, disconnectedAt: null

            });

        });


        test('should return 401 error if access token is missing', async () => {
            await request(app)
                .post(`/api/v1/platforms`)
                .send(newPlatform)
                .expect(httpStatus.UNAUTHORIZED);
        });


        test('should return 400 error if community has same connected platform already', async () => {
            await insertCommunities([communityOne]);
            await insertUsers([userOne]);
            await insertPlatforms([platformOne]);
            await request(app)
                .post(`/api/v1/platforms`)
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .send(newPlatform)
                .expect(httpStatus.BAD_REQUEST);
        });

        test('should return 400 error if platform is already connected to another community', async () => {
            await insertCommunities([communityOne, communityTwo]);
            await insertUsers([userOne, userTwo]);
            if (platformFour.metadata) {
                platformFour.metadata.id = platformOne.metadata?.id;
                newPlatform.metadata.id = platformOne.metadata?.id;
                await insertPlatforms([platformFour]);
                platformFour.metadata.id = '681946187490000802';
            }
            await request(app)
                .post(`/api/v1/platforms`)
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .send(newPlatform)
                .expect(httpStatus.BAD_REQUEST);

        });

        test('should return 400 error if name is invalid', async () => {
            await insertUsers([userOne]);
            newPlatform.name = 'invalid'
            await request(app)
                .post(`/api/v1/platforms`)
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .send(newPlatform)
                .expect(httpStatus.BAD_REQUEST);
        });

        test('should return 400 error if community is invalid', async () => {
            await insertUsers([userOne]);
            newPlatform.community = 'invalid'
            await request(app)
                .post(`/api/v1/platforms`)
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .send(newPlatform)
                .expect(httpStatus.BAD_REQUEST);
        });

        test('should return 400 error if metadata is invalid based on the name field', async () => {
            await insertUsers([userOne]);
            newPlatform.metadata = { username: 'str' }
            await request(app)
                .post(`/api/v1/platforms`)
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .send(newPlatform)
                .expect(httpStatus.BAD_REQUEST);
        });

        test('should return 400 error if community is invalid', async () => {
            await insertUsers([userOne]);
            newPlatform.name = 'twitter'
            await request(app)
                .post(`/api/v1/platforms`)
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .send(newPlatform)
                .expect(httpStatus.BAD_REQUEST);

        });
    });

    describe('GET /api/v1/platforms', () => {
        test('should return 200 and apply the default query options', async () => {
            await insertCommunities([communityOne, communityTwo, communityThree]);
            await insertUsers([userOne, userTwo]);
            await insertPlatforms([platformOne, platformTwo, platformThree, platformFour, platformFive]);
            const res = await request(app)
                .get('/api/v1/platforms')
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .query({ community: communityOne._id.toHexString() })
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

            expect(res.body.results[0]).toMatchObject({
                id: platformTwo._id.toHexString(),
                name: platformTwo.name,
                metadata: platformTwo.metadata,
                community: communityOne._id.toHexString(),
                isInProgress: true
            });

            expect(res.body.results[1]).toMatchObject({
                id: platformOne._id.toHexString(),
                name: platformOne.name,
                metadata: platformOne.metadata,
                community: communityOne._id.toHexString(),
                isInProgress: true
            });
        });

        test('should return 401 if access token is missing', async () => {
            await insertCommunities([communityOne, communityTwo, communityThree]);
            await insertUsers([userOne, userTwo]);
            await insertPlatforms([platformOne, platformTwo, platformThree, platformFour, platformFive]);
            await request(app)
                .get('/api/v1/platforms')
                .send()
                .expect(httpStatus.UNAUTHORIZED);
        });

        test('should correctly apply filter on name field', async () => {
            await insertCommunities([communityOne, communityTwo, communityThree]);
            await insertUsers([userOne, userTwo]);
            await insertPlatforms([platformOne, platformTwo, platformThree, platformFour, platformFive]);
            const res = await request(app)
                .get('/api/v1/platforms')
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .query({ name: platformOne.name, community: communityOne._id.toHexString() })
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
            expect(res.body.results[0].id).toBe(platformTwo._id.toHexString());
            expect(res.body.results[1].id).toBe(platformOne._id.toHexString());

        });

        test('should correctly sort the returned array if descending sort param is specified', async () => {
            await insertCommunities([communityOne, communityTwo, communityThree]);
            await insertUsers([userOne, userTwo]);
            await insertPlatforms([platformOne, platformTwo, platformThree, platformFour, platformFive]);
            const res = await request(app)
                .get('/api/v1/platforms')
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .query({ sortBy: 'name:desc', community: communityOne._id.toHexString() })
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
            expect(res.body.results[0].id).toBe(platformOne._id.toHexString());
            expect(res.body.results[1].id).toBe(platformTwo._id.toHexString());

        });

        test('should correctly sort the returned array if ascending sort param is specified', async () => {
            await insertCommunities([communityOne, communityTwo, communityThree]);
            await insertUsers([userOne, userTwo]);
            await insertPlatforms([platformOne, platformTwo, platformThree, platformFour, platformFive]);
            const res = await request(app)
                .get('/api/v1/platforms')
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .query({ sortBy: 'name:asc', community: communityOne._id.toHexString() })
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
            expect(res.body.results[0].id).toBe(platformOne._id.toHexString());
            expect(res.body.results[1].id).toBe(platformTwo._id.toHexString());


        });


        test('should limit returned array if limit param is specified', async () => {
            await insertCommunities([communityOne, communityTwo, communityThree]);
            await insertUsers([userOne, userTwo]);
            await insertPlatforms([platformOne, platformTwo, platformThree, platformFour, platformFive]);
            const res = await request(app)
                .get('/api/v1/platforms')
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .query({ limit: 1, community: communityOne._id.toHexString() })
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
            expect(res.body.results[0].id).toBe(platformTwo._id.toHexString());
        });

        test('should return the correct page if page and limit params are specified', async () => {
            await insertCommunities([communityOne, communityTwo, communityThree]);
            await insertUsers([userOne, userTwo]);
            await insertPlatforms([platformOne, platformTwo, platformThree, platformFour, platformFive]);
            const res = await request(app)
                .get('/api/v1/platforms')
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .query({ page: 2, limit: 1, community: communityOne._id.toHexString() })
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
            expect(res.body.results[0].id).toBe(platformOne._id.toHexString());
        });
    });



    describe('GET /api/v1/platforms/:platformId', () => {
        test('should return 200 and the community object if data is ok', async () => {
            await insertCommunities([communityOne, communityTwo, communityThree]);
            await insertUsers([userOne, userTwo]);
            await insertPlatforms([platformOne, platformTwo, platformThree, platformFour, platformFive]);
            const res = await request(app)
                .get(`/api/v1/platforms/${platformOne._id}`)
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .send()
                .expect(httpStatus.OK);

            expect(res.body).toEqual({
                id: expect.anything(),
                name: platformOne.name,
                metadata: platformOne.metadata,
                community: communityOne._id.toHexString(),
                disconnectedAt: null,
                isInProgress: true,
                connectedAt: expect.anything()
            });
        });

        test('should return 401 error if access token is missing', async () => {
            await insertUsers([userOne]);

            await request(app)
                .get(`/api/v1/platforms/${platformOne._id}`)
                .send()
                .expect(httpStatus.UNAUTHORIZED);
        });

        test('should return 404 when user trys to access platoform they does not belong to', async () => {
            await insertCommunities([communityOne, communityTwo, communityThree]);
            await insertUsers([userOne, userTwo]);
            await insertPlatforms([platformOne, platformTwo, platformThree, platformFour, platformFive]);

            await request(app)
                .get(`/api/v1/platforms/${platformFour._id}`)
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .send()
                .expect(httpStatus.NOT_FOUND);
        });


        test('should return 400 error if platformId is not a valid mongo id', async () => {
            await insertUsers([userOne, userTwo]);
            await request(app)
                .get(`/api/v1/platforms/invalid`)
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .send()
                .expect(httpStatus.BAD_REQUEST);
        });

        test('should return 404 error if platoform is not found', async () => {
            await insertUsers([userOne]);

            await request(app)
                .get(`/api/v1/platforms/${platformOne._id}`)
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .send()
                .expect(httpStatus.NOT_FOUND);
        });
    });



    describe('PATCH /api/v1/platforms/:platformId', () => {
        let updateBody: IPlatformUpdateBody;

        beforeEach(() => {
            updateBody = {
                metadata: {
                    selectedChannels: ["8765", "1234"],
                    period: new Date(),
                    analyzerStartedAt: new Date()
                }
            };
        });
        test('should return 200 and successfully update platform if data is ok', async () => {
            await insertCommunities([communityOne, communityTwo]);
            await insertUsers([userOne]);
            await insertPlatforms([platformOne]);
            const res = await request(app)
                .patch(`/api/v1/platforms/${platformOne._id}`)
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .send(updateBody)
                .expect(httpStatus.OK);

            expect(res.body).toEqual({
                id: expect.anything(),
                name: platformOne.name,
                metadata: {
                    id: platformOne.metadata?.id,
                    selectedChannels: updateBody.metadata?.selectedChannels,
                    period: updateBody.metadata?.period.toISOString(),
                    analyzerStartedAt: expect.anything()
                },
                community: communityOne._id.toHexString(),
                disconnectedAt: null,
                isInProgress: true,
                connectedAt: expect.anything(),

            });

            const dbPlatform = await Platform.findById(res.body.id);
            expect(dbPlatform).toBeDefined();
            expect(dbPlatform).toMatchObject({
                name: platformOne.name,
                metadata: {
                    id: platformOne.metadata?.id,
                    selectedChannels: updateBody.metadata?.selectedChannels,
                    period: updateBody.metadata?.period,
                    analyzerStartedAt: expect.anything()

                },
                isInProgress: true
            });
        });

        test('should return 401 error if access token is missing', async () => {
            await insertUsers([userOne]);
            await request(app)
                .patch(`/api/v1/platforms/${platformOne._id}`)
                .send(updateBody)
                .expect(httpStatus.UNAUTHORIZED);
        });

        test('should return 404 when user trys to update platform they does not belong to', async () => {
            await insertCommunities([communityOne, communityTwo, communityThree]);
            await insertUsers([userOne, userTwo]);
            await insertPlatforms([platformOne, platformTwo, platformThree, platformFour, platformFive]);
            await request(app)
                .patch(`/api/v1/platforms/${platformFour._id}`)
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .send(updateBody)
                .expect(httpStatus.NOT_FOUND);
        });



        test('should return 400 error if platformId is not a valid mongo id', async () => {
            await insertCommunities([communityOne, communityTwo]);
            await insertUsers([userOne]);
            await insertPlatforms([platformOne]);
            await request(app)
                .patch(`/api/v1/platforms/invalid`)
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .send(updateBody)
                .expect(httpStatus.BAD_REQUEST);
        });

        test('should return 400 error if metadata is invalid based on the name field', async () => {
            await insertCommunities([communityOne, communityTwo]);
            await insertUsers([userOne]);
            await insertPlatforms([platformOne]);
            updateBody.metadata = { id: "1234" }
            await request(app)
                .patch(`/api/v1/platforms/${platformOne._id}`)
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .send(updateBody)
                .expect(httpStatus.BAD_REQUEST);

        });

        test('should return 400 error if metadata selectedChannels is invalid', async () => {
            await insertCommunities([communityOne, communityTwo]);
            await insertUsers([userOne]);
            await insertPlatforms([platformOne]);
            updateBody.metadata = { selectedChannels: "1234" }
            await request(app)
                .patch(`/api/v1/platforms/${platformOne._id}`)
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .send(updateBody)
                .expect(httpStatus.BAD_REQUEST);

        });

        test('should return 400 error if metadata period is invalid', async () => {
            await insertCommunities([communityOne, communityTwo]);
            await insertUsers([userOne]);
            await insertPlatforms([platformOne]);
            updateBody.metadata = { period: false }
            await request(app)
                .patch(`/api/v1/platforms/${platformOne._id}`)
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .send(updateBody)
                .expect(httpStatus.BAD_REQUEST);

        });

        test('should return 400 error if metadata analyzerStartedAt is invalid', async () => {
            await insertCommunities([communityOne, communityTwo]);
            await insertUsers([userOne]);
            await insertPlatforms([platformOne]);
            updateBody.metadata = { analyzerStartedAt: true }
            await request(app)
                .patch(`/api/v1/platforms/${platformOne._id}`)
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .send(updateBody)
                .expect(httpStatus.BAD_REQUEST);
        });



    });
    describe('DELETE /api/v1/platforms/:platformId', () => {
        test('should return 204 and soft delete the platform is deleteType is soft', async () => {
            await insertCommunities([communityOne, communityTwo, communityThree]);
            await insertUsers([userOne, userTwo]);
            await insertPlatforms([platformOne, platformTwo, platformThree, platformFour, platformFive]);

            await request(app)
                .delete(`/api/v1/platforms/${platformOne._id}`)
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .send({ deleteType: 'soft' })
                .expect(httpStatus.NO_CONTENT);

            const dbPlatform = await Platform.findById(platformOne._id);
            expect(dbPlatform).toBeDefined();
            expect(dbPlatform).toMatchObject({
                disconnectedAt: expect.any(Date)
            });
        });

        test('should return 204 and hard delete the platform is deleteType is hard', async () => {
            await insertCommunities([communityOne, communityTwo, communityThree]);
            await insertUsers([userOne, userTwo]);
            await insertPlatforms([platformOne, platformTwo, platformThree, platformFour, platformFive]);

            const res = await request(app)
                .delete(`/api/v1/platforms/${platformOne._id}`)
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .send({ deleteType: 'hard' })
                .expect(httpStatus.NO_CONTENT);

            const dbPlatform = await Platform.findById(res.body.id);
            expect(dbPlatform).toBeNull();
        });

        test('should return 401 error if access token is missing', async () => {
            await insertUsers([userOne]);

            await request(app)
                .delete(`/api/v1/platforms/${platformOne._id}`)
                .send()
                .expect(httpStatus.UNAUTHORIZED);
        });

        test('should return 404 when user trys to delete platform they does not belong to', async () => {
            await insertCommunities([communityOne, communityTwo, communityThree]);
            await insertUsers([userOne, userTwo]);
            await insertPlatforms([platformOne, platformTwo, platformThree, platformFour, platformFive]);

            await request(app)
                .delete(`/api/v1/platforms/${platformFour._id}`)
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .send({ deleteType: 'hard' })
                .expect(httpStatus.NOT_FOUND);
        });


        test('should return 400 error if platformId is not a valid mongo id', async () => {
            await insertUsers([userOne]);

            await request(app)
                .delete(`/api/v1/platforms/invalid`)
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .send()
                .expect(httpStatus.BAD_REQUEST);
        });

        test('should return 404 error if platform already is not found', async () => {
            await insertUsers([userOne]);

            await request(app)
                .delete(`/api/v1/platforms/${platformOne._id}`)
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .send({ deleteType: 'hard' })
                .expect(httpStatus.NOT_FOUND);
        });
    });

    describe('POST /:platformId/properties', () => {
        const connection = DatabaseManager.getInstance().getTenantDb(platformOne.metadata?.id);
        beforeEach(async () => {
            await connection.dropDatabase();
        });
        test('should return 200 and apply the default query options if requested property is discord-role', async () => {
            await insertCommunities([communityOne]);
            await insertUsers([userOne]);
            await insertPlatforms([platformOne]);
            await insertRoles([discordRole1, discordRole2, discordRole3, discordRole4], connection)


            const res = await request(app)
                .post(`/api/v1/platforms/${platformOne._id}/properties`)
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .query({ property: 'role' })
                .send()
                .expect(httpStatus.OK);


            expect(res.body).toEqual({
                results: expect.any(Array),
                page: 1,
                limit: 10,
                totalPages: 1,
                totalResults: 3,
            });
            expect(res.body.results).toHaveLength(3);


            expect(res.body.results[0]).toMatchObject({
                roleId: discordRole1.roleId,
                name: discordRole1.name,
                color: discordRole1.color,
            });
            expect(res.body.results[1]).toMatchObject({
                roleId: discordRole2.roleId,
                name: discordRole2.name,
                color: discordRole2.color,
            });

            expect(res.body.results[2]).toMatchObject({
                roleId: discordRole3.roleId,
                name: discordRole3.name,
                color: discordRole3.color,
            });
        });


        test('should correctly apply filter on name field if requested property is discord-role', async () => {
            await insertCommunities([communityOne]);
            await insertUsers([userOne]);
            await insertPlatforms([platformOne]);
            await insertRoles([discordRole1, discordRole2, discordRole3, discordRole4], connection)


            const res = await request(app)
                .post(`/api/v1/platforms/${platformOne._id}/properties`)
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .query({ property: 'role', name: 'Member' })
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
            expect(res.body.results[0].roleId).toBe(discordRole3.roleId);
        });

        test('should correctly sort the returned array if descending sort param is specified and requested property is discord-role', async () => {
            await insertCommunities([communityOne]);
            await insertUsers([userOne]);
            await insertPlatforms([platformOne]);
            await insertRoles([discordRole1, discordRole2, discordRole3, discordRole4], connection)


            const res = await request(app)
                .post(`/api/v1/platforms/${platformOne._id}/properties`)
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .query({ property: 'role', sortBy: 'name:desc' })
                .send()
                .expect(httpStatus.OK);


            expect(res.body).toEqual({
                results: expect.any(Array),
                page: 1,
                limit: 10,
                totalPages: 1,
                totalResults: 3,
            });
            expect(res.body.results).toHaveLength(3);
            expect(res.body.results[0].roleId).toBe(discordRole2.roleId);
            expect(res.body.results[1].roleId).toBe(discordRole3.roleId);
            expect(res.body.results[2].roleId).toBe(discordRole1.roleId);
        });

        test('should correctly sort the returned array if ascending sort param is specified and requested property is discord-role', async () => {
            await insertCommunities([communityOne]);
            await insertUsers([userOne]);
            await insertPlatforms([platformOne]);
            await insertRoles([discordRole1, discordRole2, discordRole3, discordRole4], connection)


            const res = await request(app)
                .post(`/api/v1/platforms/${platformOne._id}/properties`)
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .query({ property: 'role', sortBy: 'name:asc' })
                .send()
                .expect(httpStatus.OK);


            expect(res.body).toEqual({
                results: expect.any(Array),
                page: 1,
                limit: 10,
                totalPages: 1,
                totalResults: 3,
            });
            expect(res.body.results).toHaveLength(3);
            expect(res.body.results[0].roleId).toBe(discordRole1.roleId);
            expect(res.body.results[1].roleId).toBe(discordRole3.roleId);
            expect(res.body.results[2].roleId).toBe(discordRole2.roleId);
        });

        test('should limit returned array if limit param is specified and requested property is discord-role', async () => {
            await insertCommunities([communityOne]);
            await insertUsers([userOne]);
            await insertPlatforms([platformOne]);
            await insertRoles([discordRole1, discordRole2, discordRole3, discordRole4], connection)


            const res = await request(app)
                .post(`/api/v1/platforms/${platformOne._id}/properties`)
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .query({ property: 'role', limit: 1 })
                .send()
                .expect(httpStatus.OK);


            expect(res.body).toEqual({
                results: expect.any(Array),
                page: 1,
                limit: 1,
                totalPages: 3,
                totalResults: 3,
            });
            expect(res.body.results).toHaveLength(1);
            expect(res.body.results[0].roleId).toBe(discordRole1.roleId);

        });

        test('should return the correct page if page and limit params are specified and requested property is discord-role', async () => {
            await insertCommunities([communityOne]);
            await insertUsers([userOne]);
            await insertPlatforms([platformOne]);
            await insertRoles([discordRole1, discordRole2, discordRole3, discordRole4], connection)


            const res = await request(app)
                .post(`/api/v1/platforms/${platformOne._id}/properties`)
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .query({ property: 'role', page: 2, limit: 1 })
                .send()
                .expect(httpStatus.OK);


            expect(res.body).toEqual({
                results: expect.any(Array),
                page: 2,
                limit: 1,
                totalPages: 3,
                totalResults: 3,
            });
            expect(res.body.results).toHaveLength(1);
            expect(res.body.results[0].roleId).toBe(discordRole2.roleId);
        });

        test('should return 200 and channels data if requested property is discord-channel', async () => {
            await insertCommunities([communityOne]);
            await insertUsers([userOne]);
            await insertPlatforms([platformOne]);
            await insertChannels([discordChannel1, discordChannel2, discordChannel3, discordChannel4, discordChannel5], connection)


            const res = await request(app)
                .post(`/api/v1/platforms/${platformOne._id}/properties`)
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .query({ property: 'channel' })
                .send()
                .expect(httpStatus.OK);

            expect(res.body).toHaveLength(2);
            expect(res.body[0].subChannels).toHaveLength(2);
            expect(res.body[1].subChannels).toHaveLength(1);


            expect(res.body[0]).toMatchObject({
                channelId: "987654321098765432",
                title: "Channel 1",
                subChannels: [{
                    channelId: "234567890123456789",
                    name: "Channel 2",
                    parentId: "987654321098765432",
                    canReadMessageHistoryAndViewChannel: false
                },
                {
                    channelId: "345678901234567890",
                    name: "Channel 3",
                    parentId: "987654321098765432",
                    canReadMessageHistoryAndViewChannel: true
                }]
            });
            expect(res.body[1]).toMatchObject({
                channelId: "0",
                title: "unCategorized",
                subChannels: [{
                    channelId: "345678901234567000",
                    name: "Channel 4",
                    parentId: "345678901234567000",
                    canReadMessageHistoryAndViewChannel: true
                }]
            });
        });

        test('should correctly apply filter on channelId field if requested property is discord-channel', async () => {
            await insertCommunities([communityOne]);
            await insertUsers([userOne]);
            await insertPlatforms([platformOne]);
            await insertChannels([discordChannel1, discordChannel2, discordChannel3, discordChannel4, discordChannel5], connection)


            const res = await request(app)
                .post(`/api/v1/platforms/${platformOne._id}/properties`)
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .query({ property: 'channel' })
                .send({ channelIds: [discordChannel1.channelId, discordChannel2.channelId, discordChannel3.channelId] })
                .expect(httpStatus.OK);

            expect(res.body).toHaveLength(1);
            expect(res.body[0].subChannels).toHaveLength(2);


            expect(res.body[0]).toMatchObject({
                channelId: "987654321098765432",
                title: "Channel 1",
                subChannels: [{
                    channelId: "234567890123456789",
                    name: "Channel 2",
                    parentId: "987654321098765432",
                    canReadMessageHistoryAndViewChannel: false
                },
                {
                    channelId: "345678901234567890",
                    name: "Channel 3",
                    parentId: "987654321098765432",
                    canReadMessageHistoryAndViewChannel: true
                }]
            });
        });

        test('should return 401 error if access token is missing', async () => {
            await insertUsers([userOne]);
            await request(app)
                .post(`/api/v1/platforms/${platformOne._id}/properties`)
                .send()
                .expect(httpStatus.UNAUTHORIZED);
        });

        test('should return 404 when user trys to delete platform they does not belong to', async () => {
            await insertCommunities([communityOne, communityTwo, communityThree]);
            await insertUsers([userOne, userTwo]);
            await insertPlatforms([platformOne, platformTwo, platformThree, platformFour, platformFive]);
            await request(app)
                .post(`/api/v1/platforms/${platformFour._id}/properties`)
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .send()
                .expect(httpStatus.NOT_FOUND);
        });

        test('should return 400 error if platformId is not a valid mongo id', async () => {
            await insertCommunities([communityOne]);
            await insertUsers([userOne]);
            await insertPlatforms([platformOne]);
            await request(app)
                .post(`/api/v1/platforms/invalid/properties`)
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .send()
                .expect(httpStatus.BAD_REQUEST);

        });

        test('should return 400 error if requested property is invalid', async () => {
            await insertCommunities([communityOne]);
            await insertUsers([userOne]);
            await insertPlatforms([platformOne]);
            await request(app)
                .post(`/api/v1/platforms/${platformOne._id}/properties`)
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .query({ property: 'member' })
                .send()
                .expect(httpStatus.BAD_REQUEST);

        });

        test('should return 404 error if platform already is not found', async () => {
            await insertUsers([userOne]);
            await request(app)
                .post(`/api/v1/platforms/${platformOne._id}/properties`)
                .query({ property: 'role' })
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .send()
                .expect(httpStatus.NOT_FOUND);

        });
    });
});
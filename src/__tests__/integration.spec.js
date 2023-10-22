import path from 'node:path';
import { jest } from '@jest/globals';
import { MongoDBContainer } from '@testcontainers/mongodb';
import mongoose from 'mongoose';
import supertest from 'supertest';

jest.unstable_mockModule('nanoid', async () => {
  return {
    nanoid: jest.fn(() => 'fake-id'),
  };
});

const nanoId = (await import('nanoid')).nanoid;

describe('App Tests', () => {
  let mongoDBContainer;

  beforeAll(async () => {
    mongoDBContainer = await new MongoDBContainer('mongo:7')
      .withCopyDirectoriesToContainer([
        {
          source: path.resolve(process.cwd(), './database/init/'),
          target: '/docker-entrypoint-initdb.d/',
        },
      ])
      .start();

    // Mongoose is using the docker hostname. This only works if the test code is running inside of docker.
    // ?directConnection solves this connection issue.
    process.env.MONGODB_URL = `${mongoDBContainer.getConnectionString()}/urlShortener?directConnection=true`;
    process.env.APP_PORT = 5000;
  });

  afterAll(async () => {
    await mongoose.connection.close();
    await mongoDBContainer.stop();
  });

  describe('GET /links/:linkId', () => {
    it('returns data when record is found', async () => {
      const serverModule = (await import('../server.mjs')).app;

      await supertest(serverModule)
        .get('/links/Zx8lP5bWMhEgnvH')
        .expect(200)
        .then((response) => {
          expect(response.body).toMatchObject({
            success: true,
            data: {
              _id: expect.any(String),
              shortId: 'Zx8lP5bWMhEgnvH',
              target: 'https://www.youtube.com/',
            },
          });
        });
    });

    it('returns error when record is not found', async () => {
      const serverModule = (await import('../server.mjs')).app;

      await supertest(serverModule)
        .get('/links/fake-record')
        .expect(404)
        .then((response) => {
          expect(response.body).toMatchObject({
            success: false,
            error: 'Record not found',
          });
        });
    });
  });

  describe('GET /:shortId', () => {
    it('returns redirect when record is found', async () => {
      const serverModule = (await import('../server.mjs')).app;

      await supertest(serverModule)
        .get('/Zx8lP5bWMhEgnvH')
        .expect(301)
        .then((response) => {
          expect(response.headers.location).toBe('https://www.youtube.com/');
        });
    });

    it('returns error when record is not found', async () => {
      const serverModule = (await import('../server.mjs')).app;

      await supertest(serverModule)
        .get('/fake-record')
        .expect(404)
        .then((response) => {
          expect(response.body).toMatchObject({
            success: false,
            error: 'Record not found',
          });
        });
    });
  });

  describe('POST /links', () => {
    it('returns 201 whenever record created', async () => {
      nanoId.mockReturnValueOnce('bingo');
      const serverModule = (await import('../server.mjs')).app;

      await supertest(serverModule)
        .post('/links')
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .send({ target: 'https://www.duckduckgo.com/' })
        .expect(201)
        .then((response) => {
          expect(response.body).toMatchObject({
            success: true,
            data: {
              _id: expect.any(String),
              shortId: expect.any(String),
              target: 'https://www.duckduckgo.com/',
            },
          });
        });
    });

    it('returns 409 whenever URL is invalid', async () => {
      nanoId.mockReturnValueOnce('bingo');
      const serverModule = (await import('../server.mjs')).app;

      await supertest(serverModule)
        .post('/links')
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .send({ target: 'bad-url' })
        .expect(409)
        .then((response) => {
          expect(response.body).toMatchObject({
            success: false,
            error: 'Invalid target',
          });
        });
    });

    it('returns 409 when Short ID already exists', async () => {
      nanoId.mockReturnValueOnce('Zx8lP5bWMhEgnvH');
      const serverModule = (await import('../server.mjs')).app;

      await supertest(serverModule)
        .post('/links')
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .send({ target: 'https://www.duckduckgo.com/' })
        .expect(409)
        .then((response) => {
          expect(response.body).toMatchObject({
            success: false,
            error: 'Short Id already exists',
          });
        });
    });
  });
});

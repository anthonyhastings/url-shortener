import path from 'node:path';
import {
  MongoDBContainer,
  type StartedMongoDBContainer,
} from '@testcontainers/mongodb';
import mongoose from 'mongoose';
import { nanoid } from 'nanoid';
import supertest from 'supertest';
import { type Mock } from 'vitest';

vi.mock('nanoid', () => {
  return {
    nanoid: vi.fn(() => 'fake-id'),
  };
});

describe('App Tests', () => {
  let mongoDBContainer: StartedMongoDBContainer;

  beforeAll(async () => {
    mongoDBContainer = await new MongoDBContainer('mongo:8')
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
    process.env.APP_PORT = '5000';
  });

  afterAll(async () => {
    await mongoose.connection.close();
    await mongoDBContainer.stop();
  });

  describe('GET /links/:shortId', () => {
    it('returns 200 when record is found', async () => {
      const serverModule = (await import('../server.ts')).app;

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

    it('returns 404 when record is not found', async () => {
      const serverModule = (await import('../server.ts')).app;

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
    it('returns 301 when record is found', async () => {
      const serverModule = (await import('../server.ts')).app;

      await supertest(serverModule)
        .get('/Zx8lP5bWMhEgnvH')
        .expect(301)
        .then((response) => {
          expect(response.headers.location).toBe('https://www.youtube.com/');
        });
    });

    it('returns 404 when record is not found', async () => {
      const serverModule = (await import('../server.ts')).app;

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
      (nanoid as Mock).mockReturnValueOnce('another-fake-id');
      const serverModule = (await import('../server.ts')).app;

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
              shortId: 'another-fake-id',
              target: 'https://www.duckduckgo.com/',
            },
          });
        });
    });

    it('returns 400 whenever URL is invalid', async () => {
      const serverModule = (await import('../server.ts')).app;

      await supertest(serverModule)
        .post('/links')
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .send({ target: 'bad-url' })
        .expect(400)
        .then((response) => {
          expect(response.body).toMatchObject({
            success: false,
            error: 'Invalid target',
          });
        });
    });

    it('returns 409 when Short ID already exists', async () => {
      (nanoid as Mock).mockReturnValueOnce('Zx8lP5bWMhEgnvH');
      const serverModule = (await import('../server.ts')).app;

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

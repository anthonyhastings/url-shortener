db = new Mongo().getDB('urlShortener');

db.createUser({
  user: 'appUser',
  pwd: 'examplePassword',
  roles: [
    {
      role: 'readWrite',
      db: 'urlShortener',
      collection: 'links',
    },
  ],
});

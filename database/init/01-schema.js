db = new Mongo().getDB('urlShortener');

db.createCollection('links', { capped: false });

db.links.createIndex({ shortId: 1 });

db.links.insert([
  {
    shortId: 'fPbD2NkcxZ70QPT',
    target: 'https://www.google.co.uk/',
  },
  {
    shortId: '4Biym9VuXikRrr4',
    target: 'https://www.reddit.com/',
  },
  {
    shortId: 'Zx8lP5bWMhEgnvH',
    target: 'https://www.youtube.com/',
  },
]);

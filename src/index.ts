import 'dotenv/config';
import { config } from './config.ts';
import { app } from './server.ts';

app.listen(Number(config.APP_PORT), '0.0.0.0', () => {
  console.info(`Listening on port 0.0.0.0:${config.APP_PORT}`);
});

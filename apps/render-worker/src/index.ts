import { config } from 'dotenv';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../.env') });

// Dynamically imported so this module only loads (and reads process.env) after
// the .env file above has been loaded — static imports are hoisted and would
// run before the config() call above, seeing an empty environment.
await import('./worker');

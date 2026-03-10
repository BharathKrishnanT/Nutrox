import fs from 'fs';
import path from 'path';

const envFile = `export const environment = {
  GEMINI_API_KEY: '${process.env.GEMINI_API_KEY || ""}'
};
`;

fs.mkdirSync(path.join(process.cwd(), 'src/environments'), { recursive: true });
fs.writeFileSync(path.join(process.cwd(), 'src/environments/environment.ts'), envFile);
console.log('Environment file generated successfully.');

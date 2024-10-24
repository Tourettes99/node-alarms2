import fs from 'fs';
import path from 'path';

const logInteraction = (interaction: { ip: string; note: string; files: string[] }) => {
  const filePath = path.join(__dirname, '../interactions.json');
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  data.push(interaction);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

export default logInteraction;

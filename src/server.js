import express from 'express';
import logInteraction from './utils/logInteraction';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.post('/log-interaction', (req, res) => {
  const { note, files } = req.body;
  const ip = req.ip; // Capture the IP address
  logInteraction({ ip, note, files });
  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

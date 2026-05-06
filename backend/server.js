const dotenv = require('dotenv');
const app = require('./src/app');
const connectDB = require('./src/config/db');

dotenv.config();

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Veloura API running on port ${PORT}`);
  });
});


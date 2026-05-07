require('dotenv').config();

const cors = require('cors');
const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}));

app.get('/', (req, res) => {
  res.send('Veloura API Running');
});
app.get('/', (req, res) => {
  res.send('API Running');
});
connectDB()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Veloura API running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('DB Connection Error:', err);
  });
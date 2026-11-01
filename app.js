const express = require('express');
const path = require('path');
const config = require('./config/config');
const logger = require('./middlewares/logger');
const webRoutes = require('./routes/webRoutes');
const apiRoutes = require('./routes/apiRoutes');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(logger);

app.use('/', webRoutes);
app.use('/api', apiRoutes);

app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Endpoint tidak ditemukan',
  });
});

app.listen(config.port, () => {
  console.log(`Server ${config.appName} jalan di http://localhost:${config.port}`);
});

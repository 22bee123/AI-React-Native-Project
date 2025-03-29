const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for all routes
app.use(cors());

// Serve static files from the model directory
app.use('/model', express.static(path.join(__dirname, 'model/scoliosis_tfjs_model/content/scoliosis_tfjs_model')));

// API endpoint to check server status
app.get('/api/status', (req, res) => {
  res.json({ status: 'online', message: 'Scoliosis model server is running' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Model available at http://localhost:${PORT}/model/model.json`);
}); 
# Scoliosis Detection Model Backend

This server hosts the TensorFlow.js model for scoliosis detection.

## Setup

1. Install dependencies:
```
npm install
```

2. Start the server:
```
npm start
```

## Endpoints

- `GET /model/model.json` - The main model file
- `GET /model/group1-shard1of4.bin` - Model binary shard 1
- `GET /model/group1-shard2of4.bin` - Model binary shard 2
- `GET /model/group1-shard3of4.bin` - Model binary shard 3
- `GET /model/group1-shard4of4.bin` - Model binary shard 4
- `GET /api/status` - Check server status

## Usage in Frontend

In the frontend ModelService.js, make sure to set the correct IP address for your local machine:

```js
const MODEL_API = 'http://YOUR_IP_ADDRESS:5000';
```

Where `YOUR_IP_ADDRESS` is your computer's local network IP (not localhost) so your device can access it. 
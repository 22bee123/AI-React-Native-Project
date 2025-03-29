# GuluGod Posture - Scoliosis Detection App

A React Native app for scoliosis detection using TensorFlow.js and posture analysis.

## Project Structure

- `/frontend` - React Native Expo app
- `/backend` - Express server for TensorFlow.js model

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
```
cd backend
```

2. Install dependencies:
```
npm install
```

3. Start the server:
```
node server.js
```

4. The server will be running at http://YOUR_IP_ADDRESS:5000

### Frontend Setup

1. Navigate to the frontend directory:
```
cd frontend
```

2. Install dependencies:
```
npm install
```

3. Update the IP address in `frontend/services/ModelService.js` to match your computer's IP address:
```js
const MODEL_API = 'http://YOUR_IP_ADDRESS:5000';
```

4. Start the Expo development server:
```
npx expo start
```

5. Scan the QR code with Expo Go app on your phone.

## Features

- Real-time posture analysis using TensorFlow.js model
- Detects scoliosis and provides Cobb angle measurement
- Classification of curve severity (Normal, Mild, Moderate, Severe)
- Visualization of spine curve and analysis
- Works in both front and back camera modes
- Graceful fallback to simulation mode when backend is not available

## Technical Details

The app consists of two main parts:

1. **Backend**: Express server that hosts the TensorFlow.js model for scoliosis detection and provides API endpoints for model access.

2. **Frontend**: React Native app with Expo that captures camera input, sends it to the backend for processing, and displays the results with spine visualization.

## Development Notes

- The app uses a hybrid approach that can work in both online (with backend) and offline (simulation) modes.
- For best results, ensure your device is on the same WiFi network as the backend server.
- The model will automatically fall back to simulation mode if it cannot connect to the backend server. 
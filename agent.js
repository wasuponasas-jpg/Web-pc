const admin = require('firebase-admin');
const { exec } = require('child_process');
const screenshot = require('screenshot-desktop');
const path = require('path');
const fs = require('fs');

// 1. Load Service Account Key
const serviceAccount = require('./serviceAccountKey.json');

// 2. Initialize Firebase
// Replace 'YOUR_DATABASE_URL' with your actual Firebase Realtime Database URL
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://project-that-control-pc-default-rtdb.asia-southeast1.firebasedatabase.app/" 
});

const db = admin.database();
const commandsRef = db.ref('commands');

console.log('PC Agent is running and listening for commands...');

// 3. Listen for new commands
commandsRef.on('child_added', (snapshot) => {
  const command = snapshot.val();
  const commandId = snapshot.key;

  if (command && !command.executed) {
    console.log(`Received command: ${command.type}`, command.payload || '');

    handleCommand(command, commandId);
  }
});

async function handleCommand(command, commandId) {
  try {
    let result = '';

    switch (command.type) {
      case 'shell':
        result = await runShell(command.payload);
        break;
      case 'power':
        handlePower(command.payload);
        result = `Power command ${command.payload} initiated.`;
        break;
      case 'screenshot':
        result = await takeScreenshot();
        break;
      default:
        result = 'Unknown command type';
    }

    // Mark as executed and store result
    await commandsRef.child(commandId).update({
      executed: true,
      result: result,
      timestamp: admin.database.ServerValue.TIMESTAMP
    });

  } catch (error) {
    console.error('Error handling command:', error);
    await commandsRef.child(commandId).update({
      executed: true,
      error: error.message,
      timestamp: admin.database.ServerValue.TIMESTAMP
    });
  }
}

function runShell(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        resolve(`Error: ${stderr || error.message}`);
      } else {
        resolve(stdout || 'Success (no output)');
      }
    });
  });
}

function handlePower(action) {
  if (action === 'shutdown') {
    exec('shutdown /s /t 30'); // 30 seconds delay
  } else if (action === 'restart') {
    exec('shutdown /r /t 30');
  } else if (action === 'abort') {
    exec('shutdown /a');
  }
}

async function takeScreenshot() {
  try {
    const imgBuffer = await screenshot();
    const base64Image = imgBuffer.toString('base64');
    return `data:image/png;base64,${base64Image}`;
  } catch (err) {
    throw new Error('Failed to take screenshot: ' + err.message);
  }
}

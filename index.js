const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const app = express();
const port = 3000;

const webhookURL = 'WEBHOOKURL';
const stringsFilePath = 'strings.txt';
const id16FilePath = 'id16.json';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.static('public'));
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const form = new FormData();
    const randomString = generateRandomString(16);

    const messageId = await sendMessageToDiscord(randomString, req.file.buffer, req.file.originalname);
    saveToId16Json(randomString, messageId);

    fs.appendFileSync(stringsFilePath, randomString + '\n');

    const domain = `${req.protocol}://${req.get('host')}`;

    res.json({
      success: true,
      messageId,
      randomString,
      fileUrl: `${domain}/files/${randomString}`,
      originalname: req.file.originalname,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to send file to Discord.' });
  }
});

app.get('/files/:randomString', async (req, res) => {
  const randomString = req.params.randomString;

  try {
    const id16Json = JSON.parse(fs.readFileSync(id16FilePath, 'utf-8'));

    if (id16Json[randomString]) {
      const messageId = id16Json[randomString];

      const fileUrl = await getDiscordFileUrl(messageId);
      res.redirect(fileUrl);
    } else {
      res.status(404).send('String not found.');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send(`Internal Server Error: ${error.message}`);
  }
});

function generateRandomString(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

async function sendMessageToDiscord(randomString, fileBuffer, originalname) {
  const form = new FormData();

  form.append('file', fileBuffer, {
    filename: originalname,
    contentType: 'application/octet-stream',
  });

  form.append('content', randomString);

  const response = await axios.post(webhookURL, form, {
    headers: {
      ...form.getHeaders(),
    },
  });

  return response.data.id;
}

async function getDiscordFileUrl(messageId) {
  const response = await axios.get(`${webhookURL}/messages/${messageId}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return response.data.attachments[0].url;
}

function saveToId16Json(randomString, messageId) {
  try {
    let id16Json = {};
    if (fs.existsSync(id16FilePath)) {
      id16Json = JSON.parse(fs.readFileSync(id16FilePath, 'utf-8'));
    }

    id16Json[randomString] = messageId;

    fs.writeFileSync(id16FilePath, JSON.stringify(id16Json, null, 2));
  } catch (error) {
    console.error('Error saving to id16.json:', error);
  }
}

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

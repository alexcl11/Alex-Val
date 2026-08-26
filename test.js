const { loadEnvConfig } = require('@next/env');
loadEnvConfig(process.cwd());
const { google } = require('googleapis');

async function test() {
  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'https://developers.google.com/oauthplayground'
    );
    oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    
    const res = await drive.files.create({
      requestBody: {
        name: 'Test Folder',
        mimeType: 'application/vnd.google-apps.folder',
        parents: [process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID]
      },
      fields: 'id'
    });
    console.log('Success!', res.data);
  } catch (err) {
    console.error('Error:', err.message);
    if (err.response && err.response.data) console.error(err.response.data);
  }
}
test();

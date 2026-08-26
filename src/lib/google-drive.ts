import { google } from "googleapis";

const SCOPES = ['https://www.googleapis.com/auth/drive'];

export async function getDriveClient() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    "https://developers.google.com/oauthplayground"
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });

  return google.drive({ version: 'v3', auth: oauth2Client });
}

/**
 * Crea una subcarpeta dentro de la carpeta raíz y le otorga permisos públicos de lectura.
 */
export async function createDriveFolder(folderName: string) {
  const drive = await getDriveClient();
  const parentFolderId = process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID;

  if (!parentFolderId) {
    throw new Error('GOOGLE_DRIVE_PARENT_FOLDER_ID is not set');
  }

  // 1. Crear la carpeta
  const fileMetadata = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
    parents: [parentFolderId],
  };

  const folder = await drive.files.create({
    requestBody: fileMetadata,
    fields: 'id, webViewLink',
  });

  const folderId = folder.data.id;

  if (!folderId) {
    throw new Error('Failed to create folder');
  }

  // 2. Dar permisos públicos de lectura
  await drive.permissions.create({
    fileId: folderId,
    requestBody: {
      role: 'reader',
      type: 'anyone',
    },
  });

  return {
    driveFolderId: folderId,
    driveUrl: folder.data.webViewLink,
  };
}

export async function deleteDriveFolder(folderId: string) {
  const drive = await getDriveClient();
  try {
    await drive.files.delete({
      fileId: folderId,
    });
  } catch (error: any) {
    if (error.code === 403 || error.code === 404) {
      console.warn("Ignorando error al borrar carpeta antigua:", error.message);
    } else {
      throw error;
    }
  }
}

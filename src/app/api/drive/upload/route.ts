import { NextResponse } from 'next/server';
import { getDriveClient } from '@/lib/google-drive';
import { Readable } from 'stream';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const folderId = formData.get('folderId') as string;
    const files = formData.getAll('files') as File[];

    if (!folderId || !files || files.length === 0) {
      return NextResponse.json({ error: 'Missing folderId or files' }, { status: 400 });
    }

    const drive = await getDriveClient();
    const uploadedFiles = [];

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const stream = new Readable();
      stream.push(buffer);
      stream.push(null);

      const response = await drive.files.create({
        requestBody: {
          name: file.name,
          parents: [folderId],
        },
        media: {
          mimeType: file.type,
          body: stream,
        },
        fields: 'id, webViewLink',
      });

      uploadedFiles.push({
        id: response.data.id,
        url: response.data.webViewLink,
      });
    }

    return NextResponse.json({ success: true, files: uploadedFiles });
  } catch (error) {
    console.error('Error uploading files:', error);
    return NextResponse.json({ error: 'Failed to upload files' }, { status: 500 });
  }
}

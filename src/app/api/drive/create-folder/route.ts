import { NextResponse } from 'next/server';
import { createDriveFolder } from '@/lib/google-drive';

export async function POST(request: Request) {
  try {
    const { title } = await request.json();
    
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const folderName = `[Plan] ${title}`;
    const result = await createDriveFolder(folderName);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error creating folder:', error.message, error.response?.data);
    return NextResponse.json({ error: error.message || 'Failed to create folder' }, { status: 500 });
  }
}

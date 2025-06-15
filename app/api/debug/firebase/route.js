// File: app/api/debug/firebase/route.js
export async function GET() {
  try {
    const config = {
      apiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: !!process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: !!process.env.NEXT_PUBLIC_FIREBASE_APP_ID
    }

    const bucketValue = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET

    return Response.json({
      configPresent: config,
      bucketValue: bucketValue || 'NOT_SET',
      bucketLooksValid: bucketValue && bucketValue.includes('.appspot.com'),
      environment: process.env.NODE_ENV
    })
  } catch (error) {
    return Response.json({ error: 'Config check failed', details: error.message }, { status: 500 })
  }
}
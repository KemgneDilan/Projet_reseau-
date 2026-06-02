import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const payload = await request.json()
    const paymentSessionId = `ps_${Date.now()}`
    const paymentUrl = `/client?paymentSessionId=${paymentSessionId}`

    return NextResponse.json({
      success: true,
      data: {
        paymentSessionId,
        paymentUrl,
        reserved: payload,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Impossible d\'initialiser le paiement.', error: error.message },
      { status: 500 }
    )
  }
}

import { NextResponse } from 'next/server'
import axios from 'axios'

const API_BASE = 'https://api.domains.co.za/api'
const RESELLER_USERNAME = process.env.DOMAIN_RESELLER_USERNAME
const RESELLER_PASSWORD = process.env.DOMAIN_RESELLER_PASSWORD

export async function POST(req) {
    try {
        const { domain, action } = await req.json()

        if (!domain || !action) {
            return NextResponse.json({ error: 'Missing domain or action' }, { status: 400 })
        }

        const auth = {
            username: RESELLER_USERNAME,
            password: RESELLER_PASSWORD,
        }

        if (action === 'check') {
            const res = await axios.post(`${API_BASE}/domain/check`, { domain }, { auth })
            return NextResponse.json(res.data)
        }

        if (action === 'purchase') {
            const res = await axios.post(`${API_BASE}/domain/register`, {
                domain,
                years: 1,
                registrant: {
                    name: 'Your Name',
                    email: 'email@example.com',
                    phone: '+27123456789',
                    idNumber: '1234567890123',
                    address: '1 Example Street, Joburg, ZA',
                },
            }, { auth })

            return NextResponse.json(res.data)
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    } catch (error) {
        console.error(error?.response?.data || error.message)
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}

'use client'

import { useState } from 'react'

export default function DomainChecker() {
    const [domain, setDomain] = useState('')
    const [result, setResult] = useState(null)
    const [loading, setLoading] = useState(false)

    async function handleCheck() {
        setLoading(true)
        setResult(null)

        const res = await fetch('/api/domain', {
            method: 'POST',
            body: JSON.stringify({ domain, action: 'check' }),
        })

        const data = await res.json()
        setResult(data)
        setLoading(false)
    }

    async function handleBuy() {
        setLoading(true)
        const res = await fetch('/api/domain', {
            method: 'POST',
            body: JSON.stringify({ domain, action: 'purchase' }),
        })

        const data = await res.json()
        setResult(data)
        setLoading(false)
    }

    return (
        <div className="max-w-md mx-auto p-4 bg-white shadow rounded space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">Check & Buy a Domain</h2>
            <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="example.co.za"
                className="w-full border border-gray-300 rounded p-2"
            />
            <button
                onClick={handleCheck}
                disabled={loading}
                className="w-full bg-blue-600 text-white font-semibold py-2 rounded hover:bg-blue-700"
            >
                {loading ? 'Checking...' : 'Check Availability'}
            </button>

            {result && result.available && (
                <div className="bg-green-100 p-3 rounded text-green-800">
                    ✅ Domain is available!
                    <button
                        onClick={handleBuy}
                        className="mt-2 w-full bg-yellow-500 text-white py-2 rounded hover:bg-yellow-600"
                    >
                        Buy Now
                    </button>
                </div>
            )}

            {result && result.error && (
                <div className="bg-red-100 p-3 rounded text-red-700">
                    ❌ {result.error}
                </div>
            )}
            {result && result.available === false && (
                <div className="bg-yellow-100 p-3 rounded text-yellow-800">
                    ⚠️ Domain is not available.
                </div>
            )}
        </div>
    )
}

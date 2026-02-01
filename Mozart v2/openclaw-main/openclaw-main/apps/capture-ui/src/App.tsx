import { useState, useEffect } from 'react'
import { BriefView } from './components/BriefView'

// Mock Data for "Mini App" simulation
const MOCK_BRIEF = {
    title: "How I Bought 123 Main St for $0",
    hooks: ["Stop using banks", "I paid nothing for this", "Seller finance secret"],
    thumbnailText: ["$0 DOWN", "NO BANKS"],
    checklist: [
        { id: 1, text: "Intro: State the promise (Hook 1)", done: false },
        { id: 2, text: "Shot: Walking up to the front door", done: false },
        { id: 3, text: "Detail: Show the 'ugly' part of the house", done: false },
        { id: 4, text: "Explanation: How you found the seller", done: false },
        { id: 5, text: "Outro: CTA to subscribe", done: false }
    ]
}

function App() {
    const [brief, setBrief] = useState(MOCK_BRIEF)

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4">
            <header className="mb-6 border-b border-gray-700 pb-4">
                <h1 className="text-xl font-bold text-blue-400">Content OS | Capture</h1>
                <p className="text-sm text-gray-400">Layer 2: Field Protocol</p>
            </header>

            <main>
                <ErrorBoundary>
                    <BriefView brief={brief} />
                </ErrorBoundary>
            </main>
        </div>
    )
}

export default App

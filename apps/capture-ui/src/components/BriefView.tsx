import { useState } from 'react'
import { CheckCircleIcon } from '@heroicons/react/24/solid'
import { CheckCircleIcon as CheckCircleOutline } from '@heroicons/react/24/outline'

interface ChecklistItem {
    id: number;
    text: string;
    done: boolean;
}

interface Brief {
    title: string;
    hooks: string[];
    thumbnailText: string[];
    checklist: ChecklistItem[];
}

export function BriefView({ brief }: { brief: Brief }) {
    const [items, setItems] = useState(brief.checklist)

    const toggle = (id: number) => {
        setItems(items.map(i => i.id === id ? { ...i, done: !i.done } : i))
    }

    const progress = Math.round((items.filter(i => i.done).length / items.length) * 100)

    return (
        <div className="space-y-6">
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <h2 className="text-gray-400 text-xs uppercase tracking-wide mb-1">Target Title</h2>
                <p className="text-xl font-bold text-white leading-tight">{brief.title}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
                    <h3 className="text-gray-400 text-xs uppercase mb-2">Thumbnail</h3>
                    {brief.thumbnailText.map((t, i) => (
                        <div key={i} className="bg-red-600 text-white font-black text-center text-sm py-1 mb-1 uppercase transform -rotate-1">
                            {t}
                        </div>
                    ))}
                </div>
                <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
                    <h3 className="text-gray-400 text-xs uppercase mb-2">Hooks</h3>
                    <ul className="text-xs space-y-2 text-gray-300">
                        {brief.hooks.map((h, i) => <li key={i}>• {h}</li>)}
                    </ul>
                </div>
            </div>

            <div>
                <div className="flex justify-between items-end mb-2">
                    <h3 className="text-lg font-bold">Capture Checklist</h3>
                    <span className="text-sm font-mono text-green-400">{progress}%</span>
                </div>

                <div className="space-y-2">
                    {items.map(item => (
                        <button
                            key={item.id}
                            onClick={() => toggle(item.id)}
                            aria-label={`Toggle checklist item: ${item.text}`}
                            aria-pressed={item.done}
                            className={`w-full text-left p-4 rounded-lg border flex items-center gap-3 transition-colors ${item.done
                                ? 'bg-green-900/20 border-green-800 text-green-200'
                                : 'bg-gray-800 border-gray-700 text-gray-200 hover:border-gray-600'
                                }`}
                        >
                            {item.done
                                ? <CheckCircleIcon className="w-6 h-6 text-green-500 shrink-0" />
                                : <CheckCircleOutline className="w-6 h-6 text-gray-500 shrink-0" />
                            }
                            <span className={item.done ? 'line-through opacity-70' : ''}>{item.text}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

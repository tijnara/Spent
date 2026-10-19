'use client'

import { useState, useRef, useEffect } from 'react'

export interface CategoryOption {
    id: string
    name: string
    type: string
    icon: string
    color: string
}

interface CategoryComboboxProps {
    categories: CategoryOption[]
    type: 'expense' | 'income'
    selectedCategoryId: string | null
    newCategoryName: string
    onSelectExisting: (id: string, name: string) => void
    onSetNewCategory: (name: string) => void
    hasError?: boolean
}

export default function CategoryCombobox({
                                             categories,
                                             type,
                                             selectedCategoryId,
                                             newCategoryName,
                                             onSelectExisting,
                                             onSetNewCategory,
                                             hasError,
                                         }: CategoryComboboxProps) {
    const [query, setQuery] = useState('')
    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    const filteredTypeCategories = categories.filter((c) => c.type === type)

    // Sync input text when selected category or new category changes externally
    useEffect(() => {
        if (selectedCategoryId) {
            const found = filteredTypeCategories.find((c) => c.id === selectedCategoryId)
            if (found) setQuery(found.name)
        } else if (newCategoryName) {
            setQuery(newCategoryName)
        } else {
            setQuery('')
        }
    }, [selectedCategoryId, newCategoryName, type])

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const searchMatches = filteredTypeCategories.filter((c) =>
        c.name.toLowerCase().includes(query.trim().toLowerCase())
    )

    const exactMatch = filteredTypeCategories.find(
        (c) => c.name.toLowerCase() === query.trim().toLowerCase()
    )

    const isNew = query.trim().length > 0 && !exactMatch

    function handleInputChange(value: string) {
        setQuery(value)
        setIsOpen(true)

        const match = filteredTypeCategories.find(
            (c) => c.name.toLowerCase() === value.trim().toLowerCase()
        )

        if (match) {
            onSelectExisting(match.id, match.name)
        } else {
            onSetNewCategory(value)
        }
    }

    function handleSelect(category: CategoryOption) {
        setQuery(category.name)
        onSelectExisting(category.id, category.name)
        setIsOpen(false)
    }

    function handlePickNew() {
        if (!query.trim()) return
        onSetNewCategory(query.trim())
        setIsOpen(false)
    }

    return (
        <div ref={containerRef} className="relative w-full">
            {/* Input & Dropdown Toggle */}
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    placeholder="Search or type a category..."
                    onFocus={() => setIsOpen(true)}
                    onChange={(e) => handleInputChange(e.target.value)}
                    className={`w-full pl-3.5 pr-10 py-2.5 bg-input-bg border rounded-xl text-sm font-semibold text-input-text placeholder:text-muted focus:outline-none focus:ring-2 ${
                        hasError
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-input-border focus:ring-spent-violet'
                    }`}
                />

                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                    {query && (
                        <button
                            type="button"
                            onClick={() => {
                                setQuery('')
                                onSetNewCategory('')
                                setIsOpen(true)
                            }}
                            className="text-xs text-muted hover:text-card-foreground p-0.5"
                        >
                            ✕
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => setIsOpen(!isOpen)}
                        className="text-muted hover:text-card-foreground transition-transform"
                    >
                        <span className={`text-[10px] block transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                            ▼
                        </span>
                    </button>
                </div>
            </div>

            {/* Prompt Banner if Unassigned */}
            {hasError && (
                <p className="text-xs font-bold text-red-500 mt-1 animate-in fade-in duration-150">
                    ⚠️ Please select or type a category to proceed.
                </p>
            )}

            {/* Dropdown Options */}
            {isOpen && (
                <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-card border border-card-border rounded-2xl shadow-xl max-h-56 overflow-y-auto divide-y divide-card-border/50 animate-in fade-in-50 zoom-in-95 duration-100">
                    {/* Auto-Add New Category Option */}
                    {isNew && (
                        <button
                            type="button"
                            onClick={handlePickNew}
                            className="w-full text-left p-3 hover:bg-spent-violet/10 flex items-center justify-between text-xs font-bold text-spent-violet dark:text-spent-yellow transition-colors"
                        >
                            <span className="flex items-center gap-2">
                                <span className="text-base">✨</span>
                                <span>Add new: &quot;{query.trim()}&quot;</span>
                            </span>
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-spent-yellow text-spent-violet-dark">
                                Auto-Save
                            </span>
                        </button>
                    )}

                    {/* Filtered Existing Categories */}
                    {searchMatches.length > 0 ? (
                        searchMatches.map((cat) => {
                            const isSelected = selectedCategoryId === cat.id
                            return (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => handleSelect(cat)}
                                    className={`w-full text-left p-3 flex items-center justify-between text-xs font-bold hover:bg-input-bg transition-colors ${
                                        isSelected
                                            ? 'bg-spent-violet/10 text-spent-violet dark:text-spent-yellow'
                                            : 'text-card-foreground'
                                    }`}
                                >
                                    <div className="flex items-center gap-2.5">
                                        <span className="text-base">{cat.icon || '🏷️'}</span>
                                        <span>{cat.name}</span>
                                    </div>
                                    {isSelected && <span className="text-xs">✓</span>}
                                </button>
                            )
                        })
                    ) : !isNew ? (
                        <div className="p-4 text-center text-xs text-muted font-medium">
                            No matching categories found.
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    )
}
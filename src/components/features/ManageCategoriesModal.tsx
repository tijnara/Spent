'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { addCategory, updateCategory, deleteCategory } from '../../app/dashboard/actions'

export interface CategoryItem {
    id: string
    name: string
    type: string
    icon: string
    color: string
}

const COMMON_EMOJIS = ['🍔', '☕', '🚗', '🛒', '🎮', '💡', '💊', '🏠', '🎬', '✈️', '💼', '💻', '📈', '🎁', '🎓']

interface ManageCategoriesModalProps {
    categories: CategoryItem[]
    triggerButton?: React.ReactNode
    isOpen?: boolean
    onClose?: () => void
}

export default function ManageCategoriesModal({
                                                  categories,
                                                  triggerButton,
                                                  isOpen: controlledIsOpen,
                                                  onClose: controlledOnClose,
                                              }: ManageCategoriesModalProps) {
    const [mounted, setMounted] = useState(false)
    const [internalIsOpen, setInternalIsOpen] = useState(false)
    const isModalOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen

    const [filterType, setFilterType] = useState<'expense' | 'income'>('expense')
    const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null)
    const [isCreating, setIsCreating] = useState(false)
    const [loading, setLoading] = useState(false)

    // Form inputs state
    const [nameInput, setNameInput] = useState('')
    const [iconInput, setIconInput] = useState('🏷️')
    const [typeInput, setTypeInput] = useState<'expense' | 'income'>('expense')

    useEffect(() => {
        setMounted(true)
    }, [])

    function handleClose() {
        if (controlledOnClose) {
            controlledOnClose()
        }
        setInternalIsOpen(false)
        cancelForm()
    }

    function startCreate() {
        setEditingCategory(null)
        setNameInput('')
        setIconInput(filterType === 'income' ? '💵' : '🏷️')
        setTypeInput(filterType)
        setIsCreating(true)
    }

    function startEdit(cat: CategoryItem) {
        setIsCreating(false)
        setEditingCategory(cat)
        setNameInput(cat.name)
        setIconInput(cat.icon || '🏷️')
        setTypeInput(cat.type as 'expense' | 'income')
    }

    function cancelForm() {
        setIsCreating(false)
        setEditingCategory(null)
        setNameInput('')
    }

    async function handleSaveCategory(e?: React.FormEvent | React.MouseEvent | React.KeyboardEvent) {
        if (e) {
            e.preventDefault()
            e.stopPropagation()
        }
        if (!nameInput.trim() || loading) return

        setLoading(true)

        const formData = new FormData()
        formData.set('name', nameInput.trim())
        formData.set('icon', iconInput.trim())
        formData.set('type', typeInput)

        try {
            if (editingCategory) {
                formData.set('id', editingCategory.id)
                await updateCategory(formData)
            } else {
                await addCategory(formData)
            }
            cancelForm()
        } catch (err: any) {
            alert(err.message || 'Failed to save category')
        } finally {
            setLoading(false)
        }
    }

    async function handleDelete(cat: CategoryItem, e?: React.MouseEvent) {
        if (e) {
            e.stopPropagation()
        }
        const confirmed = window.confirm(
            `Delete category "${cat.name}"? Transactions using this category will remain, but will no longer have this tag.`
        )
        if (!confirmed) return

        setLoading(true)
        const formData = new FormData()
        formData.set('id', cat.id)

        try {
            await deleteCategory(formData)
            if (editingCategory?.id === cat.id) {
                cancelForm()
            }
        } catch (err: any) {
            alert(err.message || 'Failed to delete category')
        } finally {
            setLoading(false)
        }
    }

    const currentList = categories.filter((c) => c.type === filterType)

    // The modal backdrop and dialog with explicit inline z-index of 99999
    const modalContent = isModalOpen && (
        <div
            onClick={handleClose}
            style={{ zIndex: 99999 }}
            className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{ zIndex: 100000 }}
                className="w-full max-w-lg bg-card border border-card-border rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 max-h-[90vh] flex flex-col relative"
            >
                {/* Header */}
                <div className="flex justify-between items-center pb-3 border-b border-card-border">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">🏷️</span>
                        <h3 className="text-xl font-extrabold text-card-foreground">
                            Manage Categories
                        </h3>
                    </div>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="text-muted hover:text-card-foreground font-bold text-xl px-2 py-1 cursor-pointer"
                    >
                        ✕
                    </button>
                </div>

                {/* Expense / Income Filter Switcher */}
                <div className="grid grid-cols-2 p-1 bg-input-bg border border-input-border rounded-xl">
                    <button
                        type="button"
                        onClick={() => {
                            setFilterType('expense')
                            if (isCreating) setTypeInput('expense')
                        }}
                        className={`py-2 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                            filterType === 'expense'
                                ? 'bg-spent-violet text-white shadow-xs'
                                : 'text-muted hover:text-card-foreground'
                        }`}
                    >
                        Expense Categories ({categories.filter((c) => c.type === 'expense').length})
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setFilterType('income')
                            if (isCreating) setTypeInput('income')
                        }}
                        className={`py-2 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                            filterType === 'income'
                                ? 'bg-spent-yellow text-spent-violet-dark shadow-xs'
                                : 'text-muted hover:text-card-foreground'
                        }`}
                    >
                        Income Categories ({categories.filter((c) => c.type === 'income').length})
                    </button>
                </div>

                {/* Add / Edit Form Box (Using <div> to prevent nested HTML form errors) */}
                {(isCreating || editingCategory) && (
                    <div className="p-4 bg-input-bg/70 border border-input-border rounded-2xl space-y-3 animate-in slide-in-from-top-2 duration-150">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-black uppercase text-card-foreground">
                                {editingCategory ? 'Edit Category' : 'New Category'}
                            </span>
                            <button
                                type="button"
                                onClick={cancelForm}
                                className="text-xs text-muted hover:text-card-foreground font-bold cursor-pointer"
                            >
                                Cancel
                            </button>
                        </div>

                        <div className="grid grid-cols-4 gap-2">
                            {/* Icon Emoji Selector */}
                            <div className="col-span-1">
                                <label className="block text-[10px] font-bold uppercase text-muted mb-1">
                                    Icon
                                </label>
                                <input
                                    type="text"
                                    value={iconInput}
                                    maxLength={4}
                                    onChange={(e) => setIconInput(e.target.value)}
                                    required
                                    className="w-full text-center py-2 bg-card border border-input-border rounded-xl text-lg font-bold text-input-text focus:outline-none focus:ring-2 focus:ring-spent-violet"
                                />
                            </div>

                            {/* Category Name */}
                            <div className="col-span-3">
                                <label className="block text-[10px] font-bold uppercase text-muted mb-1">
                                    Category Name
                                </label>
                                <input
                                    type="text"
                                    value={nameInput}
                                    onChange={(e) => setNameInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault()
                                            e.stopPropagation()
                                            handleSaveCategory(e)
                                        }
                                    }}
                                    placeholder="e.g. Groceries, Gym, Tech"
                                    autoFocus
                                    className="w-full px-3 py-2 bg-card border border-input-border rounded-xl text-sm font-semibold text-input-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-spent-violet"
                                />
                            </div>
                        </div>

                        {/* Quick Emoji Suggestions */}
                        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                            {COMMON_EMOJIS.map((emoji) => (
                                <button
                                    key={emoji}
                                    type="button"
                                    onClick={() => setIconInput(emoji)}
                                    className="p-1 hover:bg-card rounded-md text-base transition-colors cursor-pointer"
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>

                        <div className="flex justify-end gap-2 pt-1">
                            <button
                                type="button"
                                disabled={loading || !nameInput.trim()}
                                onClick={handleSaveCategory}
                                className="px-4 py-2 bg-spent-yellow hover:bg-spent-yellow-dark text-spent-violet-dark font-extrabold text-xs rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                            >
                                {loading
                                    ? 'Saving...'
                                    : editingCategory
                                        ? 'Save Changes'
                                        : 'Add Category'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Category List */}
                <div className="flex-1 overflow-y-auto space-y-2 pr-1 divide-y divide-card-border/50">
                    {currentList.length === 0 ? (
                        <p className="text-center py-8 text-xs text-muted font-medium">
                            No {filterType} categories found. Click below to add one!
                        </p>
                    ) : (
                        currentList.map((cat) => (
                            <div
                                key={cat.id}
                                className="pt-2 flex items-center justify-between group hover:bg-input-bg/40 px-2 py-2 rounded-xl transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="w-9 h-9 rounded-xl bg-input-bg border border-input-border flex items-center justify-center text-lg">
                                        {cat.icon || '🏷️'}
                                    </span>
                                    <div>
                                        <span className="font-bold text-sm text-card-foreground">
                                            {cat.name}
                                        </span>
                                        <span className="block text-[10px] text-muted capitalize">
                                            {cat.type}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={() => startEdit(cat)}
                                        className="p-1.5 text-muted hover:text-spent-violet dark:hover:text-spent-yellow rounded-lg transition-colors cursor-pointer"
                                        title="Edit"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        type="button"
                                        disabled={loading}
                                        onClick={(e) => handleDelete(cat, e)}
                                        className="p-1.5 text-muted hover:text-red-500 rounded-lg transition-colors cursor-pointer disabled:opacity-40"
                                        title="Delete"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Add Button Trigger */}
                {!isCreating && !editingCategory && (
                    <button
                        type="button"
                        onClick={startCreate}
                        className="w-full py-3 border-2 border-dashed border-card-border hover:border-spent-violet dark:hover:border-spent-yellow rounded-2xl text-xs font-black text-muted hover:text-card-foreground transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                        <span>+</span>
                        <span>Create New Category</span>
                    </button>
                )}
            </div>
        </div>
    )

    return (
        <>
            {triggerButton ? (
                <div onClick={() => setInternalIsOpen(true)} className="inline-block cursor-pointer">
                    {triggerButton}
                </div>
            ) : controlledIsOpen === undefined ? (
                <button
                    type="button"
                    onClick={() => setInternalIsOpen(true)}
                    className="text-xs font-bold text-spent-violet hover:text-spent-violet-dark dark:text-spent-yellow transition-colors cursor-pointer"
                >
                    ⚙️ Manage Categories
                </button>
            ) : null}

            {/* Portaled directly into document.body to break out of any parent stacking contexts */}
            {mounted && isModalOpen && typeof document !== 'undefined'
                ? createPortal(modalContent, document.body)
                : null}
        </>
    )
}
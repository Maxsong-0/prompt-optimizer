"use client"

import { X, Command } from "lucide-react"

interface KeyboardShortcutsModalProps {
  isOpen: boolean
  onClose: () => void
}

const shortcuts = [
  { keys: ["Ctrl", "Enter"], description: "Optimize prompt" },
  { keys: ["Ctrl", "S"], description: "Save current prompt" },
  { keys: ["Ctrl", "E"], description: "Export prompt" },
  { keys: ["Ctrl", "Shift", "S"], description: "Save as template" },
  { keys: ["Ctrl", "L"], description: "Clear editor" },
  { keys: ["Ctrl", "1"], description: "View Version 1" },
  { keys: ["Ctrl", "2"], description: "View Version 2" },
  { keys: ["Ctrl", "D"], description: "View Diff" },
  { keys: ["Ctrl", "/"], description: "Show shortcuts" },
  { keys: ["Esc"], description: "Close modal" },
]

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 p-6 rounded-2xl bg-card border border-border shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Command className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Keyboard Shortcuts</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface transition-colors">
            <X className="w-5 h-5 text-foreground-muted" />
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="space-y-2">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <span className="text-sm text-foreground-secondary">{shortcut.description}</span>
              <div className="flex items-center gap-1">
                {shortcut.keys.map((key, keyIndex) => (
                  <span key={keyIndex}>
                    <kbd className="px-2 py-1 text-xs font-mono rounded bg-surface border border-border text-foreground">
                      {key}
                    </kbd>
                    {keyIndex < shortcut.keys.length - 1 && <span className="text-foreground-muted mx-1">+</span>}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-4 text-xs text-foreground-muted text-center">
          Press <kbd className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-surface border border-border">Ctrl</kbd>{" "}
          + <kbd className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-surface border border-border">/</kbd> to show
          this menu anytime
        </p>
      </div>
    </div>
  )
}

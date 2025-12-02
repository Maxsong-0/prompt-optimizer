"use client"

import { X, AlertTriangle } from "lucide-react"
import { GradientButton } from "./gradient-button"

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: "danger" | "warning" | "default"
  isLoading?: boolean
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  isLoading = false,
}: ConfirmationModalProps) {
  if (!isOpen) return null

  const variantStyles = {
    danger: "from-error to-red-600",
    warning: "from-warning to-yellow-600",
    default: "from-primary to-accent",
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-sm mx-4 p-6 rounded-2xl bg-card border border-border shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-lg bg-gradient-to-br ${variantStyles[variant]} flex items-center justify-center`}
            >
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface transition-colors">
            <X className="w-5 h-5 text-foreground-muted" />
          </button>
        </div>

        {/* Content */}
        <p className="text-sm text-foreground-secondary mb-6">{message}</p>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <GradientButton variant="ghost" onClick={onClose} disabled={isLoading}>
            {cancelLabel}
          </GradientButton>
          <GradientButton
            onClick={onConfirm}
            loading={isLoading}
            className={variant === "danger" ? "bg-gradient-to-r from-error to-red-600" : undefined}
          >
            {confirmLabel}
          </GradientButton>
        </div>
      </div>
    </div>
  )
}

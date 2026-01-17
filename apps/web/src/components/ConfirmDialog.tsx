import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
    isOpen: boolean;
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
    onCancel: () => void;
}

export function ConfirmDialog({
    isOpen,
    title = '確認操作',
    message,
    confirmText = '確認',
    cancelText = '取消',
    variant = 'danger',
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    const dialogRef = useRef<HTMLDivElement>(null);

    // Focus trap and escape key
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onCancel();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onCancel]);

    if (!isOpen) return null;

    const variantStyles = {
        danger: {
            icon: 'bg-red-50 text-red-500',
            button: 'bg-red-600 hover:bg-red-700 text-white',
            border: 'border-red-100',
        },
        warning: {
            icon: 'bg-yellow-50 text-yellow-600',
            button: 'bg-yellow-600 hover:bg-yellow-700 text-white',
            border: 'border-yellow-100',
        },
        info: {
            icon: 'bg-blue-50 text-blue-500',
            button: 'bg-blue-600 hover:bg-blue-700 text-white',
            border: 'border-blue-100',
        },
    };

    const styles = variantStyles[variant];

    // Use Portal to render at document.body for true viewport centering
    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/20 backdrop-blur-sm animate-fade-in"
                onClick={onCancel}
            />

            {/* Dialog */}
            <div
                ref={dialogRef}
                className="relative bg-white rounded-xl shadow-2xl w-[420px] max-w-[90vw] animate-scale-in overflow-hidden"
                role="alertdialog"
                aria-modal="true"
            >
                {/* Header */}
                <div className={`flex items-start gap-4 p-5 border-b ${styles.border}`}>
                    <div className={`p-2 rounded-lg ${styles.icon}`}>
                        <AlertTriangle size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-base">{title}</h3>
                        <p className="mt-1 text-sm text-gray-600 leading-relaxed">{message}</p>
                    </div>
                    <button
                        onClick={onCancel}
                        className="p-1 hover:bg-gray-100 rounded-md text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 px-5 py-4 bg-gray-50">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${styles.button}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}

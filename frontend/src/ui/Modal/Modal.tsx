import React, { ReactNode, useEffect } from 'react';
import { cva, VariantProps } from 'class-variance-authority';

const overlayStyles = cva(
    'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity',
    {
        variants: {
            open: {
                true: 'opacity-100',
                false: 'opacity-0 pointer-events-none',
            },
        },
        defaultVariants: {
            open: false,
        },
    }
);

const modalStyles = cva(
    'overflow-auto transform transition-all max-h-[90vh]',
    {
        variants: {
            variant: {
                primary: 'bg-custom text-custom',
                secondary: 'bg-custom-dark-gray text-custom',
                success: 'bg-green-600 text-white',
                danger: 'bg-custom-red text-white',
            },
            size: {
                sm: 'max-w-md w-full',
                md: 'max-w-lg w-full',
                lg: 'max-w-xl w-full',
                xl: 'max-w-2xl w-full',
                full: 'w-full h-full',
            },
            radius: {
                none: 'rounded-none',
                sm: 'rounded-sm',
                md: 'rounded-md',
                lg: 'rounded-lg',
                xl: 'rounded-xl',
            },
            position: {
                center: 'my-8 mx-auto',
                top: 'mt-4 mb-auto mx-auto',
                bottom: 'mb-4 mt-auto mx-auto',
            },
            animation: {
                none: '',
                fade: 'transition-opacity duration-300',
                scale: 'scale-95 hover:scale-100',
                slideTop: 'translate-y-4 hover:translate-y-0',
                slideBottom: '-translate-y-4 hover:translate-y-0',
            }
        },
        defaultVariants: {
            variant: 'primary',
            size: 'md',
            radius: 'lg',
            position: 'center',
            animation: 'scale',
        },
    }
);

interface ModalProps extends VariantProps<typeof modalStyles> {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
    className?: string;
    showCloseButton?: boolean;
    closeOnClickOutside?: boolean;
    closeOnEsc?: boolean;
}

const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    children,
    variant,
    size,
    radius,
    position,
    animation,
    className = '',
    showCloseButton = true,
    closeOnClickOutside = true,
    closeOnEsc = true,
}) => {
    // Close on escape key
    useEffect(() => {
        const handleEscKey = (event: KeyboardEvent) => {
            if (closeOnEsc && isOpen && event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscKey);
            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscKey);
            // Restore body scroll when modal is closed
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose, closeOnEsc]);

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (closeOnClickOutside && e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className={overlayStyles({ open: isOpen })}
            onClick={handleOverlayClick}
        >
            <div
                className={`${modalStyles({ variant, size, radius, position, animation })} ${className}`}
                role="dialog"
                aria-modal="true"
            >
                {showCloseButton && (
                    <button
                        className="absolute top-2 right-2 text-custom p-2 hover:text-custom-light-gray"
                        onClick={onClose}
                        aria-label="Close modal"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                )}
                {children}
            </div>
        </div>
    );
};

export default Modal; 
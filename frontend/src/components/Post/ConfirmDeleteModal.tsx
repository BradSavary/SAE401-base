import React from 'react';

interface ConfirmDeleteModalProps {
    onCancel: () => void;
    onConfirm: () => void;
}

function ConfirmDeleteModal({ onCancel, onConfirm }: ConfirmDeleteModalProps) {
    return (
        <div className="fixed inset-0 flex items-center justify-center z-30 backdrop-blur-sm bg-custom bg-opacity-30">
            <div className="bg-custom-inverse p-4 md:p-6 rounded-lg shadow-lg max-w-xs sm:max-w-sm mx-4">
                <p className="mb-4 text-custom-inverse text-sm md:text-base">Êtes-vous sûr de vouloir supprimer ce post ?</p>
                <div className="flex justify-end gap-3">
                    <button
                        className="px-3 py-1.5 text-sm bg-custom-light-gray bg-opacity-30 rounded-md hover:bg-opacity-50 text-custom-inverse"
                        onClick={onCancel}
                    >
                        Annuler
                    </button>
                    <button
                        className="px-3 py-1.5 text-sm bg-custom-red text-custom rounded-md hover:bg-opacity-90"
                        onClick={onConfirm}
                    >
                        Supprimer
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmDeleteModal; 
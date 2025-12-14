import React, { useState, useEffect } from 'react';
import { X, Key } from 'lucide-react';
import { getSettings, saveSettings } from '../utils/storage';

const SettingsModal = ({ isOpen, onClose }) => {
    const [apiKey, setApiKey] = useState('');

    useEffect(() => {
        if (isOpen) {
            const settings = getSettings();
            setApiKey(settings.apiKey || '');
        }
    }, [isOpen]);

    const handleSave = () => {
        if (apiKey.trim()) {
            saveSettings({ apiKey: apiKey.trim() });
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Key className="w-5 h-5 text-blue-600" /> API Settings
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Groq API Key
                    </label>
                    <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="gsk_..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Get your free key from <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Groq Console</a>.
                    </p>
                </div>

                <div className="flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Save Key
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;

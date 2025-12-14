import React, { useState } from 'react';
import { Menu, Settings, LogOut } from 'lucide-react';
import SettingsModal from '../SettingsModal';

const Layout = ({ children }) => {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            {/* Top Bar */}
            <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        {/* Logo area */}
                        <div className="flex flex-col">
                            <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent">
                                SSC GD Mock
                            </span>
                            <span className="text-[10px] md:text-xs text-gray-500 font-medium">Adaptive AI Platform</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4">
                        <button
                            onClick={() => setIsSettingsOpen(true)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                            title="Settings"
                        >
                            <Settings className="w-5 h-5" />
                        </button>
                        <div className="hidden sm:flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                                VS
                            </div>
                            <span className="text-sm font-medium text-gray-700">Vaisakh</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-7xl mx-auto px-2 md:px-4 sm:px-6 lg:px-8 py-4 md:py-6 w-full">
                {children}
            </main>

            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        </div>
    );
};

export default Layout;

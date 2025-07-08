import React from 'react';

export default function Loader() {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="w-16 h-16 border-4 border-t-purple-500 border-gray-300 rounded-full animate-spin" />
        </div>
    );
}
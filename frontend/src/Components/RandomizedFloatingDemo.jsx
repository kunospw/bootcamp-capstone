import React, { useState } from 'react';
import FloatingDecorations from './FloatingDecorations';

const RandomizedFloatingDemo = ({ variant = "jobList", mobile = false }) => {
    const [refreshKey, setRefreshKey] = useState(Date.now());

    const refreshDecorations = () => {
        setRefreshKey(Date.now());
    };

    return (
        <div className="relative">
            <FloatingDecorations 
                variant={variant} 
                mobile={mobile} 
                seed={refreshKey} 
            />
            
            {/* Debug/Demo Button - Remove in production */}
            <button
                onClick={refreshDecorations}
                className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors z-50 text-sm"
                title="Refresh Floating Decorations"
            >
                🔄 Refresh Animations
            </button>
        </div>
    );
};

export default RandomizedFloatingDemo;

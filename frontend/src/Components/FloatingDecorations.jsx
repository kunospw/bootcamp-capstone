import React, { useMemo } from 'react';

const FloatingDecorations = ({ variant = "jobList", mobile = false, seed = null }) => {
    // Generate random decorations on each component mount or when seed changes
    const randomDecorations = useMemo(() => {
        // Use seed for deterministic randomness if provided, otherwise use current time
        const randomSeed = seed || Date.now();
        
        // Simple seeded random function
        const seededRandom = (seed) => {
            const x = Math.sin(seed) * 10000;
            return x - Math.floor(x);
        };
        
        let seedCounter = randomSeed;
        const getRandom = () => {
            seedCounter++;
            return seededRandom(seedCounter);
        };
        
        const generateRandomElements = (count, isAuth = false, isMobile = false) => {
            const elements = [];
            const animations = ['animate-float-1', 'animate-float-2', 'animate-float-3', 'animate-float-4', 'animate-float-5', 'animate-float-6', 'animate-float-7', 'animate-float-8', 'animate-float-9', 'animate-float-10'];
            const colors = ['bg-[#F4B400]', 'bg-white/25', 'bg-white/20', 'bg-white/15', 'bg-white/30'];
            
            // Different size ranges based on context
            const sizes = isMobile 
                ? ['w-6 h-6', 'w-8 h-8', 'w-10 h-10', 'w-12 h-12', 'w-14 h-14', 'w-16 h-16']
                : ['w-8 h-8', 'w-10 h-10', 'w-12 h-12', 'w-14 h-14', 'w-16 h-16', 'w-18 h-18', 'w-20 h-20', 'w-22 h-22', 'w-24 h-24', 'w-28 h-28'];
            
            for (let i = 0; i < count; i++) {
                // Random positioning
                const positions = [
                    'top-12', 'top-16', 'top-20', 'top-24', 'top-28', 'top-32', 'top-40',
                    'top-1/4', 'top-1/3', 'top-1/2', 'top-2/3', 'top-3/4',
                    'bottom-12', 'bottom-16', 'bottom-20', 'bottom-24', 'bottom-32', 'bottom-40',
                    'bottom-1/4', 'bottom-1/3', 'bottom-1/2'
                ];
                
                const horizontalPositions = [
                    'left-8', 'left-12', 'left-16', 'left-20',
                    'left-1/4', 'left-1/3', 'left-1/2',
                    'right-8', 'right-12', 'right-16', 'right-20',
                    'right-1/4', 'right-1/3', 'right-1/2'
                ];
                
                // Random selections using seeded random
                const randomPosition = positions[Math.floor(getRandom() * positions.length)];
                const randomHorizontal = horizontalPositions[Math.floor(getRandom() * horizontalPositions.length)];
                const randomSize = sizes[Math.floor(getRandom() * sizes.length)];
                const randomColor = colors[Math.floor(getRandom() * colors.length)];
                const randomAnimation = animations[Math.floor(getRandom() * animations.length)];
                
                // Generate random opacity and animation delay
                const randomOpacity = (getRandom() * 0.4 + 0.45).toFixed(2); // 0.45 to 0.85
                const randomDelay = (getRandom() * 5).toFixed(1); // 0 to 5 seconds delay
                
                // Ensure no z-index conflicts and proper layering
                const zIndex = isAuth ? 'z-10' : 'z-20';
                
                elements.push(
                    <div 
                        key={i}
                        className={`absolute ${randomPosition} ${randomHorizontal} ${randomSize} ${randomColor} rounded-full ${randomAnimation} ${zIndex}`}
                        style={{ 
                            opacity: randomOpacity,
                            animationDelay: `${randomDelay}s`
                        }}
                    />
                );
            }
            
            return elements;
        };
        
        // Generate different sets based on variant
        if (variant === "jobList") {
            return generateRandomElements(mobile ? 8 : 15, false, mobile);
        } else if (variant === "auth" && mobile) {
            return generateRandomElements(8, true, true);
        } else {
            return generateRandomElements(12, true, false);
        }
    }, [variant, mobile, seed]);

    // Different decorative patterns for different pages
    const jobListDecorations = (
        <>
            {randomDecorations}
        </>
    );

    const authPageDecorations = (
        <>
            {randomDecorations}
        </>
    );

    const authMobileDecorations = (
        <>
            {randomDecorations}
        </>
    );

    const getDecorations = () => {
        if (variant === "jobList") {
            return jobListDecorations;
        } else if (variant === "auth" && mobile) {
            return authMobileDecorations;
        } else {
            return authPageDecorations;
        }
    };

    return (
        <>
            {getDecorations()}
        </>
    );
};

export default FloatingDecorations;

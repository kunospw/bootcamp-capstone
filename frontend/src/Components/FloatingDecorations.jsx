import React from 'react';

const FloatingDecorations = ({ variant = "jobList", mobile = false }) => {
    // Different decorative patterns for different pages
    const jobListDecorations = (
        <>
            {/* Job List page decorations - positioned below navbar */}
            <div className='absolute top-20 right-16 w-24 h-24 bg-[#F4B400] rounded-full animate-float-1 opacity-75 z-20'></div>
            <div className='absolute bottom-20 left-16 w-28 h-28 bg-[#F4B400] rounded-full animate-float-2 opacity-80 z-20'></div>
            <div className='absolute top-1/3 right-1/3 w-14 h-14 bg-[#F4B400] rounded-full animate-float-3 opacity-85 z-20'></div>
            <div className='absolute bottom-1/4 right-1/4 w-18 h-18 bg-white/25 rounded-full animate-float-4 opacity-65 z-20'></div>
            <div className='absolute top-1/4 left-8 w-20 h-20 bg-white/20 rounded-full animate-float-5 opacity-55 z-20'></div>
            <div className='absolute bottom-1/3 right-8 w-10 h-10 bg-[#F4B400] rounded-full animate-float-6 opacity-70 z-20'></div>
            <div className='absolute top-2/3 left-1/4 w-16 h-16 bg-white/15 rounded-full animate-float-7 opacity-60 z-20'></div>
            <div className='absolute top-24 left-1/2 w-12 h-12 bg-[#F4B400] rounded-full animate-float-8 opacity-80 z-20'></div>
            <div className='absolute bottom-16 left-1/3 w-22 h-22 bg-white/20 rounded-full animate-float-9 opacity-50 z-20'></div>
            <div className='absolute top-28 right-1/4 w-8 h-8 bg-[#F4B400] rounded-full animate-float-10 opacity-90 z-20'></div>
            
            {/* Additional decorative elements to fill the space better */}
            <div className='absolute top-32 left-20 w-16 h-16 bg-[#F4B400] rounded-full animate-float-3 opacity-70 z-20'></div>
            <div className='absolute bottom-32 right-20 w-20 h-20 bg-white/30 rounded-full animate-float-5 opacity-60 z-20'></div>
            <div className='absolute top-40 right-12 w-14 h-14 bg-[#F4B400] rounded-full animate-float-7 opacity-75 z-20'></div>
            <div className='absolute bottom-40 left-12 w-18 h-18 bg-white/25 rounded-full animate-float-2 opacity-55 z-20'></div>
        </>
    );

    const authPageDecorations = (
        <>
            {/* Auth pages decorations - full screen coverage */}
            <div className='absolute top-16 right-16 w-24 h-24 bg-[#F4B400] rounded-full animate-float-1 opacity-75'></div>
            <div className='absolute bottom-20 left-16 w-28 h-28 bg-[#F4B400] rounded-full animate-float-2 opacity-80'></div>
            <div className='absolute top-1/3 right-1/3 w-14 h-14 bg-[#F4B400] rounded-full animate-float-3 opacity-85'></div>
            <div className='absolute bottom-1/4 right-1/4 w-18 h-18 bg-white/25 rounded-full animate-float-4 opacity-65'></div>
            <div className='absolute top-1/4 left-8 w-20 h-20 bg-white/20 rounded-full animate-float-5 opacity-55'></div>
            <div className='absolute bottom-1/3 right-8 w-10 h-10 bg-[#F4B400] rounded-full animate-float-6 opacity-70'></div>
            <div className='absolute top-2/3 left-1/4 w-16 h-16 bg-white/15 rounded-full animate-float-7 opacity-60'></div>
            <div className='absolute top-12 left-1/2 w-12 h-12 bg-[#F4B400] rounded-full animate-float-8 opacity-80'></div>
        </>
    );

    const authMobileDecorations = (
        <>
            {/* Auth pages mobile decorations - smaller and fewer elements */}
            <div className='absolute top-12 right-12 w-18 h-18 bg-[#F4B400] rounded-full animate-float-1 opacity-65'></div>
            <div className='absolute bottom-12 left-12 w-22 h-22 bg-[#F4B400] rounded-full animate-float-2 opacity-55'></div>
            <div className='absolute top-1/4 left-1/3 w-10 h-10 bg-[#F4B400] rounded-full animate-float-3 opacity-75'></div>
            <div className='absolute top-20 left-8 w-6 h-6 bg-white/25 rounded-full animate-float-4 opacity-45'></div>
            <div className='absolute bottom-1/3 right-1/4 w-16 h-16 bg-white/20 rounded-full animate-float-5 opacity-40'></div>
            <div className='absolute top-3/4 right-8 w-8 h-8 bg-[#F4B400] rounded-full animate-float-6 opacity-60'></div>
            <div className='absolute bottom-20 left-1/3 w-12 h-12 bg-white/15 rounded-full animate-float-7 opacity-35'></div>
            <div className='absolute top-16 right-1/3 w-14 h-14 bg-[#F4B400] rounded-full animate-float-8 opacity-70'></div>
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

            {/* Floating animations styles */}
            <style jsx>{`
                @keyframes float-1 {
                    0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
                    25% { transform: translateY(-15px) translateX(-12px) rotate(90deg); }
                    50% { transform: translateY(-5px) translateX(18px) rotate(180deg); }
                    75% { transform: translateY(-20px) translateX(-8px) rotate(270deg); }
                }
                
                @keyframes float-2 {
                    0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
                    33% { transform: translateY(12px) translateX(25px) rotate(120deg); }
                    66% { transform: translateY(-15px) translateX(-12px) rotate(240deg); }
                }
                
                @keyframes float-3 {
                    0%, 100% { transform: translateY(0px) translateX(0px) scale(1); }
                    50% { transform: translateY(-25px) translateX(-15px) scale(1.15); }
                }
                
                @keyframes float-4 {
                    0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
                    25% { transform: translateY(18px) translateX(12px) rotate(-90deg); }
                    50% { transform: translateY(-8px) translateX(-20px) rotate(-180deg); }
                    75% { transform: translateY(-12px) translateX(8px) rotate(-270deg); }
                }
                
                @keyframes float-5 {
                    0%, 100% { transform: translateY(0px) translateX(0px) scale(1) rotate(0deg); }
                    20% { transform: translateY(-8px) translateX(-12px) scale(0.85) rotate(72deg); }
                    40% { transform: translateY(12px) translateX(18px) scale(1.2) rotate(144deg); }
                    60% { transform: translateY(-18px) translateX(-5px) scale(0.9) rotate(216deg); }
                    80% { transform: translateY(8px) translateX(10px) scale(1.1) rotate(288deg); }
                }
                
                @keyframes float-6 {
                    0%, 100% { transform: translateY(0px) translateX(0px); }
                    33% { transform: translateY(-20px) translateX(-18px); }
                    66% { transform: translateY(15px) translateX(12px); }
                }
                
                @keyframes float-7 {
                    0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg) scale(1); }
                    25% { transform: translateY(-10px) translateX(15px) rotate(45deg) scale(1.1); }
                    50% { transform: translateY(8px) translateX(-10px) rotate(90deg) scale(0.9); }
                    75% { transform: translateY(-15px) translateX(5px) rotate(135deg) scale(1.05); }
                }
                
                @keyframes float-8 {
                    0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
                    50% { transform: translateY(-30px) translateX(0px) rotate(180deg); }
                }
                
                @keyframes float-9 {
                    0%, 100% { transform: translateY(0px) translateX(0px) scale(1) rotate(0deg); }
                    25% { transform: translateY(-12px) translateX(10px) scale(1.1) rotate(45deg); }
                    50% { transform: translateY(8px) translateX(-15px) scale(0.9) rotate(90deg); }
                    75% { transform: translateY(-18px) translateX(8px) scale(1.05) rotate(135deg); }
                }
                
                @keyframes float-10 {
                    0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
                    33% { transform: translateY(-22px) translateX(-10px) rotate(120deg); }
                    66% { transform: translateY(10px) translateX(20px) rotate(240deg); }
                }
                
                .animate-float-1 { animation: float-1 9s ease-in-out infinite; }
                .animate-float-2 { animation: float-2 11s ease-in-out infinite; }
                .animate-float-3 { animation: float-3 7s ease-in-out infinite; }
                .animate-float-4 { animation: float-4 13s ease-in-out infinite; }
                .animate-float-5 { animation: float-5 16s ease-in-out infinite; }
                .animate-float-6 { animation: float-6 8s ease-in-out infinite; }
                .animate-float-7 { animation: float-7 14s ease-in-out infinite; }
                .animate-float-8 { animation: float-8 6s ease-in-out infinite; }
                .animate-float-9 { animation: float-9 12s ease-in-out infinite; }
                .animate-float-10 { animation: float-10 10s ease-in-out infinite; }
            `}</style>
        </>
    );
};

export default FloatingDecorations;

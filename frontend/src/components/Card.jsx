import React from 'react';

const Card = ({ children, className = '', noPadding = false, ...props }) => {
    return (
        <div
            className={`bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden transition-all duration-200 hover:shadow-md hover:border-slate-300/60 ${noPadding ? '' : 'p-6 md:p-8'} ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;

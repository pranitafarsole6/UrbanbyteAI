import React from 'react';

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    onClick,
    type = 'button',
    icon: Icon,
    ...props
}) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95';

    const variants = {
        primary: 'bg-eco-primary hover:bg-eco-hover text-white shadow-md shadow-eco-primary/20 focus:ring-eco-primary',
        secondary: 'bg-white hover:bg-slate-50 text-eco-text border border-slate-200 shadow-sm focus:ring-slate-200',
        outline: 'bg-transparent hover:bg-eco-primary/10 text-eco-primary border-2 border-eco-primary focus:ring-eco-primary',
        ghost: 'bg-transparent hover:bg-slate-100 text-eco-muted hover:text-eco-text focus:ring-slate-200',
        danger: 'bg-eco-critical hover:bg-red-600 text-white shadow-md shadow-red-500/20 focus:ring-eco-critical',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base',
    };

    return (
        <button
            type={type}
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            onClick={onClick}
            {...props}
        >
            {Icon && <Icon className={`w-5 h-5 ${children ? 'mr-2' : ''}`} />}
            {children}
        </button>
    );
};

export default Button;

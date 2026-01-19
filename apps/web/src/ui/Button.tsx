
import { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'icon';
    isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className = '', variant = 'secondary', size = 'md', isLoading, children, disabled, ...props }, ref) => {

        const baseStyles = "inline-flex items-center justify-center rounded-[4px] font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed select-none";

        const variants = {
            primary: "bg-[#2383E2] text-white hover:bg-[#1D74C9] border border-transparent shadow-sm", // Notion blue
            secondary: "bg-white text-[#37352F] border border-[rgba(55,53,47,0.16)] hover:bg-[rgba(55,53,47,0.08)] shadow-sm",
            danger: "bg-white text-red-600 border border-[rgba(55,53,47,0.16)] hover:bg-red-50 shadow-sm",
            ghost: "bg-transparent text-[#37352F] hover:bg-[rgba(55,53,47,0.08)]",
        };

        const sizes = {
            sm: "h-6 px-2 text-xs",
            md: "h-8 px-3 text-sm",
            icon: "h-8 w-8",
        };

        return (
            <button
                ref={ref}
                className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                {children}
            </button>
        );
    }
);

Button.displayName = "Button";

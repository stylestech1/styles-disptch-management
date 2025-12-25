interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className = '' 
}: BadgeProps) => {
  const variantClasses = {
    primary: 'bg-blue-100 text-blue-800',
    secondary: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    danger: 'bg-red-600 text-white',
    warning: 'bg-yellow-100 text-yellow-800'
  };
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm'
  };
  
  return (
    <span
      className={`
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        rounded-full font-medium inline-flex items-center justify-center
        ${className}
      `}
    >
      {children}
    </span>
  );
};
import React from 'react';
import { Link } from '@inertiajs/react';

const variants = {
  primary: 'bg-primary-navy text-white hover:bg-primary-slate shadow-md hover:shadow-lg transition-all duration-200',
  secondary: 'bg-white text-primary-navy border-2 border-primary-navy hover:bg-primary-navy hover:text-white transition-all duration-200',
  outline: 'bg-transparent text-primary-navy border-2 border-primary-navy hover:bg-primary-navy/5',
};

const sizes = {
  sm: 'px-4 py-2 text-sm rounded-md',
  md: 'px-6 py-3 text-base rounded-lg',
  lg: 'px-8 py-4 text-lg rounded-xl',
};

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  href, 
  className = '', 
  ...props 
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-navy';
  const variantStyles = variants[variant] || variants.primary;
  const sizeStyles = sizes[size] || sizes.md;
  
  const classes = `${baseStyles} ${variantStyles} ${sizeStyles} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
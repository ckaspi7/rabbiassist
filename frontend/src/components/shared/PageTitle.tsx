
import React from 'react';

interface PageTitleProps {
  title: string;
  subtitle?: string;
}

const PageTitle = ({ title, subtitle }: PageTitleProps) => {
  return (
    <div className="mb-8">
      <h1 className="text-2xl md:text-3xl font-semibold text-zinc-900 dark:text-zinc-50 tracking-tight">{title}</h1>
      {subtitle && (
        <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">{subtitle}</p>
      )}
    </div>
  );
};

export default PageTitle;

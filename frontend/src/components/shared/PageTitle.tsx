
import React from 'react';

interface PageTitleProps {
  title: string;
  subtitle?: string;
}

const PageTitle = ({ title, subtitle }: PageTitleProps) => {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-semibold text-torah-text">{title}</h1>
      {subtitle && (
        <p className="text-torah-lightText mt-2">{subtitle}</p>
      )}
    </div>
  );
};

export default PageTitle;

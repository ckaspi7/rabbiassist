
import React from 'react';
import { Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';

interface MenuTileProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  to: string;
  span?: 'default' | 'wide' | 'full';
  style?: React.CSSProperties;
}

const MenuTile = ({ icon: Icon, title, description, to, style }: MenuTileProps) => {
  return (
    <Link
      to={to}
      className="menu-tile group block"
      style={style}
    >
      <div className="flex items-start justify-between mb-8">
        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-950/70 transition-colors">
          <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <svg
          className="h-4 w-4 text-zinc-300 dark:text-zinc-600 group-hover:text-zinc-400 dark:group-hover:text-zinc-500 transition-colors -rotate-45 group-hover:rotate-0 transition-transform duration-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </div>
      <div>
        <p className="font-semibold text-zinc-900 dark:text-zinc-50 text-sm tracking-tight">{title}</p>
        {description && (
          <p className="text-zinc-400 dark:text-zinc-500 text-xs mt-0.5 leading-relaxed">{description}</p>
        )}
      </div>
    </Link>
  );
};

export default MenuTile;

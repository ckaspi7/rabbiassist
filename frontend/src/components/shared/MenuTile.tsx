
import React from 'react';
import { Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';

interface MenuTileProps {
  icon: LucideIcon;
  title: string;
  to: string;
}

const MenuTile = ({ icon: Icon, title, to }: MenuTileProps) => {
  return (
    <Link to={to} className="menu-tile">
      <Icon size={40} className="text-torah-blue" />
      <span className="font-medium text-torah-text">{title}</span>
    </Link>
  );
};

export default MenuTile;

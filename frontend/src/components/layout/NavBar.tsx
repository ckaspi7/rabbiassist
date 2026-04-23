
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from "../ui/navigation-menu";

const NavBar = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <NavigationMenu className="hidden md:flex">
      <NavigationMenuList className="flex gap-1">
        <NavigationMenuItem>
          <Link 
            to="/trips" 
            className={`px-3 py-2 text-sm rounded-md transition-colors ${
              isActive('/trips') ? 'bg-primary/10 text-primary' : 'hover:bg-primary/5'
            }`}
          >
            My Trips
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link 
            to="/reminders" 
            className={`px-3 py-2 text-sm rounded-md transition-colors ${
              isActive('/reminders') ? 'bg-primary/10 text-primary' : 'hover:bg-primary/5'
            }`}
          >
            Reminders
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link 
            to="/events" 
            className={`px-3 py-2 text-sm rounded-md transition-colors ${
              isActive('/events') ? 'bg-primary/10 text-primary' : 'hover:bg-primary/5'
            }`}
          >
            Event Organizer
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link 
            to="/documents" 
            className={`px-3 py-2 text-sm rounded-md transition-colors ${
              isActive('/documents') ? 'bg-primary/10 text-primary' : 'hover:bg-primary/5'
            }`}
          >
            Documents
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link 
            to="/assistant" 
            className={`px-3 py-2 text-sm rounded-md transition-colors ${
              isActive('/assistant') ? 'bg-primary/10 text-primary' : 'hover:bg-primary/5'
            }`}
          >
            Assistant
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link 
            to="/settings" 
            className={`px-3 py-2 text-sm rounded-md transition-colors ${
              isActive('/settings') ? 'bg-primary/10 text-primary' : 'hover:bg-primary/5'
            }`}
          >
            Settings
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};

export default NavBar;

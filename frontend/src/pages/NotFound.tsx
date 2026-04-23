
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { useEffect } from 'react';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-torah-blue">404</h1>
        <p className="text-xl text-torah-text my-4">Oops! Page not found</p>
        <p className="text-torah-lightText mb-8">
          We couldn't find the page you were looking for. It might have been moved or doesn't exist.
        </p>
        <Button asChild className="bg-torah-blue hover:bg-torah-darkBlue">
          <Link to="/">Return to Home</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;

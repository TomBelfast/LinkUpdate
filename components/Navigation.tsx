'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-white shadow mb-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex space-x-4">
            <Link 
              href="/" 
              className={`px-3 py-2 rounded-md ${
                pathname === '/' 
                  ? 'bg-orange-500 text-white' 
                  : 'text-gray-700 hover:bg-orange-100'
              }`}
            >
              Linki
            </Link>
            <Link 
              href="/prompts" 
              className={`px-3 py-2 rounded-md ${
                pathname === '/prompts' 
                  ? 'bg-orange-500 text-white' 
                  : 'text-gray-700 hover:bg-orange-100'
              }`}
            >
              Prompty
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

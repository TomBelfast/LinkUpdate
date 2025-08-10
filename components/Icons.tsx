import React from 'react';

interface IconProps {
  className?: string;
}

export const EditIcon: React.FC<IconProps> = ({ className = "w-4 h-4 mr-1" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const DeleteIcon: React.FC<IconProps> = ({ className = "w-4 h-4 mr-1" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const CopyIcon: React.FC<IconProps> = ({ className = "w-4 h-4 mr-1" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M20 9h-9a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const ShareIcon: React.FC<IconProps> = ({ className = "w-4 h-4 mr-1" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="16 6 12 2 8 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="12" y1="2" x2="12" y2="15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const buttonStyles = {
  edit: `gradient-button flex items-center gap-2 text-white bg-black ${
    'bg-opacity-90 hover:bg-opacity-100'
  } border-[3px] border-transparent bg-clip-padding hover:-translate-y-1 transition-all duration-300 edit-gradient`,
  
  delete: `gradient-button flex items-center gap-2 text-white bg-black ${
    'bg-opacity-90 hover:bg-opacity-100'
  } border-[3px] border-transparent bg-clip-padding hover:-translate-y-1 transition-all duration-300 delete-gradient`,
  
  copy: `gradient-button flex items-center gap-2 text-white bg-black ${
    'bg-opacity-90 hover:bg-opacity-100'
  } border-[3px] border-transparent bg-clip-padding hover:-translate-y-1 transition-all duration-300 copy-gradient`,
  
  share: `gradient-button flex items-center gap-2 text-white bg-black ${
    'bg-opacity-90 hover:bg-opacity-100'
  } border-[3px] border-transparent bg-clip-padding hover:-translate-y-1 transition-all duration-300 share-gradient`
}; 
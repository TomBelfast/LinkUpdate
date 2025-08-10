export const commonStyles = {
  container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8',
  section: 'mb-8',
  card: 'p-4 rounded-lg',
  pageTitle: 'text-3xl font-bold mb-8',
  secondaryTitle: 'text-2xl font-semibold mb-4 text-gray-100',
  input: 'w-full p-2 rounded-lg bg-[#1a1d24] border border-[#3a4149] text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-500',
  textarea: 'w-full p-2 rounded-lg bg-[#1a1d24] border border-[#3a4149] text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-500',
  button: 'px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2',
  link: 'text-orange-500 hover:text-orange-600',
  error: 'text-red-500',
  success: 'text-green-500',
};

export const buttonStyles = {
  edit: 'flex items-center justify-center gap-2 bg-[#1a1d24] text-gray-100 hover:bg-[#3a4149] rounded-lg px-3 py-1',
  delete: 'flex items-center justify-center gap-2 bg-[#1a1d24] text-red-400 hover:bg-[#3a4149] rounded-lg px-3 py-1',
  copy: 'flex items-center justify-center gap-2 bg-[#1a1d24] text-blue-400 hover:bg-[#3a4149] rounded-lg px-3 py-1',
  share: 'flex items-center justify-center gap-2 bg-[#1a1d24] text-green-400 hover:bg-[#3a4149] rounded-lg px-3 py-1',
};

// Dodaj globalne style dla całej aplikacji
export const globalStyles = `
  body {
    background-color: #0f1216;
    margin: 0;
    padding: 0;
    color: #e5e7eb;
  }

  /* Style dla modali */
  .modal {
    background-color: #1a1d24;
    border-color: #3a4149;
  }

  /* Style dla inputów i selectów */
  input, select, textarea {
    background-color: #1a1d24;
    border-color: #3a4149;
    color: #e5e7eb;
  }

  input:focus, select:focus, textarea:focus {
    border-color: #f97316;
    ring-color: #f97316;
  }

  /* Style dla przycisków */
  button {
    transition: all 0.2s;
  }

  /* Style dla linków */
  a {
    color: #f97316;
    transition: color 0.2s;
  }

  a:hover {
    color: #fb923c;
  }
`; 
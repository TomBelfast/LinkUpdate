export const commonStyles = {
  container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8',
  section: 'mb-8',
  card: 'p-4 rounded-lg bg-card text-foreground border border-border',
  pageTitle: 'text-3xl font-bold mb-8 text-foreground',
  secondaryTitle: 'text-2xl font-semibold mb-4 text-foreground',
  input: 'w-full p-2 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary placeholder-muted-foreground',
  textarea: 'w-full p-2 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary placeholder-muted-foreground',
  button: 'px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all',
  link: 'text-primary hover:opacity-80 transition-colors',
  error: 'text-destructive',
  success: 'text-green-500',
};

export const buttonStyles = {
  edit: 'flex items-center justify-center gap-2 bg-secondary text-foreground hover:bg-accent rounded-lg px-3 py-1 transition-colors',
  delete: 'flex items-center justify-center gap-2 bg-secondary text-destructive hover:bg-destructive/10 rounded-lg px-3 py-1 transition-colors',
  copy: 'flex items-center justify-center gap-2 bg-secondary text-blue-400 hover:bg-blue-400/10 rounded-lg px-3 py-1 transition-colors',
  share: 'flex items-center justify-center gap-2 bg-secondary text-green-400 hover:bg-green-400/10 rounded-lg px-3 py-1 transition-colors',
};

// Globalne style przeniesione do globals.css, tutaj zostawiamy tylko niezbędne nadpisania jeśli potrzebne
export const globalStyles = `
  /* Usunięto twarde nadpisania kolorów, aby używać zmiennych z globals.css */
  .modal {
    background-color: hsl(var(--card));
    border-color: hsl(var(--border));
  }

  button {
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* Zapobieganie zoomowaniu na iOS */
  @media (max-width: 768px) {
    input, select, textarea {
      font-size: 16px !important;
    }
  }
`; 

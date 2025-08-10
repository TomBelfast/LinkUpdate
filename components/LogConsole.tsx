'use client';

import React, { useState, useEffect } from 'react';

interface LogDetails {
  element?: string;
  classes?: string;
  id?: string;
  text?: string;
  x?: number;
  y?: number;
  path?: string;
  formId?: string;
  formAction?: string;
  formElements?: Array<{
    type: string;
    id: string;
    name: string;
  }>;
}

interface Log {
  timestamp: string;
  message: string;
  type: 'info' | 'error' | 'success' | 'click' | 'hover' | 'form';
  details?: LogDetails;
}

export default function LogConsole() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [filter, setFilter] = useState<Log['type'] | 'all'>('all');
  const [copySuccess, setCopySuccess] = useState(false);

  // Funkcja do dodawania logów
  const addLog = (message: string, type: Log['type'] = 'info', details?: LogDetails) => {
    setLogs(prev => [
      {
        timestamp: new Date().toLocaleTimeString(),
        message,
        type,
        details
      },
      ...prev.slice(0, 99) // Zachowaj maksymalnie 100 ostatnich logów
    ]);
  };

  // Expose addLog function globally
  useEffect(() => {
    (window as Window & typeof globalThis & { addLog: typeof addLog }).addLog = addLog;

    // Dodaj globalny listener na kliknięcia
    const clickHandler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const elementType = target.tagName.toLowerCase();
      const elementClasses = target.className;
      const elementId = target.id;
      const elementText = target.textContent?.slice(0, 50);

      addLog(
        `Kliknięcie w element: ${elementType}`,
        'click',
        {
          element: elementType,
          classes: elementClasses,
          id: elementId,
          text: elementText,
          x: e.clientX,
          y: e.clientY,
          path: getElementPath(target)
        }
      );
    };

    // Dodaj globalny listener na formularze
    const formHandler = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target instanceof HTMLFormElement) {
        addLog(
          'Wysłanie formularza',
          'form',
          {
            formId: target.id,
            formAction: target.action,
            formElements: Array.from(target.elements).map(el => ({
              type: (el as HTMLElement).tagName,
              id: (el as HTMLElement).id,
              name: (el as HTMLInputElement).name
            }))
          }
        );
      }
    };

    document.addEventListener('click', clickHandler);
    document.addEventListener('submit', formHandler);

    return () => {
      document.removeEventListener('click', clickHandler);
      document.removeEventListener('submit', formHandler);
    };
  }, []);

  // Funkcja pomocnicza do generowania ścieżki elementu
  const getElementPath = (element: HTMLElement): string => {
    const path: string[] = [];
    let currentElement: HTMLElement | null = element;
    
    while (currentElement && currentElement !== document.body) {
      let selector = currentElement.tagName.toLowerCase();
      
      if (currentElement.id) {
        selector += `#${currentElement.id}`;
      } else if (currentElement.className && typeof currentElement.className === 'string') {
        selector += `.${currentElement.className.split(' ').join('.')}`;
      }
      
      path.unshift(selector);
      currentElement = currentElement.parentElement;
    }
    
    return path.join(' > ');
  };

  const filteredLogs = filter === 'all' 
    ? logs 
    : logs.filter(log => log.type === filter);

  const getTypeColor = (type: Log['type']) => {
    switch(type) {
      case 'error': return 'text-red-400';
      case 'success': return 'text-green-400';
      case 'click': return 'text-blue-400';
      case 'hover': return 'text-purple-400';
      case 'form': return 'text-yellow-400';
      default: return 'text-gray-300';
    }
  };

  const copyLogs = async () => {
    try {
      const logsText = filteredLogs.map(log => {
        const detailsText = log.details ? `\n  Details: ${JSON.stringify(log.details, null, 2)}` : '';
        return `[${log.timestamp}] ${log.type.toUpperCase()}: ${log.message}${detailsText}`;
      }).join('\n\n');

      await navigator.clipboard.writeText(logsText);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
      addLog('Logi skopiowane do schowka', 'success');
    } catch {
      addLog('Błąd podczas kopiowania logów', 'error');
    }
  };

  const exportLogs = () => {
    const logsText = filteredLogs.map(log => {
      const detailsText = log.details ? `\n  Details: ${JSON.stringify(log.details, null, 2)}` : '';
      return `[${log.timestamp}] ${log.type.toUpperCase()}: ${log.message}${detailsText}`;
    }).join('\n\n');

    const blob = new Blob([logsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addLog('Logi wyeksportowane do pliku', 'success');
  };

  return (
    <div 
      className="fixed bottom-0 right-0 w-96 bg-gray-900 text-white z-50"
      role="region"
      aria-label="Debug Console"
    >
      <div 
        className="p-2 bg-gray-800 cursor-pointer flex justify-between items-center"
        onClick={() => setIsExpanded(!isExpanded)}
        role="button"
        aria-expanded={isExpanded ? true : false}
        aria-controls="console-content"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsExpanded(!isExpanded);
          }
        }}
      >
        <div className="flex items-center space-x-2">
          <span id="console-title">Console Logs ({logs.length})</span>
          <select 
            className="bg-gray-700 text-sm rounded px-1"
            value={filter}
            onChange={(e) => setFilter(e.target.value as Log['type'] | 'all')}
            onClick={(e) => e.stopPropagation()}
            aria-label="Filter log types"
          >
            <option value="all">Wszystkie</option>
            <option value="info">Info</option>
            <option value="error">Błędy</option>
            <option value="success">Sukces</option>
            <option value="click">Kliknięcia</option>
            <option value="form">Formularze</option>
          </select>
        </div>
        <div className="flex space-x-2">
          <button 
            className={`text-sm px-2 py-1 rounded ${
              copySuccess ? 'bg-green-500' : 'bg-gray-700 hover:bg-gray-600'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              copyLogs();
            }}
            aria-label="Kopiuj logi do schowka"
          >
            {copySuccess ? 'Skopiowano!' : 'Kopiuj'}
          </button>
          <button 
            className="text-sm px-2 py-1 rounded bg-gray-700 hover:bg-gray-600"
            onClick={(e) => {
              e.stopPropagation();
              exportLogs();
            }}
            aria-label="Eksportuj logi do pliku"
          >
            Eksportuj
          </button>
          <button 
            className="text-gray-400 hover:text-white text-sm px-2 py-1"
            onClick={(e) => {
              e.stopPropagation();
              setLogs([]);
              addLog('Wyczyszczono logi', 'info');
            }}
            aria-label="Wyczyść wszystkie logi"
          >
            Wyczyść
          </button>
        </div>
      </div>
      {isExpanded && (
        <div 
          id="console-content"
          className="h-96 overflow-y-auto p-2 text-sm font-mono"
          role="log"
          aria-live="polite"
          aria-labelledby="console-title"
        >
          <div role="list">
            {filteredLogs.map((log, index) => (
              <div 
                key={index} 
                className="mb-2 border-b border-gray-800 pb-1"
                role="listitem"
              >
                <div className={`${getTypeColor(log.type)}`}>
                  <span className="text-gray-500">[{log.timestamp}]</span>{' '}
                  <span className="font-bold">{log.type.toUpperCase()}</span>{' '}
                  {log.message}
                </div>
                {log.details && (
                  <pre className="text-xs text-gray-400 mt-1 overflow-x-auto">
                    {JSON.stringify(log.details, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

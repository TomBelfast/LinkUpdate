import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
}

interface TodoListProps {
  todos: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TodoList({ todos, onToggle, onDelete }: TodoListProps) {
  if (todos.length === 0) {
    return (
      <Card className="p-6 text-center text-gray-500 dark:text-gray-400">
        Brak zadań do wyświetlenia
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {todos.map((todo) => (
        <Card key={todo.id} className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => onToggle(todo.id)}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <h3 className={`text-lg font-medium ${todo.completed ? 'line-through text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                  {todo.title}
                </h3>
                <Badge variant={todo.completed ? "secondary" : "default"}>
                  {todo.completed ? "Ukończone" : "W trakcie"}
                </Badge>
              </div>
              {todo.description && (
                <p className={`mt-2 text-sm ${todo.completed ? 'text-gray-400' : 'text-gray-500 dark:text-gray-300'}`}>
                  {todo.description}
                </p>
              )}
            </div>
            <button
              onClick={() => onDelete(todo.id)}
              className="ml-4 text-gray-400 hover:text-red-500 focus:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </Card>
      ))}
    </div>
  );
} 
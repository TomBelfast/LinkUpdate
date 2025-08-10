'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Todo {
  id: string;
  title: string;
  description: string;
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
}

interface TodoListProps {
  todos: Todo[];
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, newStatus: 'DRAFT' | 'ACTIVE' | 'ARCHIVED') => void;
}

export const TodoList: React.FC<TodoListProps> = ({ todos, onDelete, onUpdateStatus }) => {
  const getStatusColor = (status: Todo['status']) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-yellow-500';
      case 'ACTIVE':
        return 'bg-green-500';
      case 'ARCHIVED':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: Todo['status']) => {
    switch (status) {
      case 'DRAFT':
        return 'Szkic';
      case 'ACTIVE':
        return 'Aktywny';
      case 'ARCHIVED':
        return 'Zarchiwizowany';
      default:
        return status;
    }
  };

  const getNextStatus = (currentStatus: Todo['status']): Todo['status'] => {
    switch (currentStatus) {
      case 'DRAFT':
        return 'ACTIVE';
      case 'ACTIVE':
        return 'ARCHIVED';
      case 'ARCHIVED':
        return 'DRAFT';
      default:
        return 'DRAFT';
    }
  };

  if (todos.length === 0) {
    return (
      <Card className="p-6 text-center text-gray-500">
        Brak pomysłów do wyświetlenia
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {todos.map((todo) => (
        <Card key={todo.id} className="p-6">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">{todo.title}</h3>
              <p className="text-gray-600">{todo.description}</p>
              <Badge className={getStatusColor(todo.status)}>
                {getStatusLabel(todo.status)}
              </Badge>
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                onClick={() => onUpdateStatus(todo.id, getNextStatus(todo.status))}
              >
                Zmień status
              </Button>
              <Button
                variant="destructive"
                onClick={() => onDelete(todo.id)}
              >
                Usuń
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

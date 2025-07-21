import React, { useState, useRef } from "react";
import { useMemo } from "react";
import TaskTag from "./TaskTag";
import TagButtonFavorite from "./ui/TagButtonFavorite";
import { Lightbulb, Plus, Star, X } from "lucide-react";
import { useLebenslauf } from "./LebenslaufContext";
import { getTasksForPositions } from "../constants/positionsToTasks";
import "../styles/_tags.scss";

interface TasksTagInputProps {
  value: string[];
  onChange: (tasks: string[]) => void;
  aiSuggestions?: string[];
  positionen?: string[];
  suggestions?: string[];
}

export default function TasksTagInput({ 
  value, 
  onChange, 
  aiSuggestions = [], 
  positionen = [], 
  suggestions = [] 
}: TasksTagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const { favoriteTasks: favorites, toggleFavoriteTask } = useLebenslauf();
  const [isInputFocused, setIsInputFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Kombiniere Vorschläge aus Positionen und externen Vorschlägen
  const allSuggestions = useMemo(() => {
    const combined = [...suggestions];
    if (positionen && positionen.length > 0) {
      const positionTasks = getTasksForPositions(positionen);
      combined.push(...positionTasks);
    }
    return Array.from(new Set(combined));
  }, [positionen, suggestions]);

  const addTask = (task?: string) => {
    const t = (task ?? inputValue).trim();
    if (!t || value.includes(t)) return;
    onChange([...value, t]);
    setInputValue("");
  };

  const removeTask = (task: string) => {
    onChange(value.filter((t) => t !== task));
  };

  const updateTask = (oldTask: string, newTask: string) => {
    const newTasks = value.map((t) => (t === oldTask ? newTask : t));
    onChange(newTasks);
  };

  const toggleFavorite = (task: string) => {
    toggleFavoriteTask(task);
  };

  const handleAddFavoriteInput = (val: string) => {
    const toAdd = val.trim();
    if (!toAdd) return;
    toggleFavorite(toAdd);
    setInputValue("");
  };

  return (
    <div className="space-y-4">

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
            {value.map((task, index) => (
              <TaskTag
                key={`${task}-${index}`}
                label={task}
                onRemove={() => removeTask(task)}
                onEdit={(newTask) => updateTask(task, newTask)}
              />
            ))}
          </div>
      )}

      <div className="flex items-center w-full space-x-2">
        <div className="relative flex-1">
          <input
            type="text"
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTask()}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setTimeout(() => setIsInputFocused(false), 200)}
            placeholder="Hinzufügen..."
            className={`w-full px-3 h-10 border rounded-md transition-all focus:outline-none focus:ring-1 pr-10 border-gray-300`}
            style={{
              '--tw-ring-color': '#F29400',
              borderColor: inputValue.trim() && !isInputFocused ? '#F29400' : '#D1D5DB'
            } as React.CSSProperties}
          />
          {inputValue.trim() && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setInputValue('');
                inputRef.current?.focus();
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-300"
              aria-label="Textfeld leeren"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        {isInputFocused && (
          <div className="flex-shrink-0 flex space-x-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                addTask(inputValue);
              }}
              className="w-10 h-10 bg-[#F6A800] hover:bg-[#F29400] text-white rounded-md flex items-center justify-center transition-colors duration-200"
            >
              <Plus className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                handleAddFavoriteInput(inputValue);
              }}
              className="w-10 h-10 bg-[#F6A800] hover:bg-[#F29400] text-white rounded-md flex items-center justify-center transition-colors duration-200"
            >
              <Star className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
      
      {/* KI-Vorschläge basierend auf Positionen */}
      {aiSuggestions && aiSuggestions.filter(s => !value.includes(s)).length > 0 && (
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Lightbulb className="h-4 w-4 text-gray-500" />
            <h4 className="text-sm font-medium text-gray-700">KI-Vorschläge:</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {aiSuggestions
              .filter(s => !value.includes(s))
              .map(suggestion => (
                <button
                  key={suggestion}
                  onClick={() => addTask(suggestion)}
                  className="inline-flex items-center bg-[#F8F8F8] text-gray-600 text-sm rounded-full border-2 border-[#ffdea2] hover:bg-gray-100 transition-colors duration-200"
                  style={{ padding: '0.125rem 0.375rem' }}
                >
                  <span>{suggestion}</span>
                </button>
              ))}
          </div>
        </div>
      )}


      {favorites && favorites.filter((f) => !value.includes(f)).length > 0 && (
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#9CA3AF"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon
                points="12 2 15 8.5 22 9.3 17 14 18.2 21 12 17.8 5.8 21 7 14 2 9.3 9 8.5 12 2"
                fill="none"
              />
            </svg>
            <h4 className="text-sm font-medium text-gray-700">Favoriten:</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {favorites
              .filter((item) => !value.includes(item) && !aiSuggestions.includes(item))
              .map((item) => (
                <TagButtonFavorite
                  key={item}
                  label={item}
                  onClick={() => addTask(item)}
                  onRemove={() => toggleFavorite(item)}
                />
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
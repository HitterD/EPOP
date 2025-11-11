import React, { useState, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RecipientInputProps, MailRecipient } from '@/types/mail';

export function RecipientInput({
  value,
  onChange,
  suggestions,
  onSearch,
  placeholder = 'Add recipients...',
  label = 'To',
}: RecipientInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setInputValue(query);
    onSearch(query);
    setShowSuggestions(query.length > 0);
  };

  const handleAddRecipient = (recipient: MailRecipient) => {
    onChange([...value, recipient]);
    setInputValue('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleRemoveRecipient = (email: string) => {
    onChange(value.filter((r) => r.email !== email));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      handleRemoveRecipient(value[value.length - 1].email);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const filteredSuggestions = suggestions.filter(
    (s) =>
      !value.find((v) => v.email === s.email) &&
      (s.name.toLowerCase().includes(inputValue.toLowerCase()) ||
        s.email.toLowerCase().includes(inputValue.toLowerCase()))
  );

  return (
    <div className="relative">
      <label className="text-sm font-medium mb-2 block">{label}:</label>
      
      <div
        className={cn(
          'flex flex-wrap items-center gap-2 p-2 border rounded-md',
          'focus-within:ring-2 focus-within:ring-primary'
        )}
        role="combobox"
        aria-expanded={showSuggestions}
        aria-haspopup="listbox"
        aria-controls="recipient-suggestions"
        aria-label={`${label} recipients`}
      >
        {value.map((recipient) => (
          <Badge
            key={recipient.email}
            variant="secondary"
            className="gap-1 pr-1"
          >
            <span>{recipient.name}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 hover:bg-transparent"
              onClick={() => handleRemoveRecipient(recipient.email)}
              aria-label={`Remove ${recipient.name}`}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}

        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => inputValue && setShowSuggestions(true)}
          placeholder={value.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] border-0 p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
          aria-autocomplete="list"
        />
      </div>

      {showSuggestions && filteredSuggestions.length > 0 && (
        <div
          id="recipient-suggestions"
          role="listbox"
          className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-60 overflow-y-auto"
        >
          {filteredSuggestions.map((suggestion) => (
            <button
              key={suggestion.email}
              role="option"
              className="w-full px-3 py-2 text-left hover:bg-accent transition-colors flex items-center gap-2"
              onClick={() => handleAddRecipient(suggestion)}
            >
              <div className="flex-1">
                <div className="font-medium text-sm">{suggestion.name}</div>
                <div className="text-xs text-muted-foreground">{suggestion.email}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

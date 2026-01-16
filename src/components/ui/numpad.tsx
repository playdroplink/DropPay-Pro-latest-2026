import { Button } from '@/components/ui/button';
import { Delete } from 'lucide-react';

interface NumpadProps {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  allowDecimal?: boolean;
}

export function Numpad({ value, onChange, maxLength = 10, allowDecimal = true }: NumpadProps) {
  const handleNumberClick = (num: string) => {
    if (value.length >= maxLength) return;
    onChange(value + num);
  };

  const handleDecimalClick = () => {
    if (!allowDecimal || value.includes('.')) return;
    if (value === '') {
      onChange('0.');
    } else {
      onChange(value + '.');
    }
  };

  const handleDelete = () => {
    onChange(value.slice(0, -1));
  };

  const numbers = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['.', '0', 'del'],
  ];

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="grid grid-cols-3 gap-3">
        {numbers.map((row, rowIndex) => (
          row.map((item, colIndex) => {
            if (item === 'del') {
              return (
                <Button
                  key={`${rowIndex}-${colIndex}`}
                  variant="outline"
                  size="lg"
                  className="h-16 text-xl font-semibold"
                  onClick={handleDelete}
                  disabled={value === ''}
                >
                  <Delete className="w-5 h-5" />
                </Button>
              );
            }
            if (item === '.') {
              return (
                <Button
                  key={`${rowIndex}-${colIndex}`}
                  variant="outline"
                  size="lg"
                  className="h-16 text-2xl font-semibold"
                  onClick={handleDecimalClick}
                  disabled={!allowDecimal || value.includes('.')}
                >
                  {item}
                </Button>
              );
            }
            return (
              <Button
                key={`${rowIndex}-${colIndex}`}
                variant="outline"
                size="lg"
                className="h-16 text-2xl font-semibold"
                onClick={() => handleNumberClick(item)}
              >
                {item}
              </Button>
            );
          })
        ))}
      </div>
    </div>
  );
}

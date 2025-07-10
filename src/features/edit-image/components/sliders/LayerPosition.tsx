import { Input } from '@mui/material';

export default function LayerPosition({
  label,
  position,
  onChange,
}: {
  label: string;
  position: number;
  onChange?: (value: number) => void;
}) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = Number(e.target.value);
    if (!isNaN(rawValue)) {
      onChange?.(rawValue);
    }
  };
  return (
    <div className="flex w-1/2 items-center space-x-2">
      <p>{label}:</p>
      <Input
        type="number"
        inputMode="numeric"
        className="w-16 p-2 text-right text-sm"
        value={position}
        onChange={handleInputChange}
        style={{ direction: 'ltr' }}
      />
    </div>
  );
}

import { Input } from "@mui/material";

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
    <div className="flex items-center space-x-2 w-1/2">
      <p>{label}:</p>
      <Input
        type="number"
        inputMode="numeric"
        className="py-2 pl-2 w-full text-sm text-right"
        value={position}
        onChange={handleInputChange}
        style={{ direction: "ltr" }}
      />
    </div>
  );
}

import { Select, MenuItem, FormControl } from "@mui/material";

const fonts = [
  { value: "Arial", label: "Arial" },
  { value: "Comic Sans MS", label: "Comic Sans" },
  { value: "'Caveat', cursive", label: "Caveat" },
  { value: "Courier New", label: "Courier New" },
  { value: "'Dancing Script', cursive", label: "Dancing Script" },
  { value: "'DM Serif Text', serif", label: "DM Serif Text" },
  { value: "'EB Garamond', serif", label: "EB Garamond" },
  { value: "Georgia", label: "Georgia" },
  { value: "Helvetica", label: "Helvetica" },
  { value: "'Montserrat', sans-serif", label: "Montserrat" },
  { value: "'Permanent Marker', cursive", label: "Permanent Marker" },
  { value: "'Press Start 2P', system-ui", label: "Press Start 2P" },
  { value: "'Roboto', sans-serif", label: "Roboto" },
  { value: "Times New Roman", label: "Times New Roman" },
  { value: "Verdana", label: "Verdana" },
];


interface FontSelectorProps {
  selectedLayer?: { fontFamily?: string };
  handleChangeFontFamily: (fontFamily: string) => void;
}

export default function FontSelector({ selectedLayer, handleChangeFontFamily }: FontSelectorProps) {
  const selectedFont = selectedLayer?.fontFamily || "Arial";

  return (
    <div className="flex flex-col space-y-2 w-full">
      <p className="font-medium">Font</p>
      <FormControl fullWidth variant="outlined" size="small">
        <Select
          labelId="font-family-label"
          id="font-family"
          value={selectedFont}
          onChange={(e) => handleChangeFontFamily(e.target.value)}
          renderValue={(selected) => {
            const font = fonts.find(f => f.value === selected);
            return (
              <span style={{ fontFamily: `${font?.value}` }}>
                {font?.label || selected}
              </span>
            );
          }}
          MenuProps={{
            PaperProps: {
              className: 'custom-scrollbar',
              style: {
                maxHeight: 300,
                overflowY: 'auto',
              },
            },
          }}
        >
          {
            fonts.map(({ value, label }) => (
              <MenuItem key={value} value={value} sx={{ fontFamily: value }}>
                {label}
              </MenuItem>
            ))
          }
        </Select>
      </FormControl>
    </div >
  );
}

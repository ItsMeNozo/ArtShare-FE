// This component wraps the entire app with the appropriate MUI theme (light or dark)
// based on the current theme value from the custom ThemeProvider context.
//  theme styler — it feeds the current theme into MUI’s design system.
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import { lightTheme, darkTheme } from "@/styles";
import { useTheme } from "@/context/ThemeProvider";

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();

  return (
    <MuiThemeProvider theme={theme === "dark" ? darkTheme : lightTheme}>
      {children}
    </MuiThemeProvider>
  );
}

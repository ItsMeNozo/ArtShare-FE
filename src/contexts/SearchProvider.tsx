import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from 'react';

// Define the shape of the context
interface GlobalSearchContextType {
  query: string;
  setQuery: Dispatch<SetStateAction<string>>;
}

// Create the context with default values
export const GlobalSearchContext = createContext<GlobalSearchContextType>({
  query: '',
  setQuery: () => {},
});

// Create a provider component
export const GlobalSearchProvider = ({ children }: { children: ReactNode }) => {
  const [query, setQuery] = useState<string>('');

  return (
    <GlobalSearchContext.Provider value={{ query, setQuery }}>
      {children}
    </GlobalSearchContext.Provider>
  );
};

// Optional: Custom hook for easier usage
export const useSearch = () => useContext(GlobalSearchContext);

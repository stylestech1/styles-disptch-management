import { useState, useCallback, useRef } from "react";

interface UseSearchSubmitProps {
  onSearch?: (searchTerm: string) => void;
  onReset?: () => void;
  initialValue?: string;
  disableInitialSearch?: boolean;
}

export const useSearchSubmit = ({
  onSearch,
  onReset,
  initialValue = "",
  disableInitialSearch = true,
}: UseSearchSubmitProps = {}) => {
  const [searchInput, setSearchInput] = useState(initialValue);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false); 
  const isInitialMount = useRef(true);
  const hasSearched = useRef(false);

  const handleSearchSubmit = useCallback(
    (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault();
      }

      const trimmedSearch = searchInput.trim();
      if (!trimmedSearch) {
        setSearchTerm("");
        setIsSearchActive(false); 
        if (onReset && hasSearched.current) {
          onReset();
        }
        hasSearched.current = false;
        return;
      }
      setSearchTerm(trimmedSearch);
      setIsSearchActive(true); 
      hasSearched.current = true;

      if (onSearch) {
        onSearch(trimmedSearch);
      }
    },
    [searchInput, onSearch, onReset]
  );

  const handleSearchReset = useCallback(() => {
    setSearchInput("");
    setSearchTerm("");
    setIsSearchActive(false); 
    hasSearched.current = false;

    if (onReset) {
      onReset();
    }
  }, [onReset]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSearchSubmit();
      }
    },
    [handleSearchSubmit]
  );

  const updateSearchInput = useCallback(
    (value: string) => {
      setSearchInput(value);
      if (value.trim() === "" && hasSearched.current) {
        handleSearchReset();
      }
    },
    [handleSearchReset]
  );

  // Reset the initial mount flag after first render
  if (isInitialMount.current) {
    isInitialMount.current = false;
  }

  const isSearching = searchTerm.trim() !== "" && isSearchActive;

  return {
    // States
    searchInput,
    searchTerm,
    isSearching,

    // Setters
    setSearchInput: updateSearchInput,
    setSearchTerm,

    // Handlers
    handleSearchSubmit,
    handleSearchReset,
    handleKeyPress,
  };
};

export type UseSearchSubmitReturn = ReturnType<typeof useSearchSubmit>;

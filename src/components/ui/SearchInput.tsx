import React from 'react';
import {
  TextField,
  InputAdornment,
  IconButton,
  Box,
  SxProps,
} from '@mui/material';
import { IoSearch, IoClose } from 'react-icons/io5';
import { UseSearchSubmitReturn } from '@/hook/useSearchSubmit';

interface SearchInputProps {
  searchHook: UseSearchSubmitReturn;
  placeholder?: string;
  fullWidth?: boolean;
  showClearButton?: boolean;
  sx?: SxProps;
  inputSx?: SxProps;
}

const SearchInput: React.FC<SearchInputProps> = ({
  searchHook,
  placeholder = "Search...",
  fullWidth = true,
  showClearButton = true,
  sx = {},
  inputSx = {},
}) => {
  const {
    searchInput,
    setSearchInput,
    handleSearchSubmit,
    handleSearchReset,
    handleKeyPress,
    isSearching,
  } = searchHook;

  const handleClear = () => {
    setSearchInput('');
    handleSearchReset();
  };

   const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault(); 
    handleSearchSubmit();
  };

  return (
    <Box 
      component="form"
      onSubmit={handleFormSubmit}
      sx={{ 
        width: fullWidth ? '100%' : 'auto',
        ...sx 
      }}
    >
      <TextField
        fullWidth={fullWidth}
        variant="outlined"
        placeholder={placeholder}
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        onKeyPress={handleKeyPress}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <IconButton
                  type="submit"
                  size="small"
                  sx={{ 
                    color: 'text.secondary',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  <IoSearch size={20} />
                </IconButton>
              </InputAdornment>
            ),
            endAdornment: showClearButton && (searchInput || isSearching) ? (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={handleClear}
                  sx={{ 
                    color: 'text.secondary',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                      color: 'error.main',
                    },
                  }}
                >
                  <IoClose size={20} />
                </IconButton>
              </InputAdornment>
            ) : undefined,
          },
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            backgroundColor: 'background.paper',
            '& fieldset': { 
              borderColor: 'divider',
              borderWidth: 1,
            },
            '&:hover fieldset': {
              borderColor: 'primary.main',
            },
            '&.Mui-focused fieldset': {
              borderColor: 'primary.main',
              borderWidth: 2,
            },
          },
          '& input': {
            color: 'text.primary',
            py: 1.5,
            '&::placeholder': {
              color: 'text.secondary',
              opacity: 0.7,
            },
          },
          ...inputSx,
        }}
      />
    </Box>
  );
};

export default SearchInput;
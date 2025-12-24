import { Box, SxProps, Theme } from "@mui/material";

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  status?: 'online' | 'offline' | 'away';
  style?: SxProps<Theme>;
}

export const Avatar = ({ name, size = 'md', status, style }: AvatarProps) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };
  
  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    away: 'bg-yellow-500'
  };
  
  const initials = name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  
  return (
    <div className="relative inline-block">
      <Box
        className={`
          ${sizeClasses[size]}
          rounded-full
          flex items-center justify-center font-semibold
        `}
        sx={style}
      >
        {initials}
      </Box>
      
      {status && (
        <span
          className={`
            absolute bottom-0 right-0 block w-3 h-3 rounded-full border-2 border-white
            ${statusColors[status]}
          `}
        />
      )}
    </div>
  );
};
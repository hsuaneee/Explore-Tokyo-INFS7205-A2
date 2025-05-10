import React from 'react';
import { Box, Typography } from '@mui/material';

const Header: React.FC = () => {
  return (
    <Box
      sx={{
        p: 3,
        bgcolor: 'var(--pastel-pink)',
        color: 'var(--main-text)',
        boxShadow: '0 4px 16px rgba(248, 180, 194, 0.15)',
        borderRadius: '0 0 32px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mb: 2,
        borderBottom: '4px solid var(--pastel-border)',
        zIndex: 10,
      }}
    >
      <Typography
        variant="h3"
        component="h1"
        sx={{
          fontWeight: '800',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          letterSpacing: 2,
          textShadow: '2px 2px 4px rgba(248,180,194,0.15)'
        }}
      >
        Explore Tokyo
        <span role="img" aria-label="cherry blossom">🌸</span>
        <span role="img" aria-label="shrine">⛩️</span>
      </Typography>
    </Box>
  );
};

export default Header; 
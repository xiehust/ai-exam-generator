import React from 'react';
import { Box, Typography, Paper, Button, useTheme, LinearProgress } from '@mui/material';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../translations';

interface ResultDisplayProps {
  examResult: string | null;
  examLink: string | null;
  isLoading: boolean;
  progress: number;
  statusMessage: string;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ examResult, examLink, isLoading, progress, statusMessage }) => {
  const { language } = useLanguage();
  const t = translations[language];
  const theme = useTheme();

  return (
    <Box mt={4}>
      {isLoading && (
        <Box mb={2}>
          <Typography variant="h6" gutterBottom>
            {t.generatingExam}
          </Typography>
          <LinearProgress variant="determinate" value={progress} />
          <Typography variant="body2" color="textSecondary" mt={1}>
            {statusMessage}
          </Typography>
        </Box>
      )}
      {examResult && (
        <>
          <Typography variant="h6" gutterBottom>
            {t.examGenerated}
          </Typography>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 2, 
              mt: 2, 
              backgroundColor: theme.palette.mode === 'dark' ? '#333' : '#f0f0f0',
              color: theme.palette.text.primary,
              maxHeight: '400px', 
              overflow: 'auto' 
            }}
          >
            <Typography variant="body1" component="pre" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {examResult}
            </Typography>
          </Paper>
        </>
      )}
      {examLink && (
        <Box mt={2}>
          <Button
            variant="contained"
            color="primary"
            href={examLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t.viewExam}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default ResultDisplay;

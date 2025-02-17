import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme, CssBaseline, Container, Paper, Typography, Box, TextField, Button, AppBar, Toolbar, IconButton, Menu, MenuItem, Alert, Snackbar, Switch } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import ExamForm from './components/ExamForm';
import ResultDisplay from './components/ResultDisplay';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { translations } from './translations';

const AppContent: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const t = translations[language];
  const [examResult, setExamResult] = useState<string | null>(null);
  const [examLink, setExamLink] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string>('');
  const [apiEndpoint, setApiEndpoint] = useState<string>('/v1/workflows/run');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#dc004e',
      },
    },
  });

  useEffect(() => {
    const savedApiKey = localStorage.getItem('apiKey');
    const savedApiEndpoint = localStorage.getItem('apiEndpoint');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
    if (savedApiEndpoint) {
      setApiEndpoint(savedApiEndpoint);
    }
  }, []);

  const processSSEData = (buffer: string): { completeData: string[], remainingBuffer: string } => {
    const lines = buffer.split('\n');
    const completeData: string[] = [];
    let remainingBuffer = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      if (line.startsWith('data: ')) {
        try {
          const jsonStr = line.slice(6);
          JSON.parse(jsonStr); // Test if it's valid JSON
          completeData.push(jsonStr);
        } catch (e) {
          // If this is the last line and it's incomplete, add it to the buffer
          if (i === lines.length - 1) {
            remainingBuffer = line;
          }
          // Otherwise, it's a corrupted message that we'll skip
        }
      }
    }

    return { completeData, remainingBuffer };
  };

  const handleSubmit = async (params: any) => {
    setIsLoading(true);
    setExamResult(null);
    setExamLink(null);
    setError(null);
    setProgress(0);
    setStatusMessage(t.startingExamGeneration);

    const body = JSON.stringify({
      inputs: {
        reference: params.examReference,
        grade: params.grade,
        subject: params.subject,
        count: params.numberOfQuestions,
        types: params.questionTypes.join(','),
        topics: params.topics,
        difficulty: params.difficulty,
        teacher_notes: params.teacherNotes,
        comments: params.teacherNotes,
      },
      response_mode: "streaming",
      user: "abc-123"
    });

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + apiKey,
          'Content-Type': 'application/json',
        },
        body: body,
      });

      if (!response.ok) {
        throw new Error('Failed to start exam generation');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to read response');
      }

      let examContent = '';
      let dataBuffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        dataBuffer += chunk;

        const { completeData, remainingBuffer } = processSSEData(dataBuffer);
        dataBuffer = remainingBuffer;

        for (const jsonStr of completeData) {
          try {
            const data = JSON.parse(jsonStr);
            
            if (data.event === 'workflow_finished') {
              setIsLoading(false);
              setProgress(100);
              setStatusMessage(t.examGenerationComplete);
              if (data.data && data.data.outputs && data.data.outputs.body) {
                const bodyData = JSON.parse(data.data.outputs.body);
                if (bodyData.message) {
                  const linkMatch = bodyData.message.match(/http:\/\/.*$/);
                  if (linkMatch) {
                    setExamLink(linkMatch[0]);
                  }
                }
              }
            } else if (data.event === 'node_finished' && data.data.node_type === 'llm') {
              if (data.data.outputs && data.data.outputs.text) {
                examContent = data.data.outputs.text;
                setExamResult(examContent);
                setProgress((prevProgress) => Math.min(prevProgress + 20, 90));
                setStatusMessage(t.generatingQuestions);
              }
            } else if (data.event === 'node_started') {
              setProgress((prevProgress) => Math.min(prevProgress + 10, 90));
              setStatusMessage(t.processingExamData);
            }
          } catch (error) {
            console.error('Error parsing JSON:', error, 'Data:', jsonStr);
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setIsLoading(false);
      setError('Failed to generate exam. Please try again.');
      setProgress(0);
      setStatusMessage('');
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'zh' : 'en');
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleApiKeySave = () => {
    localStorage.setItem('apiKey', apiKey);
    handleClose();
  };

  const handleApiEndpointSave = () => {
    localStorage.setItem('apiEndpoint', apiEndpoint);
    handleClose();
  };

  const handleErrorClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setError(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {t.title}
          </Typography>
          <IconButton color="inherit" onClick={toggleDarkMode}>
            {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
          <Button color="inherit" onClick={toggleLanguage}>
            {language === 'en' ? '中文' : 'English'}
          </Button>
          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenu}
            color="inherit"
          >
            <SettingsIcon />
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem>
              <TextField
                label={t.apiKey}
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                size="small"
              />
            </MenuItem>
            <MenuItem onClick={handleApiKeySave}>{t.saveApiKey}</MenuItem>
            <MenuItem>
              <TextField
                label={t.apiEndpoint}
                value={apiEndpoint}
                onChange={(e) => setApiEndpoint(e.target.value)}
                size="small"
              />
            </MenuItem>
            <MenuItem onClick={handleApiEndpointSave}>{t.saveApiEndpoint}</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <ExamForm onSubmit={handleSubmit} isLoading={isLoading} language={language} />
          <ResultDisplay 
            examResult={examResult} 
            examLink={examLink} 
            isLoading={isLoading}
            progress={progress}
            statusMessage={statusMessage}
          />
        </Paper>
      </Container>
      <Snackbar open={!!error} autoHideDuration={6000} onClose={handleErrorClose}>
        <Alert onClose={handleErrorClose} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
};

const App: React.FC = () => (
  <LanguageProvider>
    <AppContent />
  </LanguageProvider>
);

export default App;

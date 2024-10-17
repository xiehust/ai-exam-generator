import React, { useState } from 'react';
import { TextField, Checkbox, FormControlLabel, FormGroup, Button, Grid, Typography, Box, MenuItem, Slider, Radio, RadioGroup } from '@mui/material';
import { useLanguage } from '../contexts/LanguageContext';
import { translations, Language } from '../translations';
import { gradeOptions, subjectOptions } from '../dropdownOptions';

interface ExamParams {
  grade: string;
  subject: string;
  questionTypes: string[];
  numberOfQuestions: number;
  difficulty: string;
  topics: string;
  examReference: string;
  teacherNotes: string;
}

interface ExamFormProps {
  onSubmit: (params: ExamParams) => void;
  isLoading: boolean;
  language: Language;
}

const ExamForm: React.FC<ExamFormProps> = ({ onSubmit, isLoading, language }) => {
  const t = translations[language];

  const [params, setParams] = useState<ExamParams>({
    grade: '',
    subject: '',
    questionTypes: [],
    numberOfQuestions: 5,
    difficulty: 'medium',
    topics: '',
    examReference: '',
    teacherNotes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setParams(prev => ({
        ...prev,
        questionTypes: checked
          ? [...prev.questionTypes, value]
          : prev.questionTypes.filter(t => t !== value),
      }));
    } else {
      setParams(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSliderChange = (event: Event, newValue: number | number[]) => {
    setParams(prev => ({ ...prev, numberOfQuestions: newValue as number }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(params);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            select
            fullWidth
            label={t.grade}
            name="grade"
            value={params.grade}
            onChange={handleChange}
            required
          >
            {gradeOptions.map((option) => (
              <MenuItem key={option.en} value={option.en}>
                {language === 'en' ? option.en : `${option.en} (${option.zh})`}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            select
            fullWidth
            label={t.subject}
            name="subject"
            value={params.subject}
            onChange={handleChange}
            required
          >
            {subjectOptions.map((option) => (
              <MenuItem key={option.en} value={option.en}>
                {language === 'en' ? option.en : option.zh}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            {t.questionTypes}
          </Typography>
          <FormGroup row>
            {[
              { value: 'singleChoice', label: t.singleChoice },
              { value: 'multipleChoice', label: t.multipleChoice },
              { value: 'fillInTheBlank', label: t.fillInTheBlank },
            ].map(type => (
              <FormControlLabel
                key={type.value}
                control={
                  <Checkbox
                    checked={params.questionTypes.includes(type.value)}
                    onChange={handleChange}
                    name="questionTypes"
                    value={type.value}
                  />
                }
                label={type.label}
              />
            ))}
          </FormGroup>
        </Grid>
        <Grid item xs={12}>
          <Typography gutterBottom>
            {t.numberOfQuestions}: {params.numberOfQuestions}
          </Typography>
          <Slider
            value={params.numberOfQuestions}
            onChange={handleSliderChange}
            aria-labelledby="number-of-questions-slider"
            valueLabelDisplay="auto"
            step={1}
            marks
            min={1}
            max={10}
          />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            {t.difficulty}
          </Typography>
          <RadioGroup
            row
            aria-label="difficulty"
            name="difficulty"
            value={params.difficulty}
            onChange={handleChange}
          >
            <FormControlLabel value="low" control={<Radio />} label={t.low} />
            <FormControlLabel value="medium" control={<Radio />} label={t.medium} />
            <FormControlLabel value="high" control={<Radio />} label={t.high} />
          </RadioGroup>
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label={t.topics}
            name="topics"
            value={params.topics}
            onChange={handleChange}
            placeholder={t.separateTopics}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label={t.examReference}
            name="examReference"
            value={params.examReference}
            onChange={handleChange}
            placeholder={t.optionalExamReference}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label={t.teacherNotes}
            name="teacherNotes"
            value={params.teacherNotes}
            onChange={handleChange}
            placeholder={t.optionalTeacherNotes}
          />
        </Grid>
        <Grid item xs={12}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={isLoading}
          >
            {isLoading ? t.generating : t.generateExam}
          </Button>
        </Grid>
      </Grid>
    </form>
  );
};

export default ExamForm;

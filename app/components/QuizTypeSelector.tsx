'use client';

import { Radio, Stack, Text, Group } from '@mantine/core';
import classes from '@/app/styles/radiocardstyle.module.css';

export const QUIZ_TYPES = [
  { name: '📝 Exam', description: 'Comprehensive questions covering your topics' },
  { name: '📊 Client Presentation Preparation', description: 'Prepare for client presentations with interactive quizzes.' },
  { name: '👩🏻‍💼 Interview Preparation', description: 'Practice for job interviews with scenario-based questions.' },
  { name: '🌍 Language Learning', description: 'Enhance language skills with vocabulary and grammar quizzes.' },
  { name: '📚 Casual Learning', description: 'Explore topics of interest in a relaxed environment.' },
];

interface QuizTypeSelectorProps {
  value: string | null;
  onChange: (value: string | null) => void;
}

export const QuizTypeSelector = ({ value, onChange }: QuizTypeSelectorProps) => {
  return (
    <Radio.Group
      value={value}
      onChange={onChange}
      label="Select Quiz Type"
      description="Choose the type of quiz you want to generate. This will help tailor the questions to your needs."
    >
      <Stack pt="md" gap="xs">
        {QUIZ_TYPES.map((item) => (
          <Radio.Card className={classes.root} value={item.name} key={item.name}>
            <Group wrap="nowrap" align="flex-start">
              <Radio.Indicator />
              <div>
                <Text className={classes.label}>{item.name}</Text>
                <Text className={classes.description}>{item.description}</Text>
              </div>
            </Group>
          </Radio.Card>
        ))}
      </Stack>
    </Radio.Group>
  );
};

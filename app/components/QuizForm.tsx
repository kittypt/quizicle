'use client';

import { Stack, Textarea } from '@mantine/core';
import { QuizTypeSelector } from './QuizTypeSelector';
import { QuestionCountSlider } from './QuestionCountSlider';

interface QuizFormProps {
  quizType: string | null;
  onQuizTypeChange: (value: string | null) => void;
  questionCount: number;
  onQuestionCountChange: (value: number) => void;
  instructions: string;
  onInstructionsChange: (value: string) => void;
}

export const QuizForm = ({
  quizType,
  onQuizTypeChange,
  questionCount,
  onQuestionCountChange,
  instructions,
  onInstructionsChange,
}: QuizFormProps) => {
  return (
    <Stack gap={'s'}>
      <QuizTypeSelector value={quizType} onChange={onQuizTypeChange} />

      <Textarea
        label="Additional instructions"
        description="What do you want to achieve with this quiz? Any specific requirements or constraints?"
        placeholder="I want to improve my understanding of quantum mechanics"
        value={instructions}
        onChange={(e) => onInstructionsChange(e.currentTarget.value)}
      />

      <QuestionCountSlider value={questionCount} onChange={onQuestionCountChange} />
    </Stack>
  );
};

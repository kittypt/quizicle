'use client';

import React, { useState } from 'react';
import { Card, Title, Text, Button, Radio, Stack, Progress, Group, Box } from '@mantine/core';

// Define strict type interfaces matching Gemini JSON data schema
interface QuizQuestion {
  questiontext: string;
  correctanswer: string;
  incorrectansweroptions: string[];
}

interface QuizData {
  title: string;
  questions: QuizQuestion[];
}

interface QuizPlayerProps {
  quiz: QuizData;
  onFinished: (score: number) => void; // Emits the final result when complete
}

export const QuizPlayer: React.FC<QuizPlayerProps> = ({ quiz, onFinished }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  const { title, questions } = quiz;

  // Safeguard against malformed data payloads
  if (!questions || questions.length === 0) {
    return <Text c="red">Error: This quiz contains no readable questions.</Text>;
  }

  const currentQuestion = questions[currentIndex];

  // Combine and shuffle options dynamically so the correct answer isn't always at the bottom
  const shuffledOptions = React.useMemo(() => {
    const options = [...currentQuestion.incorrectansweroptions, currentQuestion.correctanswer];
    return options.sort(() => Math.random() - 0.5);
  }, [currentIndex, currentQuestion]);

  const handleNextQuestion = () => {
    if (!selectedOption) return;

    // Track score if they chose the right answer string
    if (selectedOption === currentQuestion.correctanswer) {
      setScore((prev) => prev + 1);
    }

    // Reset radio option selection state for the next card layout
    setSelectedOption(null);

    // Sequence controller logic
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Calculate final score adjustment immediately during the callback invocation
      const finalScore = selectedOption === currentQuestion.correctanswer ? score + 1 : score;
      onFinished(finalScore);
    }
  };

  // UI tracking value calculations
  const totalQuestions = questions.length;
  const progressPercent = ((currentIndex + 1) / totalQuestions) * 100;

  return (
    <Card shadow="md" padding="xl" radius="md" withBorder mx="auto" mt="xl">
      {/* Header Context Tracking */}
      <Box mb="md">
        <Title order={3} ta="center" mb="xs">
          {title}
        </Title>
        <Progress value={progressPercent} striped animated radius="xl" size="sm" />
      </Box>

      {/* Progress Metric Subtext */}
      <Group justify="space-between" mb="lg">
        <Text size="xs" c="dimmed" fw={700}>
          QUESTION {currentIndex + 1} OF {totalQuestions}
        </Text>
        <Text size="xs" c="dimmed" fw={700}>
          {Math.round(progressPercent)}% COMPLETE
        </Text>
      </Group>

      {/* Dynamic Main Question Prompt Component */}
      <Title order={4} mb="xl" style={{ lineHeight: '1.5' }}>
        {currentQuestion.questiontext}
      </Title>

      {/* Controlled Radio Group Choice Node */}
      <Radio.Group 
        value={selectedOption || ''} 
        onChange={setSelectedOption}
        name={`question-${currentIndex}`}
      >
        <Stack gap="md" mb="xl">
          {shuffledOptions.map((option, index) => (
            <Card 
              key={index} 
              withBorder 
              padding="sm" 
              radius="sm"
              style={{
                borderColor: selectedOption === option ? 'var(--mantine-color-teal-filled)' : undefined,
                transition: 'border-color 0.2s ease',
              }}
            >
              <Radio 
                value={option} 
                label={option} 
                styles={{ body: { cursor: 'pointer', width: '100%' } }}
              />
            </Card>
          ))}
        </Stack>
      </Radio.Group>

      {/* Actions Segment */}
      <Group justify="flex-end">
        <Button 
          onClick={handleNextQuestion} 
          disabled={!selectedOption}
          size="md"
        >
          {currentIndex === totalQuestions - 1 ? 'Finish Quiz' : 'Next Question'}
        </Button>
      </Group>
    </Card>
  );
};

export default QuizPlayer;
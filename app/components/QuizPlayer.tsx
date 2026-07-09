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
  onFinished: (results: {
    score: number;
    userAnswers: { questiontext: string; chosen: string; correct: string }[];
  }) => void;
}

export const QuizPlayer: React.FC<QuizPlayerProps> = ({ quiz, onFinished }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ questiontext: string; chosen: string; correct: string }[]>([]);

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

    const isCorrect = selectedOption === currentQuestion.correctanswer;
    const newScore = isCorrect ? score + 1 : score;

    // Save current selection summary
    const currentResponse = {
      questiontext: currentQuestion.questiontext,
      chosen: selectedOption,
      correct: currentQuestion.correctanswer,
    };

    const updatedAnswers = [...userAnswers, currentResponse];

    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
    setUserAnswers(updatedAnswers);
    setSelectedOption(null);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onFinished({
        score: newScore,
        userAnswers: updatedAnswers,
      });
    }
  };

  // UI tracking value calculations
  const totalQuestions = questions.length;
  const progressPercent = ((currentIndex + 1) / totalQuestions) * 100;

  return (
    <Card shadow="xl" padding="xl" radius="md" withBorder >
      <Stack gap="lg">
        {/* Header Context Tracking */}
        <Stack gap="xs">
          <Text>
            {title}
          </Text>
          <Progress value={progressPercent} radius="xl" size="sm" />

          <Text size="xs" c="dimmed" fw={700}>
            QUESTION {currentIndex + 1} OF {totalQuestions}
          </Text>
        </Stack>

        <Stack gap="sm">
          {/* Dynamic Main Question Prompt Component */}
          <Title order={4} style={{ lineHeight: '1.5' }}>
            {currentQuestion.questiontext}
          </Title>

          {/* Controlled Radio Group Choice Node */}
          <Radio.Group
            value={selectedOption || ''}
            onChange={setSelectedOption}
            name={`question-${currentIndex}`}
          >
            <Stack gap="xs">
              {shuffledOptions.map((option, index) => (
                <Radio.Card
                  key={index}
                  value={option}
                  withBorder
                  radius="sm"
                  p="xs"
                  style={{
                    borderColor: selectedOption === option ? 'var(--mantine-color-teal-filled)' : undefined,
                    transition: 'border-color 0.2s ease',
                  }}
                >
                  {/* <Radio
                    value={option}
                    label={option}
                    styles={{ body: { cursor: 'pointer', width: '100%' } }}
                  /> */}
                  <Group wrap="nowrap" align="center">
                    <Radio.Indicator />
                    <div>{option}</div>
                  </Group>
                </Radio.Card>
              ))}
            </Stack>
          </Radio.Group>
        </Stack>

        <Group justify="flex-end">
          <Button
            onClick={handleNextQuestion}
            disabled={!selectedOption}
            size="sm"
          >
            {currentIndex === totalQuestions - 1 ? 'Finish Quiz' : 'Next Question'}
          </Button>
        </Group>
      </Stack>
    </Card>
  );
};

export default QuizPlayer;
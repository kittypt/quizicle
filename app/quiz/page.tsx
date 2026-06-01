'use client';

import { useQuiz } from '@/context/QuizContext';
import { QuizPlayer } from '@/app/components/QuizPlayer';
import { Container, Button, Title, Text, Center, Stack } from '@mantine/core';
import { useRouter } from 'next/navigation';

export default function QuizPageRoute() {
  const { quiz, setQuiz } = useQuiz();
  const router = useRouter();

  // If a user refrshes the browser or navigates directly here without data, show a fallback wrapper
  if (!quiz) {
    return (
      <Container size="sm" py="xl">
        <Center style={{ height: '50vh' }}>
          <Stack ta="center" gap="md">
            <Title order={3}>No Active Quiz Found</Title>
            <Text c="dimmed">Please head back to the dashboard to generate a new quiz configuration.</Text>
            <Button onClick={() => router.push('/')} variant="light">
              Go Back Home
            </Button>
          </Stack>
        </Center>
      </Container>
    );
  }

  return (
    <Container size="sm" py="xl">
      <QuizPlayer 
        quiz={quiz} 
        onFinished={(finalScore: any) => {
          alert(`Quiz Finished! Your Final Score: ${finalScore}`);
          setQuiz(null); // Clear context data tracking
          router.push('/'); // Route them clean back home
        }} 
      />
    </Container>
  );
}
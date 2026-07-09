'use client';

import { useQuiz } from '@/context/QuizContext';
import { Container, Button, Title, Text, Center, Stack, Card, Group, Badge } from '@mantine/core';
import { useRouter } from 'next/navigation';

export default function ResultsPageRoute() {
    const { results, setQuiz, setResults } = useQuiz();
    const router = useRouter();

    if (!results) {
        return (
            <Container size="sm" py="xl" ta="center">
                <Text>No results data found. Please complete a quiz first.</Text>
                <Button mt="md" onClick={() => router.push('/')}>Go Home</Button>
            </Container>
        );
    }

    const handleReset = () => {
        // Clear state when they leave the screen
        setQuiz(null);
        setResults(null);
        router.push('/');
    };

    return (
        <Container size="sm" py="xl">
            <Stack ta="left" gap="md">
                <Title order={3}>Quiz Completed!</Title>
                <Text size="xl" fw={700} mt="sm">
                    You got {results.score} out of {results.totalQuestions} correct!
                </Text>

                {/* Detailed Answers Breakdown */}
                <Title order={3}>Review Answers</Title>
                <Stack gap="md">
                    {results.userAnswers.map((item, index) => {
                        const isCorrect = item.chosen === item.correct;

                        return (
                            <Card key={index} shadow="sm" padding="md" radius="sm" withBorder>
                                <Stack gap="xs">
                                    <Group justify="space-between">
                                        <Text fw={600} size="sm" c="dimmed">Question {index + 1}</Text>
                                        <Badge color={isCorrect ? 'green' : 'red'}>
                                            {isCorrect ? 'Correct' : 'Incorrect'}
                                        </Badge>
                                    </Group>

                                    <Text fw={700} size="md">{item.questiontext}</Text>

                                    <Group gap="xs" mt="xs">
                                        <Text size="sm">Your Answer:</Text>
                                        <Text size="sm" fw={700} c={isCorrect ? 'green.7' : 'red.7'}>
                                            {item.chosen}
                                        </Text>
                                    </Group>

                                    {!isCorrect && (
                                        <Group gap="xs">
                                            <Text size="sm">Correct Answer:</Text>
                                            <Text size="sm" fw={700} c="green.7">
                                                {item.correct}
                                            </Text>
                                        </Group>
                                    )}
                                </Stack>
                            </Card>
                        );
                    })}
                </Stack>

                <Button onClick={() => router.push('/')} variant="light"> {/* also want to set quiz to null here */}
                    Go Back Home
                </Button>
            </Stack>
        </Container>
    );
}
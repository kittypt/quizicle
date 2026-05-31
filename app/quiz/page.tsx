'use client';

import { Container, MantineProvider, Stack, Title } from "@mantine/core";
import { Theme } from "../components/Theme";

export default function QuizPage() {
  return (
    <MantineProvider theme={Theme}>
        <Container p={'lg'}>
            <Stack gap={'xl'}>
                <Title order={1}>Quiz Time! 🎉</Title>
            </Stack>
        </Container>
    </MantineProvider>
  );
}
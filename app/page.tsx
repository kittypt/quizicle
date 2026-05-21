'use client';

import { createTheme, MantineProvider } from '@mantine/core';
import { useState } from 'react';
import { Button, Container, Group, Stack } from '@mantine/core';
import { PageHeader } from './components/PageHeader';
import { FileUploadDropzone } from './components/FileUploadDropzone';
import { FileList } from './components/FileList';
import { QuizForm } from './components/QuizForm';
import { useFileUpload } from './hooks/useFileUpload';

export default function Home() {
  const theme = createTheme({
    fontFamily: 'Verdana, sans-serif',
    fontFamilyMonospace: 'Verdana, sans-serif',
    primaryColor: 'teal'
  });

  const { files, addFiles, removeFile } = useFileUpload();
  const [quizType, setQuizType] = useState<string | null>(null);
  const [instructions, setInstructions] = useState('');
  const [questionCount, setQuestionCount] = useState(20);

  return (
    <MantineProvider theme={theme}>
      <Container p={'lg'}>
        <Stack gap={'xl'}>
          <PageHeader />

          <Stack gap={'xs'}>
          <FileUploadDropzone onDrop={addFiles} />
          {files.length > 0 && <FileList files={files} onRemove={removeFile} />}
          </Stack>

          <QuizForm
            quizType={quizType}
            onQuizTypeChange={setQuizType}
            questionCount={questionCount}
            onQuestionCountChange={setQuestionCount}
            instructions={instructions}
            onInstructionsChange={setInstructions}
          />

          <Group justify="flex-end">
            <Button variant="filled">Quiz me!</Button>
          </Group>
        </Stack>
      </Container>
    </MantineProvider>
  );
}

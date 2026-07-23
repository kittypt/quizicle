'use client';

import { useState } from 'react';
import { Container, Group, Stack } from '@mantine/core';
import { PageHeader } from './components/PageHeader';
import { FileUploadDropzone } from './components/FileUploadDropzone';
import { FileList } from './components/FileList';
import { QuizForm } from './components/QuizForm';
import { useFileUpload } from './hooks/useFileUpload';
import { GenerateQuiz } from './components/GenerateQuiz';

export default function Home() {
  const { files, addFiles, removeFile } = useFileUpload();
  const [quizType, setQuizType] = useState<string | null>(null);
  const [instructions, setInstructions] = useState('');
  const [questionCount, setQuestionCount] = useState(20);

  return (
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

        <Group justify="right">
          <GenerateQuiz
            quizType={quizType}
            questionCount={questionCount}
            instructions={instructions}
            files={files}
          />
        </Group>
      </Stack>
    </Container >
  );
}

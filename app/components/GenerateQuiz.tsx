import React, { useState } from 'react';
import { Button, Modal, Text, Loader, Stack, Center, Alert, Group } from '@mantine/core';
import { IconAlertCircle, IconRefresh } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useQuiz } from '@/context/QuizContext';
import { FileEntry } from '@/app/hooks/useFileUpload';

interface GenerateQuizProps {
  quizType: string | null;
  questionCount: number;
  instructions: string;
  files: FileEntry[];
}

interface ContextItem {
  type: 'text' | 'pdf' | 'url';
  content?: string;  // text content
  mimeType?: string; // PDF mime type
  data?: string;     // base64-encoded PDF
  url?: string;      // URL for Gemini to fetch
}

const PDF_MIME = 'application/pdf';

const readFileAsBase64 = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Strip the data:...;base64, prefix to get raw base64
      const base64 = result.split(',')[1] || result;
      resolve(base64);
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
};

const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string || '');
    reader.onerror = () => resolve('');
    reader.readAsText(file);
  });
};

export const GenerateQuiz: React.FC<GenerateQuizProps> = ({
  quizType,
  questionCount,
  instructions,
  files,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ message: string; retryable: boolean } | null>(null);
  const router = useRouter();
  const { setQuiz } = useQuiz();

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const contexts: ContextItem[] = await Promise.all(
        files.map(async (entry): Promise<ContextItem> => {
          if (entry.type === 'url') {
            return { type: 'url', url: entry.url };
          }

          const file = entry.file;

          if (file.type === PDF_MIME || file.name.toLowerCase().endsWith('.pdf')) {
            const base64 = await readFileAsBase64(file);
            return { type: 'pdf', mimeType: PDF_MIME, data: base64 };
          }

          const text = await readFileAsText(file);
          return { type: 'text', content: text };
        })
      );

      const hasFileContexts = contexts.length > 0;

      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizType,
          questionCount,
          instructions,
          contexts: hasFileContexts ? contexts : undefined,
        }),
      });

      if (!response.ok) {
        // Try to get structured error from API
        let apiError: { error?: string; retryable?: boolean } = {};
        try {
          apiError = await response.json();
        } catch {
          // Response wasn't JSON — use status-based fallback
        }
        throw {
          message: apiError.error || `Server error (${response.status})`,
          retryable: apiError.retryable ?? response.status >= 500,
        };
      }

      const quizData = await response.json();
      setQuiz(quizData);
      router.push('/quiz');

    } catch (err: any) {
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        setError({
          message: 'Could not connect to the server. Please check your internet connection and try again.',
          retryable: true,
        });
      } else if (err?.message) {
        setError({
          message: err.message,
          retryable: err.retryable ?? true,
        });
      } else {
        setError({
          message: 'An unexpected error occurred. Please try again.',
          retryable: true,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Loading Modal */}
      <Modal
        opened={loading}
        onClose={() => {}}
        closeOnClickOutside={false}
        closeOnEscape={false}
        withCloseButton={false}
        centered
        size="sm"
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
      >
        <Center>
          <Stack align="center" gap="md" py="md">
            <Loader size="lg" color="teal" />
            <Stack gap={4} align="center">
              <Text fw={600} size="lg">Generating your quiz</Text>
              <Text size="sm" c="dimmed" ta="center">
                Crafting questions with Gemini AI based on your content and preferences…
              </Text>
            </Stack>
          </Stack>
        </Center>
      </Modal>

      {/* Error Alert */}
      {error && (
        <Alert
          variant="light"
          color="red"
          title="Quiz generation failed"
          icon={<IconAlertCircle size={16} />}
          mb="md"
        >
          <Stack gap="sm">
            <Text size="sm">{error.message}</Text>
            {error.retryable && (
              <Button
                variant="light"
                color="red"
                size="xs"
                leftSection={<IconRefresh size={14} />}
                onClick={handleGenerate}
              >
                Try again
              </Button>
            )}
          </Stack>
        </Alert>
      )}

      <Button
        loading={loading}
        onClick={handleGenerate}
      >
        Quiz me!
      </Button>
    </>
  );
};

export default GenerateQuiz;
import React, { useState } from 'react';
import { Button } from '@mantine/core';
import { useRouter } from 'next/navigation';
import { useQuiz } from '@/context/QuizContext';

interface FileEntry {
  file: File;
  iconUrl?: string;
}

interface GenerateQuizProps {
  quizType: string | null;
  questionCount: number;
  instructions: string;
  files: FileEntry[];
}

export const GenerateQuiz: React.FC<GenerateQuizProps> = ({
  quizType,
  questionCount,
  instructions,
  files,
}) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setQuiz } = useQuiz(); // Grab context setter

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string || '');
      reader.onerror = () => resolve(''); // Fallback if read fails
      reader.readAsText(file);
    });
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      // Extract the actual text content from every uploaded file/link entry
      const contentPromises = files.map(entry => readFileContent(entry.file));
      const textContentsArray = await Promise.all(contentPromises);

      // Combine all file contents into one solid contextual block of text
      const joinedFileContext = textContentsArray.filter(text => text.trim() !== '').join('\n\n--- Next File Content ---\n\n');

      // Hit Next.js API route
      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quizType,
          questionCount,
          instructions,
          fileContext: joinedFileContext,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const quizData = await response.json();
      console.log("quizData =", quizData);

      setQuiz(quizData);

      router.push('/quiz');

    } catch (error) {
      console.error("Failed to generate quiz via backend:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      loading={loading}
      onClick={handleGenerate}
    >
      Quiz me!
    </Button>
  );
};

export default GenerateQuiz;
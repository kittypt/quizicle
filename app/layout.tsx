import type { Metadata } from "next";
import '@mantine/core/styles.css';
import '@mantine/dropzone/styles.css';
import { createTheme, MantineProvider } from '@mantine/core';
import { QuizProvider } from '@/context/QuizContext';


const theme = createTheme({
  fontFamily: 'Verdana, sans-serif',
  fontFamilyMonospace: 'Verdana, sans-serif',
  primaryColor: 'teal'
});

export const metadata: Metadata = {
  title: "Quizicle — AI-Powered Quizzes",
  description: "Generate personalised quizzes from your documents, URLs, or any topic using AI. Upload files, paste links, or describe what you want to learn.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <MantineProvider theme={theme}>
          <QuizProvider>
            {children}
          </QuizProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
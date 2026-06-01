'use client';

import React, { createContext, useContext, useState } from 'react';

interface QuizQuestion {
  questiontext: string;
  correctanswer: string;
  incorrectansweroptions: string[];
}

interface QuizData {
  title: string;
  questions: QuizQuestion[];
}

interface QuizContextType {
  quiz: QuizData | null;
  setQuiz: (quiz: QuizData | null) => void;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export const QuizProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [quiz, setQuiz] = useState<QuizData | null>(null);

  return (
    <QuizContext.Provider value={{ quiz, setQuiz }}>
      {children}
    </QuizContext.Provider>
  );
};

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (!context) throw new Error('useQuiz must be used within a QuizProvider');
  return context;
};
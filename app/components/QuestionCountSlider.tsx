'use client';

import { Slider, Stack, Text } from '@mantine/core';

const MARKS = [
  { value: 10, label: '10' },
  { value: 20, label: '20' },
  { value: 30, label: '30' },
  { value: 40, label: '40' },
  { value: 50, label: '50' },
];

interface QuestionCountSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export const QuestionCountSlider = ({ value, onChange }: QuestionCountSliderProps) => {
  return (
    <Stack gap="md">
      <Text size="sm" fw={'600'}>
        Number of questions
      </Text>
      <Slider
        value={value}
        onChange={onChange}
        size="sm"
        defaultValue={20}
        min={10}
        max={50}
        label={(val) => MARKS.find((mark) => mark.value === val)!.label}
        step={10}
        marks={MARKS}
        styles={{ markLabel: { display: 'none' } }}
      />
    </Stack>
  );
};

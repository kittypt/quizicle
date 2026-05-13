'use client';

import { Stack, Text, Title } from '@mantine/core';

export const PageHeader = () => {
  return (
    <Stack gap={'xs'}>
      <Title order={1}>Hello, Kitty! 😄</Title>
      <Text c={'dimmed'}>Lets create a quiz for you.</Text>
    </Stack>
  );
};

'use client';

import { Stack, Text } from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { IconUpload, IconX } from '@tabler/icons-react';
import { Group } from '@mantine/core';

interface FileUploadDropzoneProps {
  onDrop: (files: File[]) => void;
}

export const FileUploadDropzone = ({ onDrop }: FileUploadDropzoneProps) => {
  return (
    <Stack gap={'xs'}>
      <Dropzone
        onDrop={onDrop}
        onReject={(files) => console.log('rejected files', files)}
        maxSize={5 * 1024 ** 2}
      >
        <Group justify="center" gap="xl" mih={220} style={{ pointerEvents: 'none' }}>
          <Dropzone.Accept>
            <IconUpload size={52} color="var(--mantine-color-green-6)" />
          </Dropzone.Accept>
          <Dropzone.Reject>
            <IconUpload size={52} color="var(--mantine-color-red-6)" />
          </Dropzone.Reject>
          <Dropzone.Idle>
            <IconUpload size={52} color="var(--mantine-color-dimmed)" />
          </Dropzone.Idle>

          <div>
            <Text size="xl" inline>
              Drag images here or click to select files
            </Text>
            <Text size="sm" c="dimmed" inline mt={7}>
              Attach as many files as you like, each file should not exceed 5mb
            </Text>
          </div>
        </Group>
      </Dropzone>
    </Stack>
  );
};

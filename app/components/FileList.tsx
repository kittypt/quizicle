'use client';

import { ActionIcon, Card, Group, Text } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import { FileEntry } from '@/app/hooks/useFileUpload';

interface FileListProps {
  files: FileEntry[];
  onRemove: (index: number) => void;
}

// Component to display the list of uploaded files with an option to remove each file
export const FileList = ({ files, onRemove }: FileListProps) => {
  return (
    <Group>
      {files.map((entry, index) => (
        <Card key={`${entry.file.name}-${index}`} p="xs" withBorder>
          <Group>
            {entry.iconUrl ? (
              <img
                src={entry.iconUrl}
                alt="favicon"
                width={18}
                height={18}
                style={{ borderRadius: 4 }}
              />
            ) : null}
            <Text size="sm" style={{ overflowWrap: 'anywhere' }}>
              {entry.file.name}
            </Text>
            <ActionIcon
              variant="subtle"
              color="red"
              onClick={() => onRemove(index)}
            >
              <IconX size={12} />
            </ActionIcon>
          </Group>
        </Card>
      ))}
    </Group>
  );
};

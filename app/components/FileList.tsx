'use client';

import { ActionIcon, Card, Group, Text } from '@mantine/core';
import { IconX, IconLink, IconFile } from '@tabler/icons-react';
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
        <Card key={`${entry.type}-${index}`} p="xs" withBorder>
          <Group>
            {entry.type === 'url' ? (
              <img
                src={entry.iconUrl}
                alt="favicon"
                width={18}
                height={18}
                style={{ borderRadius: 4 }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : null}
            <Text size="sm" style={{ overflowWrap: 'anywhere' }}>
              {entry.type === 'url' ? entry.url : entry.file.name}
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

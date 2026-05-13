'use client';

import { useEffect, useState } from 'react';
import { ActionIcon, Button, Card, Container, Group, Radio, Slider, Stack, Text, Textarea, Title } from "@mantine/core";
import { Dropzone } from "@mantine/dropzone";
import { IconUpload, IconX } from "@tabler/icons-react";
import classes from './styles/radiocardstyle.module.css';

const data = [
  { name: 'Exam', description: 'Comprehensive questions covering your topics' },
  { name: 'Client Presentation Preparation', description: 'Prepare for client presentations with interactive quizzes.' },
  { name: 'Interview Preparation', description: 'Practice for job interviews with scenario-based questions.' },
  { name: 'Language Learning', description: 'Enhance language skills with vocabulary and grammar quizzes.' },
  { name: 'Casual Learning', description: 'Explore topics of interest in a relaxed environment.' },
];

type FileEntry = { file: File; iconUrl?: string };

export default function Home() {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [value, setValue] = useState<string | null>(null);

  const isLikelyUrl = (text: string) => {
    try {
      const url = new URL(text.trim());
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const makeFilenameFromText = (text: string) => {
    const words = text.trim().split(/\s+/).slice(0, 5);
    const base = words.join(' ');
    const safe = base
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 50);

    return `${safe || 'pasted-text'}.txt`;
  };

  const fetchPageMetadata = async (href: string) => {
    const url = new URL(href);
    const fallback = {
      title: url.hostname,
      iconUrl: `${url.origin}/favicon.ico`,
    };

    try {
      const response = await fetch(url.toString(), { mode: 'cors' });
      if (!response.ok) {
        return fallback;
      }

      const html = await response.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const title = doc.querySelector('title')?.textContent?.trim() || fallback.title;
      const iconElement = Array.from(doc.querySelectorAll('link[rel]')).find((element) => {
        const rel = element.getAttribute('rel')?.toLowerCase() || '';
        return rel.includes('icon');
      });

      const iconHref = iconElement?.getAttribute('href');
      const iconUrl = iconHref ? new URL(iconHref, url).toString() : fallback.iconUrl;
      return { title, iconUrl };
    } catch {
      return fallback;
    }
  };

  const makeFileFromLink = async (text: string) => {
    const trimmed = text.trim();
    const metadata = await fetchPageMetadata(trimmed);
    const filename = makeFilenameFromText(metadata.title);
    const file = new File([trimmed], filename, { type: 'text/plain' });
    return { file, iconUrl: metadata.iconUrl };
  };

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      if (!event.clipboardData) {
        return;
      }

      const target = event.target as HTMLElement | null;
      const isEditable = target instanceof HTMLElement && (
        target.isContentEditable ||
        ['INPUT', 'TEXTAREA'].includes(target.tagName) ||
        target.closest?.('input, textarea, [contenteditable="true"]') !== null
      );

      if (isEditable) {
        return;
      }

      const text = event.clipboardData.getData('text/plain');
      if (!text?.trim()) {
        return;
      }

      event.preventDefault();
      if (isLikelyUrl(text)) {
        makeFileFromLink(text).then((entry) => {
          setFiles((existing) => [...existing, entry]);
        });
      } else {
        const filename = makeFilenameFromText(text);
        const file = new File([text], filename, { type: 'text/plain' });
        setFiles((existing) => [...existing, { file }]);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const cards = data.map((item) => (
    <Radio.Card className={classes.root} value={item.name} key={item.name}>
      <Group wrap="nowrap" align="flex-start">
        <Radio.Indicator />
        <div>
          <Text className={classes.label}>{item.name}</Text>
          <Text className={classes.description}>{item.description}</Text>
        </div>
      </Group>
    </Radio.Card>
  ));

  const marks=[
              { value: 10, label: '10' },
              { value: 20, label: '20' },
              { value: 30, label: '30' },
              { value: 40, label: '40' },
              { value: 50, label: '50' },
            ];

  const [questionCount, setQuestionCount] = useState(20);

  return (
    <Container p={'lg'}>
      <Stack gap={'xl'}>
        <Stack gap={'xs'}>
          <Title order={1}>Hello, Kitty! 😄</Title>
          <Text c={'dimmed'}>Lets create a quiz for you.</Text>
        </Stack>

        <Stack gap={'xs'}>
          <Dropzone
            onDrop={(acceptedFiles) => setFiles((existing) => [...existing, ...acceptedFiles.map((file) => ({ file }))])}
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

          <Group>
            {
              files.map((entry, index) => (
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
                      onClick={() => setFiles((existing) => existing.filter((_, i) => i !== index))}
                    >
                      <IconX size={12} />
                    </ActionIcon>
                  </Group>
                </Card>
              ))
            }
          </Group>
        </Stack>

        <Stack gap={'s'}>
          <Radio.Group
            value={value}
            onChange={setValue}
            label="Pick one package to install"
            description="Choose a package that you will need in your application"
          >
            <Stack pt="md" gap="xs">
              {cards}
            </Stack>
          </Radio.Group>

          <Textarea
            label="Additional instructions"
            description="What do you want to achieve with this quiz? Any specific requirements or constraints?"
            placeholder="I want to improve my understanding of quantum mechanics"
          />

          <Text size="sm" fw={'600'}>
            Number of questions
          </Text>
          <Slider
            value={questionCount}
            onChange={setQuestionCount}
            size="sm"
            defaultValue={20}
            min={10}
            max={50}
            label={(val) => marks.find((mark) => mark.value === val)!.label}
            step={10}
            marks={marks}
            styles={{ markLabel: { display: 'none' } }}
          />
        </Stack>
        <Group justify="flex-end">
          <Button variant="filled">Quiz me!</Button>
        </Group>
      </Stack>
    </Container>
  );
}

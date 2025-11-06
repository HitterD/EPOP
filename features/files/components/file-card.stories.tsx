import type { Meta, StoryObj } from '@storybook/react'
import { FileCard } from './file-card'

const meta = {
  title: 'Files/FileCard',
  component: FileCard,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof FileCard>

export default meta
type Story = StoryObj<typeof meta>

const baseFile = {
  id: 'file-1',
  name: 'document.pdf',
  size: 1024000,
  mimeType: 'application/pdf',
  url: '/files/document.pdf',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  uploadedBy: {
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
  },
  status: 'ready' as const,
}

export const PDFFile: Story = {
  args: {
    file: baseFile,
  },
}

export const ImageFile: Story = {
  args: {
    file: {
      ...baseFile,
      name: 'screenshot.png',
      mimeType: 'image/png',
      url: '/files/screenshot.png',
      thumbnail: 'https://via.placeholder.com/300x200',
    },
  },
}

export const VideoFile: Story = {
  args: {
    file: {
      ...baseFile,
      name: 'presentation.mp4',
      mimeType: 'video/mp4',
      url: '/files/presentation.mp4',
      size: 15728640, // 15 MB
    },
  },
}

export const WordDocument: Story = {
  args: {
    file: {
      ...baseFile,
      name: 'report.docx',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      url: '/files/report.docx',
    },
  },
}

export const ExcelSpreadsheet: Story = {
  args: {
    file: {
      ...baseFile,
      name: 'data.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      url: '/files/data.xlsx',
      size: 2097152, // 2 MB
    },
  },
}

export const LargeFile: Story = {
  args: {
    file: {
      ...baseFile,
      name: 'video-recording.mov',
      mimeType: 'video/quicktime',
      url: '/files/video-recording.mov',
      size: 524288000, // 500 MB
    },
  },
}

export const Scanning: Story = {
  args: {
    file: {
      ...baseFile,
      name: 'scanning.pdf',
      status: 'scanning',
    },
  },
}

export const Infected: Story = {
  args: {
    file: {
      ...baseFile,
      name: 'malware.exe',
      mimeType: 'application/x-msdownload',
      status: 'infected',
    },
  },
}

export const Failed: Story = {
  args: {
    file: {
      ...baseFile,
      name: 'corrupted.zip',
      mimeType: 'application/zip',
      status: 'failed',
    },
  },
}

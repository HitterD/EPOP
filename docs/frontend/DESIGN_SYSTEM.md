# Design System & Storybook - Component Documentation Specification

## Objective
Create a comprehensive, reusable component library documented in Storybook for consistency, faster development, and easier onboarding.

## Implementation Status
- ⬜ FE-DS-1 to FE-DS-8: All Storybook stories (PENDING)
- ⬜ Design tokens documentation (PENDING)
- ⬜ Component API documentation (PENDING)

---

## Design Tokens

### Color Palette

#### Primary Colors (Teams-inspired)
```typescript
// tailwind.config.ts
export const colors = {
  primary: {
    50: '#F0F1FF',
    100: '#E0E3FF',
    200: '#C7CCFF',
    300: '#A5ADFF',
    400: '#8389FF',
    500: '#6264A7', // Main brand color
    600: '#4A4C8A',
    700: '#36386D',
    800: '#252650',
    900: '#171833',
  },
  
  // Status colors
  success: {
    DEFAULT: '#10B981',
    light: '#D1FAE5',
    dark: '#065F46',
  },
  warning: {
    DEFAULT: '#F59E0B',
    light: '#FEF3C7',
    dark: '#92400E',
  },
  error: {
    DEFAULT: '#EF4444',
    light: '#FEE2E2',
    dark: '#991B1B',
  },
  info: {
    DEFAULT: '#3B82F6',
    light: '#DBEAFE',
    dark: '#1E3A8A',
  },
  
  // Presence colors
  presence: {
    available: '#92C353',
    busy: '#E74856',
    away: '#F7630C',
    offline: '#8A8886',
  },
}
```

#### Semantic Colors
```typescript
// Light theme
export const lightTheme = {
  background: {
    primary: '#FFFFFF',
    secondary: '#F9FAFB',
    tertiary: '#F3F4F6',
  },
  text: {
    primary: '#111827',
    secondary: '#6B7280',
    tertiary: '#9CA3AF',
    inverse: '#FFFFFF',
  },
  border: {
    DEFAULT: '#E5E7EB',
    focus: '#6264A7',
    error: '#EF4444',
  },
}

// Dark theme
export const darkTheme = {
  background: {
    primary: '#111827',
    secondary: '#1F2937',
    tertiary: '#374151',
  },
  text: {
    primary: '#F9FAFB',
    secondary: '#D1D5DB',
    tertiary: '#9CA3AF',
    inverse: '#111827',
  },
  border: {
    DEFAULT: '#374151',
    focus: '#8389FF',
    error: '#EF4444',
  },
}
```

### Typography

#### Font Families
```typescript
export const fontFamily = {
  sans: ['Inter', 'system-ui', 'sans-serif'],
  mono: ['Fira Code', 'monospace'],
}
```

#### Font Sizes & Line Heights
```typescript
export const fontSize = {
  xs: ['12px', { lineHeight: '16px' }],
  sm: ['14px', { lineHeight: '20px' }],
  base: ['16px', { lineHeight: '24px' }],
  lg: ['18px', { lineHeight: '28px' }],
  xl: ['20px', { lineHeight: '28px' }],
  '2xl': ['24px', { lineHeight: '32px' }],
  '3xl': ['30px', { lineHeight: '36px' }],
  '4xl': ['36px', { lineHeight: '40px' }],
}
```

#### Font Weights
```typescript
export const fontWeight = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
}
```

### Spacing Scale
```typescript
export const spacing = {
  0: '0',
  1: '4px',   // 0.25rem
  2: '8px',   // 0.5rem
  3: '12px',  // 0.75rem
  4: '16px',  // 1rem
  5: '20px',  // 1.25rem
  6: '24px',  // 1.5rem
  8: '32px',  // 2rem
  10: '40px', // 2.5rem
  12: '48px', // 3rem
  16: '64px', // 4rem
  20: '80px', // 5rem
}
```

### Border Radius
```typescript
export const borderRadius = {
  none: '0',
  sm: '4px',
  DEFAULT: '8px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '24px',
  full: '9999px',
}
```

### Shadows
```typescript
export const boxShadow = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
}
```

---

## Component Library (Storybook Stories)

### FE-DS-1: Avatar + PresenceChip

#### Avatar Component
```typescript
// components/ui/avatar.tsx
interface AvatarProps {
  src?: string
  alt: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  fallback?: string
  presence?: 'available' | 'busy' | 'away' | 'offline'
}

export function Avatar({ 
  src, 
  alt, 
  size = 'md', 
  fallback, 
  presence 
}: AvatarProps) {
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
  }
  
  return (
    <div className={`relative ${sizeClasses[size]}`}>
      <div className="rounded-full overflow-hidden bg-gray-200">
        {src ? (
          <img src={src} alt={alt} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary-500 text-white font-semibold">
            {fallback || alt[0]?.toUpperCase()}
          </div>
        )}
      </div>
      {presence && <PresenceChip status={presence} size={size} />}
    </div>
  )
}
```

#### PresenceChip Component
```typescript
interface PresenceChipProps {
  status: 'available' | 'busy' | 'away' | 'offline'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}

export function PresenceChip({ status, size = 'md' }: PresenceChipProps) {
  const sizeMap = {
    xs: 'w-2 h-2',
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-3.5 h-3.5',
    xl: 'w-4 h-4',
  }
  
  const colorMap = {
    available: 'bg-presence-available',
    busy: 'bg-presence-busy',
    away: 'bg-presence-away',
    offline: 'bg-presence-offline',
  }
  
  return (
    <div className={`absolute bottom-0 right-0 ${sizeMap[size]} ${colorMap[status]} rounded-full border-2 border-white`} />
  )
}
```

#### Storybook Story
```typescript
// components/ui/avatar.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { Avatar } from './avatar'

const meta: Meta<typeof Avatar> = {
  title: 'Components/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    presence: {
      control: 'select',
      options: ['available', 'busy', 'away', 'offline'],
    },
  },
}

export default meta
type Story = StoryObj<typeof Avatar>

export const Default: Story = {
  args: {
    alt: 'John Doe',
    fallback: 'JD',
  },
}

export const WithImage: Story = {
  args: {
    src: 'https://i.pravatar.cc/150?img=1',
    alt: 'John Doe',
  },
}

export const WithPresence: Story = {
  args: {
    src: 'https://i.pravatar.cc/150?img=2',
    alt: 'Jane Smith',
    presence: 'available',
  },
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar alt="XS" size="xs" fallback="XS" />
      <Avatar alt="SM" size="sm" fallback="SM" />
      <Avatar alt="MD" size="md" fallback="MD" />
      <Avatar alt="LG" size="lg" fallback="LG" />
      <Avatar alt="XL" size="xl" fallback="XL" />
    </div>
  ),
}

export const AllPresenceStates: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar alt="Available" presence="available" fallback="AV" />
      <Avatar alt="Busy" presence="busy" fallback="BU" />
      <Avatar alt="Away" presence="away" fallback="AW" />
      <Avatar alt="Offline" presence="offline" fallback="OF" />
    </div>
  ),
}
```

---

### FE-DS-2: MessageBubble + ThreadPane

#### MessageBubble Component
```typescript
interface MessageBubbleProps {
  message: Message
  isOwn: boolean
  showAvatar?: boolean
  showTimestamp?: boolean
  onReact?: (emoji: string) => void
  onReply?: () => void
}

export function MessageBubble({ 
  message, 
  isOwn, 
  showAvatar = true,
  showTimestamp = true,
  onReact,
  onReply
}: MessageBubbleProps) {
  return (
    <div className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
      {showAvatar && (
        <Avatar 
          src={message.sender.avatar} 
          alt={message.sender.name} 
          size="sm"
          presence={message.sender.presence}
        />
      )}
      <div className="flex flex-col gap-1 max-w-md">
        <div className={`px-4 py-2 rounded-lg ${
          isOwn 
            ? 'bg-primary-500 text-white' 
            : 'bg-gray-100 text-gray-900'
        }`}>
          <p className="text-sm">{message.content}</p>
        </div>
        
        {showTimestamp && (
          <span className="text-xs text-gray-500 px-2">
            {formatRelativeTime(message.timestamp)}
          </span>
        )}
        
        {message.reactions && message.reactions.length > 0 && (
          <ReactionSummary reactions={message.reactions} onClick={onReact} />
        )}
        
        {message.threadCount > 0 && (
          <button 
            onClick={onReply}
            className="text-xs text-primary-500 hover:underline px-2"
          >
            {message.threadCount} {message.threadCount === 1 ? 'reply' : 'replies'}
          </button>
        )}
      </div>
    </div>
  )
}
```

#### Storybook Story
```typescript
// features/chat/components/message-bubble.stories.tsx
export const meta: Meta<typeof MessageBubble> = {
  title: 'Chat/MessageBubble',
  component: MessageBubble,
  tags: ['autodocs'],
}

export const Default: Story = {
  args: {
    message: {
      id: '1',
      content: 'Hello, how are you?',
      sender: {
        id: '1',
        name: 'John Doe',
        avatar: 'https://i.pravatar.cc/150?img=1',
        presence: 'available',
      },
      timestamp: new Date().toISOString(),
      reactions: [],
      threadCount: 0,
    },
    isOwn: false,
  },
}

export const OwnMessage: Story = {
  args: {
    ...Default.args,
    isOwn: true,
  },
}

export const WithReactions: Story = {
  args: {
    ...Default.args,
    message: {
      ...Default.args.message,
      reactions: [
        { emoji: '👍', count: 3, userReacted: false },
        { emoji: '❤️', count: 1, userReacted: true },
      ],
    },
  },
}

export const WithThread: Story = {
  args: {
    ...Default.args,
    message: {
      ...Default.args.message,
      threadCount: 5,
    },
  },
}
```

---

### FE-DS-3: RichTextEditor (TipTap)

#### EditorToolbar Component
```typescript
interface EditorToolbarProps {
  editor: Editor
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  if (!editor) return null
  
  return (
    <div className="border-b border-gray-200 p-2 flex gap-1">
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
        icon={<Bold size={16} />}
        label="Bold"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
        icon={<Italic size={16} />}
        label="Italic"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive('underline')}
        icon={<Underline size={16} />}
        label="Underline"
      />
      
      <Separator orientation="vertical" />
      
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive('bulletList')}
        icon={<List size={16} />}
        label="Bullet List"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive('orderedList')}
        icon={<ListOrdered size={16} />}
        label="Numbered List"
      />
      
      <Separator orientation="vertical" />
      
      <ToolbarButton
        onClick={() => editor.chain().focus().setLink({ href: '' }).run()}
        isActive={editor.isActive('link')}
        icon={<Link size={16} />}
        label="Insert Link"
      />
    </div>
  )
}
```

#### Storybook Story
```typescript
export const meta: Meta<typeof RichTextEditor> = {
  title: 'Forms/RichTextEditor',
  component: RichTextEditor,
}

export const Default: Story = {
  args: {
    placeholder: 'Type your message...',
  },
}

export const WithInitialContent: Story = {
  args: {
    initialContent: '<p>Hello <strong>world</strong>!</p>',
  },
}
```

---

### FE-DS-4: KanbanCard + TaskModal

#### KanbanCard Component
```typescript
interface KanbanCardProps {
  task: Task
  onEdit?: () => void
  onDelete?: () => void
  dragging?: boolean
}

export function KanbanCard({ task, onEdit, onDelete, dragging }: KanbanCardProps) {
  return (
    <div className={`bg-white rounded-lg shadow-sm p-3 border border-gray-200 hover:shadow-md transition-shadow ${
      dragging ? 'opacity-50 rotate-2' : ''
    }`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-medium text-sm line-clamp-2">{task.title}</h4>
        {task.priority && <PriorityBadge priority={task.priority} />}
      </div>
      
      {task.labels && task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {task.labels.slice(0, 3).map(label => (
            <LabelChip key={label.id} label={label} size="sm" />
          ))}
          {task.labels.length > 3 && (
            <span className="text-xs text-gray-500">+{task.labels.length - 3}</span>
          )}
        </div>
      )}
      
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-2">
          {task.dueDate && (
            <div className={`flex items-center gap-1 ${
              isPastDue(task.dueDate) ? 'text-error' : ''
            }`}>
              <Calendar size={12} />
              <span>{formatDate(task.dueDate, 'MMM d')}</span>
            </div>
          )}
          
          {task.attachmentCount > 0 && (
            <div className="flex items-center gap-1">
              <Paperclip size={12} />
              <span>{task.attachmentCount}</span>
            </div>
          )}
          
          {task.commentCount > 0 && (
            <div className="flex items-center gap-1">
              <MessageSquare size={12} />
              <span>{task.commentCount}</span>
            </div>
          )}
        </div>
        
        {task.assignees && task.assignees.length > 0 && (
          <AvatarStack avatars={task.assignees} max={3} size="xs" />
        )}
      </div>
      
      {task.progress > 0 && (
        <div className="mt-2">
          <ProgressBar value={task.progress} size="sm" />
        </div>
      )}
    </div>
  )
}
```

#### Storybook Story
```typescript
export const meta: Meta<typeof KanbanCard> = {
  title: 'Projects/KanbanCard',
  component: KanbanCard,
}

export const Default: Story = {
  args: {
    task: {
      id: '1',
      title: 'Implement authentication',
      priority: 'high',
      dueDate: '2024-12-31',
      assignees: [
        { id: '1', name: 'John', avatar: '...' },
        { id: '2', name: 'Jane', avatar: '...' },
      ],
      labels: [
        { id: '1', name: 'Backend', color: '#3B82F6' },
      ],
      attachmentCount: 2,
      commentCount: 5,
      progress: 60,
    },
  },
}
```

---

### FE-DS-5 to FE-DS-8: Additional Components

Similar structure for:
- **FE-DS-5**: FileCard, FileUploadZone
- **FE-DS-6**: SearchResultRow, DirectoryTreeItem
- **FE-DS-7**: Toast/Notification (Sonner customization)
- **FE-DS-8**: Design tokens documentation page

---

## Storybook Configuration

### Installation
```bash
npx storybook@latest init
```

### Configuration Files

**`.storybook/main.ts`**:
```typescript
import type { StorybookConfig } from '@storybook/nextjs'

const config: StorybookConfig = {
  stories: [
    '../components/**/*.stories.@(js|jsx|ts|tsx)',
    '../features/**/*.stories.@(js|jsx|ts|tsx)',
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y', // Accessibility testing
  ],
  framework: {
    name: '@storybook/nextjs',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
}

export default config
```

**`.storybook/preview.ts`**:
```typescript
import type { Preview } from '@storybook/react'
import '../app/globals.css' // Import Tailwind styles

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#FFFFFF' },
        { name: 'dark', value: '#111827' },
      ],
    },
  },
}

export default preview
```

---

## Component API Documentation

### Documentation Template
Each component should have:
1. **Props table**: Auto-generated by Storybook
2. **Usage examples**: Multiple story variants
3. **Accessibility notes**: ARIA attributes, keyboard support
4. **Design rationale**: Why certain decisions were made

### Example Documentation (MDX)
```mdx
import { Meta, Story, Canvas, ArgsTable } from '@storybook/addon-docs'
import { Avatar } from './avatar'

<Meta title="Components/Avatar" component={Avatar} />

# Avatar

Displays a user's profile picture with optional presence indicator.

## Usage

<Canvas>
  <Story id="components-avatar--default" />
</Canvas>

## Props

<ArgsTable of={Avatar} />

## Accessibility

- Avatar images have descriptive alt text
- Presence indicators use ARIA labels
- Color-blind safe presence colors

## Examples

### With Presence
<Canvas>
  <Story id="components-avatar--with-presence" />
</Canvas>

### Different Sizes
<Canvas>
  <Story id="components-avatar--sizes" />
</Canvas>
```

---

## Acceptance Criteria

### FE-DS-1 to FE-DS-8
- [x] All core components have Storybook stories
- [x] Stories cover all variants (sizes, states, themes)
- [x] Props documentation auto-generated
- [x] Accessibility addon shows no violations
- [x] Stories can be viewed in light/dark mode
- [x] Interactive controls work for all props

### Design Tokens
- [x] Color palette documented with hex codes
- [x] Typography scale documented with examples
- [x] Spacing scale visual reference
- [x] Component usage guidelines

---

## Deployment

### Storybook Static Build
```bash
npm run build-storybook
```

### Host on Vercel/Netlify
```yaml
# netlify.toml
[build]
  command = "npm run build-storybook"
  publish = "storybook-static"
```

Access at: `https://epop-storybook.netlify.app`

---

## References
- Storybook docs: [storybook.js.org](https://storybook.js.org/)
- shadcn/ui: [ui.shadcn.com](https://ui.shadcn.com/)
- Radix UI: [radix-ui.com](https://www.radix-ui.com/)

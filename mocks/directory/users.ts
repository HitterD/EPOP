import type { User, OrgNode } from '@/types/directory';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Alice Chen',
    email: 'alice@epop.com',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
    role: 'Senior Designer',
    department: 'Design',
    status: 'active',
    joinedAt: new Date(2023, 0, 15),
  },
  {
    id: '2',
    name: 'Bob Smith',
    email: 'bob@epop.com',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
    role: 'Backend Engineer',
    department: 'Engineering',
    status: 'active',
    joinedAt: new Date(2022, 5, 20),
  },
  {
    id: '3',
    name: 'Carol Lee',
    email: 'carol@epop.com',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carol',
    role: 'DevOps Lead',
    department: 'Engineering',
    status: 'active',
    joinedAt: new Date(2021, 8, 10),
  },
  {
    id: '4',
    name: 'Dave Wilson',
    email: 'dave@epop.com',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dave',
    role: 'Product Manager',
    department: 'Product',
    status: 'inactive',
    joinedAt: new Date(2020, 11, 5),
  },
];

export const mockOrgTree: OrgNode[] = [
  {
    id: 'epop',
    name: 'EPop Inc.',
    type: 'department',
    children: [
      {
        id: 'engineering',
        name: 'Engineering',
        type: 'department',
        children: [
          {
            id: 'frontend',
            name: 'Frontend Team',
            type: 'team',
            children: [
              { id: '1', name: 'Alice Chen', type: 'user', user: mockUsers[0] },
            ],
          },
          {
            id: 'backend',
            name: 'Backend Team',
            type: 'team',
            children: [
              { id: '2', name: 'Bob Smith', type: 'user', user: mockUsers[1] },
              { id: '3', name: 'Carol Lee', type: 'user', user: mockUsers[2] },
            ],
          },
        ],
      },
      {
        id: 'product',
        name: 'Product',
        type: 'department',
        children: [
          { id: '4', name: 'Dave Wilson', type: 'user', user: mockUsers[3] },
        ],
      },
    ],
  },
];

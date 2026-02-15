export const queryKeys = {
  categories: {
    all: ['categories'] as const,
    list: (active?: boolean) => [...queryKeys.categories.all, { active }] as const,
  },
  adminUsers: {
    all: ['adminUsers'] as const,
    list: () => [...queryKeys.adminUsers.all, 'list'] as const,
  },
  pairEvents: {
    all: ['pairEvents'] as const,
    list: () => [...queryKeys.pairEvents.all, 'list'] as const,
  },
  pair: {
    all: ['pair'] as const,
    status: () => [...queryKeys.pair.all, 'status'] as const,
  },
};

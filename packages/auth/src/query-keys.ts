export const queryKeys = {
  adminUsers: {
    all: ['adminUsers'] as const,
    list: () => [...queryKeys.adminUsers.all, 'list'] as const,
  },
};

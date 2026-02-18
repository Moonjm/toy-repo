export const queryKeys = {
  trees: ['family-trees'] as const,
  tree: (id: number) => ['family-trees', id] as const,
  members: (treeId: number) => ['family-trees', treeId, 'members'] as const,
  users: ['users'] as const,
};

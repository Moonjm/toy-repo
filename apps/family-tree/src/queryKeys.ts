export const queryKeys = {
  trees: ['family-trees'] as const,
  tree: (id: number) => ['family-trees', id] as const,
};

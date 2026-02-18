export type Gender = 'MALE' | 'FEMALE';

export type FamilyTreeRole = 'OWNER' | 'EDITOR' | 'VIEWER';

export type Person = {
  id: number;
  name: string;
  birthDate: string | null;
  deathDate: string | null;
  gender: Gender | null;
  profileImageUrl: string | null;
  memo: string | null;
};

export type PersonRequest = {
  name: string;
  birthDate?: string | null;
  deathDate?: string | null;
  gender?: Gender | null;
  profileImageId?: number | null;
  memo?: string | null;
};

export type Spouse = {
  id: number;
  personAId: number;
  personBId: number;
};

export type ParentChild = {
  id: number;
  parentId: number;
  childId: number;
};

export type FamilyTreeListItem = {
  id: number;
  name: string;
  description: string | null;
  myRole: FamilyTreeRole;
};

export type FamilyTreeDetail = {
  id: number;
  name: string;
  description: string | null;
  myRole: FamilyTreeRole;
  persons: Person[];
  spouses: Spouse[];
  parentChild: ParentChild[];
};

export type FamilyTreeRequest = {
  name: string;
  description?: string | null;
};

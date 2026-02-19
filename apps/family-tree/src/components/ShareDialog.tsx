import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TrashIcon } from '@heroicons/react/24/outline';
import { Modal, Button, Input, Select } from '@repo/ui';
import { fetchMembers, addMember, updateMemberRole, removeMember } from '../api/members';
import { fetchUsers } from '../api/users';
import { queryKeys } from '../queryKeys';
import type { FamilyTreeRole, UserItem } from '../types';

type Props = {
  treeId: number;
  open: boolean;
  onClose: () => void;
};

export default function ShareDialog({ treeId, open, onClose }: Props) {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [role, setRole] = useState<FamilyTreeRole>('VIEWER');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: membersData } = useQuery({
    queryKey: queryKeys.members(treeId),
    queryFn: () => fetchMembers(treeId),
    enabled: open,
  });

  const { data: usersData } = useQuery({
    queryKey: queryKeys.users,
    queryFn: fetchUsers,
    enabled: open,
  });

  const members = membersData?.data ?? [];
  const users = usersData?.data ?? [];

  const memberUserIds = new Set(members.map((m) => m.userId));
  const filteredUsers = users.filter(
    (u) =>
      !memberUserIds.has(u.id) &&
      (u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.username.toLowerCase().includes(search.toLowerCase()))
  );

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.members(treeId) });
  };

  const addMut = useMutation({
    mutationFn: (vars: { userId: number; role: FamilyTreeRole }) => addMember(treeId, vars),
    onSuccess: () => {
      invalidate();
      setSelectedUser(null);
      setSearch('');
      setRole('VIEWER');
    },
  });

  const updateRoleMut = useMutation({
    mutationFn: ({ memberId, newRole }: { memberId: number; newRole: FamilyTreeRole }) =>
      updateMemberRole(treeId, memberId, { role: newRole }),
    onSuccess: invalidate,
  });

  const removeMut = useMutation({
    mutationFn: (memberId: number) => removeMember(treeId, memberId),
    onSuccess: invalidate,
  });

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelectUser = (user: UserItem) => {
    setSelectedUser(user);
    setSearch(user.name);
    setShowDropdown(false);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setSelectedUser(null);
    setShowDropdown(value.length > 0);
  };

  return (
    <Modal open={open} onClose={onClose} title="공유 관리">
      {/* Add member section */}
      <div className="flex items-end gap-2 mb-4">
        <div className="relative flex-1" ref={dropdownRef}>
          <label className="block text-sm font-medium text-slate-700 mb-1">사용자 검색</label>
          <Input
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => search.length > 0 && !selectedUser && setShowDropdown(true)}
            placeholder="이름 또는 아이디 검색"
          />
          {showDropdown && filteredUsers.length > 0 && (
            <ul className="absolute z-10 mt-1 w-full max-h-40 overflow-auto rounded-xl border border-slate-200 bg-white shadow-lg">
              {filteredUsers.map((u) => (
                <li
                  key={u.id}
                  className="px-3 py-2 text-sm cursor-pointer hover:bg-slate-100"
                  onMouseDown={() => handleSelectUser(u)}
                >
                  <span className="font-medium">{u.name}</span>
                  <span className="ml-1 text-slate-400">@{u.username}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">역할</label>
          <Select value={role} onChange={(e) => setRole(e.target.value as FamilyTreeRole)}>
            <option value="EDITOR">편집자</option>
            <option value="VIEWER">뷰어</option>
          </Select>
        </div>
        <Button
          variant="primary"
          className="px-4 py-2"
          disabled={!selectedUser || addMut.isPending}
          onClick={() => addMut.mutate({ userId: selectedUser!.id, role })}
        >
          추가
        </Button>
      </div>

      {/* Member list */}
      <div>
        <h3 className="text-sm font-medium text-slate-700 mb-2">멤버 목록</h3>
        {members.length === 0 ? (
          <p className="text-sm text-slate-400">멤버가 없습니다</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {members.map((member) => (
              <li key={member.id} className="flex items-center justify-between py-2">
                <span className="text-sm text-slate-800">{member.userName}</span>
                {member.role === 'OWNER' ? (
                  <span className="text-xs text-slate-400 px-2 py-1">소유자</span>
                ) : (
                  <div className="flex items-center gap-2">
                    <Select
                      className="w-24 text-sm py-1"
                      value={member.role}
                      onChange={(e) =>
                        updateRoleMut.mutate({
                          memberId: member.id,
                          newRole: e.target.value as FamilyTreeRole,
                        })
                      }
                    >
                      <option value="EDITOR">편집자</option>
                      <option value="VIEWER">뷰어</option>
                    </Select>
                    <Button
                      variant="ghost"
                      className="p-1 text-slate-400 hover:text-rose-500"
                      onClick={() => removeMut.mutate(member.id)}
                    >
                      <TrashIcon className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Modal>
  );
}

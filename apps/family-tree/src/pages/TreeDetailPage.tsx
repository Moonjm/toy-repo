import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { fetchFamilyTree } from '../api/familyTrees';
import { createPerson } from '../api/persons';
import { queryKeys } from '../queryKeys';
import type { Person, PersonRequest } from '../types';
import TreeFlow from '../components/TreeFlow';
import SidePanel from '../components/SidePanel';
import PersonFormDialog from '../components/PersonFormDialog';
import { useQueryClient } from '@tanstack/react-query';

export default function TreeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const treeId = Number(id);

  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [showInitialForm, setShowInitialForm] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.tree(treeId),
    queryFn: () => fetchFamilyTree(treeId),
    enabled: !isNaN(treeId),
  });

  const tree = data?.data;

  // Force initial person form when tree has no persons
  useEffect(() => {
    if (tree && tree.persons.length === 0) {
      setShowInitialForm(true);
    }
  }, [tree]);

  // Keep selected person in sync with latest data
  useEffect(() => {
    if (selectedPerson && tree) {
      const updated = tree.persons.find((p) => p.id === selectedPerson.id);
      if (updated) {
        setSelectedPerson(updated);
      } else {
        setSelectedPerson(null);
      }
    }
  }, [tree, selectedPerson]);

  const handleCreateInitial = async (personData: PersonRequest) => {
    await createPerson(treeId, personData);
    void queryClient.invalidateQueries({ queryKey: queryKeys.tree(treeId) });
    setShowInitialForm(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen text-slate-400">불러오는 중...</div>
    );
  }

  if (!tree) {
    return (
      <div className="flex items-center justify-center h-screen text-slate-400">
        가계도를 찾을 수 없습니다
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-200 shadow-sm">
        <button onClick={() => navigate('/trees')} className="p-1.5 rounded-lg hover:bg-slate-100">
          <ArrowLeftIcon className="w-5 h-5 text-slate-500" />
        </button>
        <div>
          <h1 className="font-bold text-slate-800">{tree.name}</h1>
          {tree.description && <p className="text-xs text-slate-400">{tree.description}</p>}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1">
          <TreeFlow tree={tree} onSelectPerson={setSelectedPerson} />
        </div>
        {selectedPerson && (
          <SidePanel person={selectedPerson} tree={tree} onClose={() => setSelectedPerson(null)} />
        )}
      </div>

      {/* Initial Person Form */}
      {showInitialForm && (
        <PersonFormDialog
          title="첫 번째 인물 추가"
          onSubmit={handleCreateInitial}
          onClose={() => setShowInitialForm(false)}
        />
      )}
    </div>
  );
}

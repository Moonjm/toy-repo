import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeftIcon, ShareIcon } from '@heroicons/react/24/outline';
import { Button, FullPageLoader } from '@repo/ui';
import { fetchFamilyTree } from '../api/familyTrees';
import { createPerson } from '../api/persons';
import { queryKeys } from '../queryKeys';
import type { Person, PersonRequest } from '../types';
import TreeFlow from '../components/TreeFlow';
import SidePanel from '../components/SidePanel';
import PersonFormDialog from '../components/PersonFormDialog';
import ShareDialog from '../components/ShareDialog';
import { useQueryClient } from '@tanstack/react-query';

export default function TreeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const treeId = Number(id);

  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [showInitialForm, setShowInitialForm] = useState(false);
  const [showShare, setShowShare] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.tree(treeId),
    queryFn: () => fetchFamilyTree(treeId),
    enabled: !isNaN(treeId),
  });

  const tree = data?.data;

  const canEdit = tree?.myRole === 'OWNER' || tree?.myRole === 'EDITOR';

  // Force initial person form when tree has no persons (only for editors/owners)
  useEffect(() => {
    if (
      tree &&
      tree.persons.length === 0 &&
      (tree.myRole === 'OWNER' || tree.myRole === 'EDITOR')
    ) {
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
    return <FullPageLoader label="불러오는 중..." />;
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
        <Button variant="ghost" onClick={() => navigate('/trees')} className="p-1.5 rounded-lg">
          <ArrowLeftIcon className="w-5 h-5 text-slate-500" />
        </Button>
        <div className="flex-1">
          <h1 className="font-bold text-slate-800">{tree.name}</h1>
          {tree.description && <p className="text-xs text-slate-400">{tree.description}</p>}
        </div>
        {tree.myRole === 'OWNER' && (
          <Button variant="ghost" onClick={() => setShowShare(true)} className="p-1.5 rounded-lg">
            <ShareIcon className="w-5 h-5 text-slate-500" />
          </Button>
        )}
      </div>

      {/* Content */}
      <div className="relative flex flex-1 overflow-hidden">
        <div className="flex-1">
          <TreeFlow tree={tree} onSelectPerson={setSelectedPerson} />
        </div>
        {selectedPerson && (
          <>
            <div
              className="absolute inset-0 z-10 sm:hidden"
              onClick={() => setSelectedPerson(null)}
            />
            <SidePanel
              person={selectedPerson}
              tree={tree}
              onClose={() => setSelectedPerson(null)}
            />
          </>
        )}
      </div>

      {/* Initial Person Form */}
      {canEdit && showInitialForm && (
        <PersonFormDialog
          title="첫 번째 인물 추가"
          onSubmit={handleCreateInitial}
          onClose={() => setShowInitialForm(false)}
        />
      )}

      {/* Share Dialog */}
      <ShareDialog treeId={treeId} open={showShare} onClose={() => setShowShare(false)} />
    </div>
  );
}

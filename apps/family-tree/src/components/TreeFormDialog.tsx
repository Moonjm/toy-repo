import { useState } from 'react';
import { Button, FormField, Input, Modal, Textarea } from '@repo/ui';
import type { FamilyTreeRequest } from '../types';

type Props = {
  title: string;
  initial?: { name: string; description: string };
  submitLabel: string;
  pendingLabel: string;
  isPending: boolean;
  onSubmit: (data: FamilyTreeRequest) => void;
  onClose: () => void;
};

export default function TreeFormDialog({
  title,
  initial,
  submitLabel,
  pendingLabel,
  isPending,
  onSubmit,
  onClose,
}: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), description: description.trim() || null });
  };

  return (
    <Modal open onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="이름" required>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
            required
            autoFocus
          />
        </FormField>
        <FormField label="설명">
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            maxLength={500}
          />
        </FormField>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg text-sm"
          >
            취소
          </Button>
          <Button
            type="submit"
            variant="accent"
            disabled={!name.trim() || isPending}
            className="flex-1 py-2.5 rounded-lg text-sm"
          >
            {isPending ? pendingLabel : submitLabel}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

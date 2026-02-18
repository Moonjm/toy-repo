import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { DatePicker } from '@repo/ui';
import type { Person, PersonRequest, Gender } from '../types';
import { uploadFile } from '../api/files';

type Props = {
  initial?: Person | null;
  onSubmit: (data: PersonRequest) => void;
  onClose: () => void;
  title?: string;
};

export default function PersonFormDialog({ initial, onSubmit, onClose, title }: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [birthDate, setBirthDate] = useState(initial?.birthDate ?? '');
  const [deathDate, setDeathDate] = useState(initial?.deathDate ?? '');
  const [gender, setGender] = useState<Gender | ''>(initial?.gender ?? '');
  const [memo, setMemo] = useState(initial?.memo ?? '');
  const [profileImageId, setProfileImageId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fileId = await uploadFile(file);
      setProfileImageId(fileId);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || submitting) return;

    setSubmitting(true);
    try {
      const data: PersonRequest = {
        name: name.trim(),
        birthDate: birthDate || null,
        deathDate: deathDate || null,
        gender: gender || null,
        memo: memo || null,
      };
      if (profileImageId !== null) {
        data.profileImageId = profileImageId;
      }
      await onSubmit(data);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800">
            {title ?? (initial ? '인물 수정' : '인물 추가')}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100">
            <XMarkIcon className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">이름 *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
              maxLength={50}
              required
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">생년월일</label>
              <DatePicker value={birthDate} onChange={setBirthDate} placeholder="생년월일" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">사망일</label>
              <DatePicker value={deathDate} onChange={setDeathDate} placeholder="사망일" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">성별</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as Gender | '')}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="">선택 안함</option>
              <option value="MALE">남성</option>
              <option value="FEMALE">여성</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">프로필 사진</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading}
              className="w-full text-sm text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
            {uploading && <p className="text-xs text-indigo-500 mt-1">업로드 중...</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">메모</label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
              rows={3}
              maxLength={500}
            />
          </div>
          <button
            type="submit"
            disabled={!name.trim() || submitting}
            className="w-full py-2.5 bg-indigo-500 text-white rounded-lg font-medium hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? '저장 중...' : initial ? '수정' : '추가'}
          </button>
        </form>
      </div>
    </div>
  );
}

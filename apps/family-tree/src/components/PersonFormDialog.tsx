import { useState } from 'react';
import {
  Button,
  DatePicker,
  FormField,
  Input,
  Modal,
  RadioGroup,
  Select,
  Textarea,
} from '@repo/ui';
import type { Person, PersonRequest, Gender, CalendarType } from '../types';
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
  const [birthDateType, setBirthDateType] = useState<CalendarType>(
    initial?.birthDateType ?? 'SOLAR'
  );
  const [deathDate, setDeathDate] = useState(initial?.deathDate ?? '');
  const [gender, setGender] = useState<Gender | ''>(initial?.gender ?? '');
  const [memo, setMemo] = useState(initial?.memo ?? '');
  // undefined = unchanged, null = explicitly removed, number = new image
  const [profileImageId, setProfileImageId] = useState<number | null | undefined>(undefined);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const hasExistingImage = initial?.profileImageUrl && profileImageId === undefined;

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
        birthDateType: birthDate ? birthDateType : null,
        deathDate: deathDate || null,
        gender: gender || null,
        memo: memo || null,
      };
      if (profileImageId !== undefined) {
        data.profileImageId = profileImageId;
      }
      await onSubmit(data);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open onClose={onClose} title={title ?? (initial ? '인물 수정' : '인물 추가')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="이름" required>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={50}
            required
            autoFocus
          />
        </FormField>
        <div className="space-y-1">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="생년월일">
              <DatePicker value={birthDate} onChange={setBirthDate} placeholder="생년월일" />
            </FormField>
            <FormField label="사망일">
              <DatePicker value={deathDate} onChange={setDeathDate} placeholder="사망일" />
            </FormField>
          </div>
          {birthDate && (
            <RadioGroup
              name="birthDateType"
              value={birthDateType}
              onChange={setBirthDateType}
              options={[
                { value: 'SOLAR', label: '양력' },
                { value: 'LUNAR', label: '음력' },
              ]}
              className="pl-1"
            />
          )}
        </div>
        <FormField label="성별">
          <Select value={gender} onChange={(e) => setGender(e.target.value as Gender | '')}>
            <option value="">선택 안함</option>
            <option value="MALE">남성</option>
            <option value="FEMALE">여성</option>
          </Select>
        </FormField>
        <FormField label="프로필 사진" hint={uploading ? '업로드 중...' : undefined}>
          {hasExistingImage && (
            <div className="flex items-center gap-2 mb-2">
              <img
                src={initial.profileImageUrl!}
                alt="프로필"
                className="w-10 h-10 rounded-full object-cover border border-slate-200"
              />
              <span className="text-xs text-slate-500 flex-1">기존 사진</span>
              <Button
                type="button"
                variant="none"
                size="sm"
                onClick={() => setProfileImageId(null)}
                className="hover:bg-slate-100 text-rose-500 hover:text-rose-600"
              >
                삭제
              </Button>
            </div>
          )}
          {profileImageId === null && initial?.profileImageUrl && (
            <p className="text-xs text-slate-400 mb-2">사진이 삭제됩니다</p>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="w-full text-sm text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
        </FormField>
        <FormField label="메모">
          <Textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            rows={3}
            maxLength={500}
          />
        </FormField>
        <Button
          type="submit"
          variant="accent"
          size="lg"
          disabled={!name.trim() || submitting}
          className="w-full"
        >
          {submitting ? '저장 중...' : initial ? '수정' : '추가'}
        </Button>
      </form>
    </Modal>
  );
}

import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { Person } from '../types';

type PersonNodeData = { person: Person };

export default function PersonNode({ data }: NodeProps) {
  const { person } = data as PersonNodeData;
  const isMale = person.gender === 'MALE';
  const isFemale = person.gender === 'FEMALE';

  return (
    <>
      <Handle type="target" position={Position.Top} className="!bg-slate-400 !w-2 !h-2" />
      <div
        className={`
          px-4 py-3 rounded-xl shadow-md bg-white border-2 w-[200px] text-center
          transition-colors cursor-pointer hover:shadow-lg
          ${isMale ? 'border-blue-400' : isFemale ? 'border-pink-400' : 'border-slate-300'}
        `}
      >
        {person.profileImageUrl && (
          <img
            src={person.profileImageUrl}
            alt={person.name}
            className="w-10 h-10 rounded-full mx-auto mb-1 object-cover"
          />
        )}
        <div className="font-semibold text-sm text-slate-800 truncate">{person.name}</div>
        {(person.birthDate || person.deathDate) && (
          <div className="text-xs text-slate-400 mt-0.5">
            {person.birthDate ?? '?'}
            {person.deathDate && ` ~ ${person.deathDate}`}
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-slate-400 !w-2 !h-2" />
    </>
  );
}

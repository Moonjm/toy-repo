import { Handle, Position, type NodeProps } from '@xyflow/react';

export default function CoupleNode(_props: NodeProps) {
  return (
    <>
      <Handle type="target" position={Position.Left} className="!bg-transparent !border-0" />
      <Handle
        type="target"
        position={Position.Right}
        id="right"
        className="!bg-transparent !border-0"
      />
      <div className="w-4 h-4 rounded-full bg-slate-300 border-2 border-slate-400" />
      <Handle type="source" position={Position.Bottom} className="!bg-slate-400 !w-2 !h-2" />
    </>
  );
}

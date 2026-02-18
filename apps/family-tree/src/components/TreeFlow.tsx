import { useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  type NodeTypes,
  type NodeMouseHandler,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { Person, FamilyTreeDetail } from '../types';
import { useTreeLayout } from '../hooks/useTreeLayout';
import PersonNode from './PersonNode';
import CoupleNode from './CoupleNode';

const nodeTypes: NodeTypes = {
  person: PersonNode,
  couple: CoupleNode,
};

type Props = {
  tree: FamilyTreeDetail;
  onSelectPerson: (person: Person) => void;
};

export default function TreeFlow({ tree, onSelectPerson }: Props) {
  const { nodes, edges } = useTreeLayout({
    persons: tree.persons,
    spouses: tree.spouses,
    parentChild: tree.parentChild,
  });

  const handleNodeClick: NodeMouseHandler = useCallback(
    (_event, node) => {
      if (node.type === 'person') {
        const person = (node.data as { person: Person }).person;
        onSelectPerson(person);
      }
    },
    [onSelectPerson]
  );

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={handleNodeClick}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.2}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={20} size={1} color="#e2e8f0" />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}

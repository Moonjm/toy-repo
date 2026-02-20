import { useMemo } from 'react';
import dagre from '@dagrejs/dagre';
import type { Node, Edge } from '@xyflow/react';
import type { Person, Spouse, ParentChild } from '../types';

const PERSON_WIDTH = 200;
const PERSON_HEIGHT = 80;
const COUPLE_SIZE = 16;
const COUPLE_GAP = 40;
const COUPLE_BLOCK_WIDTH = PERSON_WIDTH * 2 + COUPLE_GAP + COUPLE_SIZE;

function compareBirthDate(
  a: { birthDate?: string | null; fallback: string | number },
  b: { birthDate?: string | null; fallback: string | number }
): number {
  const dateA = a.birthDate ?? '';
  const dateB = b.birthDate ?? '';
  if (!dateA && !dateB) return String(a.fallback).localeCompare(String(b.fallback));
  if (!dateA) return 1;
  if (!dateB) return -1;
  return dateA.localeCompare(dateB);
}

type LayoutInput = {
  persons: Person[];
  spouses: Spouse[];
  parentChild: ParentChild[];
};

type TreeContext = {
  personMap: Map<number, Person>;
  spouseOf: Map<number, number>;
  coupleIds: Map<string, { minId: number; maxId: number }>;
  inCouple: Set<number>;
  childParents: Map<number, number[]>;
  spouseLookup: Map<number, Set<number>>;
};

function buildLookups(
  persons: Person[],
  spouses: Spouse[],
  parentChild: ParentChild[]
): TreeContext {
  const personMap = new Map(persons.map((p) => [p.id, p]));

  const spouseOf = new Map<number, number>();
  const coupleIds = new Map<string, { minId: number; maxId: number }>();
  for (const s of spouses) {
    const minId = Math.min(s.personAId, s.personBId);
    const maxId = Math.max(s.personAId, s.personBId);
    spouseOf.set(minId, maxId);
    spouseOf.set(maxId, minId);
    coupleIds.set(`couple:${minId}:${maxId}`, { minId, maxId });
  }

  const inCouple = new Set<number>();
  for (const s of spouses) {
    inCouple.add(s.personAId);
    inCouple.add(s.personBId);
  }

  const childParents = new Map<number, number[]>();
  for (const pc of parentChild) {
    if (!childParents.has(pc.childId)) childParents.set(pc.childId, []);
    childParents.get(pc.childId)!.push(pc.parentId);
  }

  const spouseLookup = new Map<number, Set<number>>();
  for (const s of spouses) {
    if (!spouseLookup.has(s.personAId)) spouseLookup.set(s.personAId, new Set());
    if (!spouseLookup.has(s.personBId)) spouseLookup.set(s.personBId, new Set());
    spouseLookup.get(s.personAId)!.add(s.personBId);
    spouseLookup.get(s.personBId)!.add(s.personAId);
  }

  return { personMap, spouseOf, coupleIds, inCouple, childParents, spouseLookup };
}

function dagreNodeId(personId: number, spouseOf: Map<number, number>): string {
  const sid = spouseOf.get(personId);
  if (sid !== undefined) {
    const minId = Math.min(personId, sid);
    const maxId = Math.max(personId, sid);
    return `couple:${minId}:${maxId}`;
  }
  return `person:${personId}`;
}

function buildDagreGraph(
  ctx: TreeContext,
  persons: Person[],
  spouses: Spouse[],
  parentChild: ParentChild[]
): { graph: dagre.graphlib.Graph; addedEdges: Set<string> } {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'TB', nodesep: 80, ranksep: 120 });

  // Add couple blocks as wide nodes
  const processedCouples = new Set<string>();
  for (const s of spouses) {
    const minId = Math.min(s.personAId, s.personBId);
    const maxId = Math.max(s.personAId, s.personBId);
    const coupleId = `couple:${minId}:${maxId}`;
    if (processedCouples.has(coupleId)) continue;
    processedCouples.add(coupleId);
    g.setNode(coupleId, { width: COUPLE_BLOCK_WIDTH, height: PERSON_HEIGHT });
  }

  // Add standalone person nodes (not in any couple)
  for (const p of persons) {
    if (!ctx.inCouple.has(p.id)) {
      g.setNode(`person:${p.id}`, { width: PERSON_WIDTH, height: PERSON_HEIGHT });
    }
  }

  // Sort parentChild by child's birthDate for left-to-right sibling order
  const sortedParentChild = [...parentChild].sort((a, b) =>
    compareBirthDate(
      { birthDate: ctx.personMap.get(a.childId)?.birthDate, fallback: a.childId },
      { birthDate: ctx.personMap.get(b.childId)?.birthDate, fallback: b.childId }
    )
  );

  // Add parent-child edges to dagre
  const addedEdges = new Set<string>();
  for (const pc of sortedParentChild) {
    const parents = ctx.childParents.get(pc.childId) ?? [];

    let sourceId: string;
    if (parents.length === 2) {
      const [p1, p2] = parents;
      if (ctx.spouseLookup.get(p1)?.has(p2)) {
        const minId = Math.min(p1, p2);
        const maxId = Math.max(p1, p2);
        sourceId = `couple:${minId}:${maxId}`;
      } else {
        sourceId = dagreNodeId(pc.parentId, ctx.spouseOf);
      }
    } else {
      sourceId = dagreNodeId(pc.parentId, ctx.spouseOf);
    }

    const targetId = dagreNodeId(pc.childId, ctx.spouseOf);
    const edgeKey = `${sourceId}->${targetId}`;
    if (addedEdges.has(edgeKey)) continue;
    addedEdges.add(edgeKey);

    if (sourceId !== targetId) {
      g.setEdge(sourceId, targetId);
    }
  }

  return { graph: g, addedEdges };
}

function correctSiblingOrder(
  graph: dagre.graphlib.Graph,
  addedEdges: Set<string>,
  personMap: Map<number, Person>
): void {
  const parentToChildren = new Map<string, string[]>();
  for (const edgeKey of addedEdges) {
    const [sourceId, targetId] = edgeKey.split('->');
    if (!parentToChildren.has(sourceId)) parentToChildren.set(sourceId, []);
    parentToChildren.get(sourceId)!.push(targetId);
  }

  for (const [, children] of parentToChildren) {
    if (children.length < 2) continue;

    const childInfo = children.map((nodeId) => {
      let representativeId: number;
      if (nodeId.startsWith('couple:')) {
        const parts = nodeId.split(':');
        representativeId = Number(parts[1]);
      } else {
        representativeId = Number(nodeId.split(':')[1]);
      }
      const person = personMap.get(representativeId);
      const node = graph.node(nodeId);
      return {
        nodeId,
        birthDate: person?.birthDate ?? '',
        width: node?.width ?? PERSON_WIDTH,
      };
    });

    childInfo.sort((a, b) =>
      compareBirthDate(
        { birthDate: a.birthDate, fallback: a.nodeId },
        { birthDate: b.birthDate, fallback: b.nodeId }
      )
    );

    const groupCenter =
      children.reduce((sum, id) => sum + (graph.node(id)?.x ?? 0), 0) / children.length;

    const nodesep = 80;
    const totalWidth =
      childInfo.reduce((sum, c) => sum + c.width, 0) + (childInfo.length - 1) * nodesep;
    let curX = groupCenter - totalWidth / 2;

    for (const child of childInfo) {
      const node = graph.node(child.nodeId);
      if (node) {
        node.x = curX + child.width / 2;
        curX += child.width + nodesep;
      }
    }
  }
}

function buildFlowElements(
  graph: dagre.graphlib.Graph,
  ctx: TreeContext,
  persons: Person[],
  parentChild: ParentChild[]
): { nodes: Node[]; edges: Edge[] } {
  const flowNodes: Node[] = [];
  const flowEdges: Edge[] = [];

  // Expand couple blocks into personA + coupleCircle + personB
  for (const [coupleId, { minId, maxId }] of ctx.coupleIds) {
    const pos = graph.node(coupleId);
    if (!pos) continue;

    const centerX = pos.x;
    const centerY = pos.y;

    const personA = ctx.personMap.get(minId);
    const personB = ctx.personMap.get(maxId);

    const aIsMale = personA?.gender === 'MALE';
    const bIsMale = personB?.gender === 'MALE';

    let leftId: number, rightId: number;
    if (aIsMale && !bIsMale) {
      leftId = minId;
      rightId = maxId;
    } else if (bIsMale && !aIsMale) {
      leftId = maxId;
      rightId = minId;
    } else {
      leftId = minId;
      rightId = maxId;
    }

    flowNodes.push(
      {
        id: `person:${leftId}`,
        type: 'person',
        data: { person: ctx.personMap.get(leftId)! },
        position: {
          x: centerX - COUPLE_BLOCK_WIDTH / 2,
          y: centerY - PERSON_HEIGHT / 2,
        },
      },
      {
        id: coupleId,
        type: 'couple',
        data: { personAId: minId, personBId: maxId },
        position: {
          x: centerX - COUPLE_SIZE / 2,
          y: centerY - COUPLE_SIZE / 2,
        },
      },
      {
        id: `person:${rightId}`,
        type: 'person',
        data: { person: ctx.personMap.get(rightId)! },
        position: {
          x: centerX + COUPLE_BLOCK_WIDTH / 2 - PERSON_WIDTH,
          y: centerY - PERSON_HEIGHT / 2,
        },
      }
    );

    flowEdges.push(
      {
        id: `e:${leftId}-${coupleId}`,
        source: `person:${leftId}`,
        target: coupleId,
        type: 'straight',
        style: { stroke: '#94a3b8', strokeWidth: 2 },
      },
      {
        id: `e:${coupleId}-${rightId}`,
        source: coupleId,
        target: `person:${rightId}`,
        type: 'straight',
        style: { stroke: '#94a3b8', strokeWidth: 2 },
      }
    );
  }

  // Add standalone person nodes
  for (const p of persons) {
    if (ctx.inCouple.has(p.id)) continue;
    const pos = graph.node(`person:${p.id}`);
    if (!pos) continue;
    flowNodes.push({
      id: `person:${p.id}`,
      type: 'person',
      data: { person: p },
      position: {
        x: pos.x - PERSON_WIDTH / 2,
        y: pos.y - PERSON_HEIGHT / 2,
      },
    });
  }

  // Add parent-child edges
  for (const pc of parentChild) {
    const parents = ctx.childParents.get(pc.childId) ?? [];

    let fromCouple = false;
    if (parents.length === 2) {
      const [p1, p2] = parents;
      if (ctx.spouseLookup.get(p1)?.has(p2)) {
        fromCouple = true;
      }
    }

    if (fromCouple) {
      const [p1, p2] = parents;
      const minId = Math.min(p1, p2);
      const maxId = Math.max(p1, p2);
      const coupleId = `couple:${minId}:${maxId}`;
      const edgeId = `e:${coupleId}-child:${pc.childId}`;

      if (!flowEdges.some((e) => e.id === edgeId)) {
        flowEdges.push({
          id: edgeId,
          source: coupleId,
          target: `person:${pc.childId}`,
          type: 'smoothstep',
          style: { stroke: '#64748b', strokeWidth: 2 },
        });
      }
    } else {
      flowEdges.push({
        id: `e:parent:${pc.parentId}-child:${pc.childId}`,
        source: `person:${pc.parentId}`,
        target: `person:${pc.childId}`,
        type: 'smoothstep',
        style: { stroke: '#64748b', strokeWidth: 2 },
      });
    }
  }

  return { nodes: flowNodes, edges: flowEdges };
}

export function useTreeLayout({ persons, spouses, parentChild }: LayoutInput) {
  return useMemo(() => {
    if (persons.length === 0) return { nodes: [], edges: [] };

    const ctx = buildLookups(persons, spouses, parentChild);
    const { graph, addedEdges } = buildDagreGraph(ctx, persons, spouses, parentChild);
    dagre.layout(graph);
    correctSiblingOrder(graph, addedEdges, ctx.personMap);
    return buildFlowElements(graph, ctx, persons, parentChild);
  }, [persons, spouses, parentChild]);
}

import { useMemo } from 'react';
import dagre from '@dagrejs/dagre';
import type { Node, Edge } from '@xyflow/react';
import type { Person, Spouse, ParentChild } from '../types';

const PERSON_WIDTH = 200;
const PERSON_HEIGHT = 80;
const COUPLE_SIZE = 16;
const COUPLE_GAP = 40;
const COUPLE_BLOCK_WIDTH = PERSON_WIDTH * 2 + COUPLE_GAP + COUPLE_SIZE;

type LayoutInput = {
  persons: Person[];
  spouses: Spouse[];
  parentChild: ParentChild[];
};

export function useTreeLayout({ persons, spouses, parentChild }: LayoutInput) {
  return useMemo(() => {
    if (persons.length === 0) return { nodes: [], edges: [] };

    const personMap = new Map(persons.map((p) => [p.id, p]));

    // Build spouse lookup
    const spouseOf = new Map<number, number>();
    const coupleIds = new Map<string, { minId: number; maxId: number }>();

    for (const s of spouses) {
      const minId = Math.min(s.personAId, s.personBId);
      const maxId = Math.max(s.personAId, s.personBId);
      spouseOf.set(minId, maxId);
      spouseOf.set(maxId, minId);
      coupleIds.set(`couple:${minId}:${maxId}`, { minId, maxId });
    }

    // Determine which persons are in a couple
    const inCouple = new Set<number>();
    for (const s of spouses) {
      inCouple.add(s.personAId);
      inCouple.add(s.personBId);
    }

    // Build parentChild lookup: childId → parentIds
    const childParents = new Map<number, number[]>();
    for (const pc of parentChild) {
      if (!childParents.has(pc.childId)) childParents.set(pc.childId, []);
      childParents.get(pc.childId)!.push(pc.parentId);
    }

    // Build spouse lookup for couple checking
    const spouseLookup = new Map<number, Set<number>>();
    for (const s of spouses) {
      if (!spouseLookup.has(s.personAId)) spouseLookup.set(s.personAId, new Set());
      if (!spouseLookup.has(s.personBId)) spouseLookup.set(s.personBId, new Set());
      spouseLookup.get(s.personAId)!.add(s.personBId);
      spouseLookup.get(s.personBId)!.add(s.personAId);
    }

    // === Build dagre graph ===
    // Key insight: register couple as ONE wide node in dagre, expand to 3 nodes after layout
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
      if (!inCouple.has(p.id)) {
        g.setNode(`person:${p.id}`, { width: PERSON_WIDTH, height: PERSON_HEIGHT });
      }
    }

    // Helper: get dagre node ID for a person
    function dagreNodeId(personId: number): string {
      const sid = spouseOf.get(personId);
      if (sid !== undefined) {
        const minId = Math.min(personId, sid);
        const maxId = Math.max(personId, sid);
        return `couple:${minId}:${maxId}`;
      }
      return `person:${personId}`;
    }

    // Sort parentChild by child's birthDate (nulls last) for left-to-right sibling order
    const sortedParentChild = [...parentChild].sort((a, b) => {
      const personA = personMap.get(a.childId);
      const personB = personMap.get(b.childId);
      const dateA = personA?.birthDate ?? '';
      const dateB = personB?.birthDate ?? '';
      if (!dateA && !dateB) return a.childId - b.childId;
      if (!dateA) return 1;
      if (!dateB) return -1;
      return dateA.localeCompare(dateB);
    });

    // Add parent-child edges to dagre (order determines left-to-right placement)
    const addedDagreEdges = new Set<string>();
    for (const pc of sortedParentChild) {
      const parents = childParents.get(pc.childId) ?? [];

      let sourceId: string;

      // If both parents are spouses → edge from couple node
      if (parents.length === 2) {
        const [p1, p2] = parents;
        if (spouseLookup.get(p1)?.has(p2)) {
          const minId = Math.min(p1, p2);
          const maxId = Math.max(p1, p2);
          sourceId = `couple:${minId}:${maxId}`;
        } else {
          sourceId = dagreNodeId(pc.parentId);
        }
      } else {
        sourceId = dagreNodeId(pc.parentId);
      }

      const targetId = dagreNodeId(pc.childId);
      const edgeKey = `${sourceId}->${targetId}`;
      if (addedDagreEdges.has(edgeKey)) continue;
      addedDagreEdges.add(edgeKey);

      if (sourceId !== targetId) {
        g.setEdge(sourceId, targetId);
      }
    }

    dagre.layout(g);

    // === Post-layout: correct sibling X order by birthDate ===
    // dagre doesn't guarantee left-to-right order based on edge addition order,
    // so we collect siblings per parent, sort by birthDate, and reassign X positions.
    const parentToChildren = new Map<string, string[]>();
    for (const edgeKey of addedDagreEdges) {
      const [sourceId, targetId] = edgeKey.split('->');
      if (!parentToChildren.has(sourceId)) parentToChildren.set(sourceId, []);
      parentToChildren.get(sourceId)!.push(targetId);
    }

    for (const [, children] of parentToChildren) {
      if (children.length < 2) continue;

      // Get node info with birthDate and width
      const childInfo = children.map((nodeId) => {
        let representativeId: number;
        if (nodeId.startsWith('couple:')) {
          const parts = nodeId.split(':');
          representativeId = Number(parts[1]); // use minId
        } else {
          representativeId = Number(nodeId.split(':')[1]);
        }
        const person = personMap.get(representativeId);
        const node = g.node(nodeId);
        return {
          nodeId,
          birthDate: person?.birthDate ?? '',
          width: node?.width ?? PERSON_WIDTH,
        };
      });

      // Sort by birthDate (earlier = left), nulls last, tie-break by node ID
      childInfo.sort((a, b) => {
        if (!a.birthDate && !b.birthDate) return a.nodeId.localeCompare(b.nodeId);
        if (!a.birthDate) return 1;
        if (!b.birthDate) return -1;
        return a.birthDate.localeCompare(b.birthDate);
      });

      // Compute current group center
      const groupCenter =
        children.reduce((sum, id) => sum + (g.node(id)?.x ?? 0), 0) / children.length;

      // Re-layout left-to-right with actual widths, centered on group center
      const nodesep = 80;
      const totalWidth =
        childInfo.reduce((sum, c) => sum + c.width, 0) + (childInfo.length - 1) * nodesep;
      let curX = groupCenter - totalWidth / 2;

      for (const child of childInfo) {
        const node = g.node(child.nodeId);
        if (node) {
          node.x = curX + child.width / 2;
          curX += child.width + nodesep;
        }
      }
    }

    // === Build React Flow nodes ===
    const flowNodes: Node[] = [];
    const flowEdges: Edge[] = [];

    // Expand couple blocks into personA + coupleCircle + personB
    for (const [coupleId, { minId, maxId }] of coupleIds) {
      const pos = g.node(coupleId);
      if (!pos) continue;

      const centerX = pos.x;
      const centerY = pos.y;

      const personA = personMap.get(minId);
      const personB = personMap.get(maxId);

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

      // Left person
      flowNodes.push({
        id: `person:${leftId}`,
        type: 'person',
        data: { person: personMap.get(leftId)! },
        position: {
          x: centerX - COUPLE_BLOCK_WIDTH / 2,
          y: centerY - PERSON_HEIGHT / 2,
        },
      });

      // Couple circle
      flowNodes.push({
        id: coupleId,
        type: 'couple',
        data: { personAId: minId, personBId: maxId },
        position: {
          x: centerX - COUPLE_SIZE / 2,
          y: centerY - COUPLE_SIZE / 2,
        },
      });

      // Right person
      flowNodes.push({
        id: `person:${rightId}`,
        type: 'person',
        data: { person: personMap.get(rightId)! },
        position: {
          x: centerX + COUPLE_BLOCK_WIDTH / 2 - PERSON_WIDTH,
          y: centerY - PERSON_HEIGHT / 2,
        },
      });

      // Spouse connection edges
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
      if (inCouple.has(p.id)) continue;
      const pos = g.node(`person:${p.id}`);
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

    // Add parent-child edges (React Flow)
    for (const pc of parentChild) {
      const parents = childParents.get(pc.childId) ?? [];

      let fromCouple = false;
      if (parents.length === 2) {
        const [p1, p2] = parents;
        if (spouseLookup.get(p1)?.has(p2)) {
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
  }, [persons, spouses, parentChild]);
}

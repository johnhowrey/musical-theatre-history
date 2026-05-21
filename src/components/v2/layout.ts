import type { Graph, GraphNode, GraphLine } from './graph';

export interface LaidOutNode extends GraphNode {
  x: number;
  y: number;
}

export interface LayoutResult {
  nodes: LaidOutNode[];
  lines: GraphLine[];
  width: number;
  height: number;
}

interface SimNode extends LaidOutNode {
  vx: number;
  vy: number;
}

interface LayoutOptions {
  width: number;
  height: number;
  iterations: number;
  /** Strength of pair repulsion (Coulomb) */
  repulsion: number;
  /** Spring strength along each line */
  springK: number;
  /** Target spring length */
  springLen: number;
  /** Velocity damping per tick */
  damping: number;
  /** Center pull strength (keeps the cluster on canvas) */
  centerPull: number;
}

const DEFAULTS: LayoutOptions = {
  width: 2000,
  height: 1400,
  iterations: 500,
  repulsion: 14000,
  springK: 0.06,
  springLen: 130,
  damping: 0.82,
  centerPull: 0.006,
};

/**
 * Force-directed layout. Each show is a node; consecutive shows on a creator's
 * line are connected by a spring. Nodes repel each other. Single pass — runs
 * iterations until convergence (or budget exhausted).
 */
export function layout(graph: Graph, options: Partial<LayoutOptions> = {}): LayoutResult {
  const opts = { ...DEFAULTS, ...options };
  const cx = opts.width / 2;
  const cy = opts.height / 2;

  // Initialize: spread nodes in a sunflower-ish pattern around center
  const sim: SimNode[] = graph.nodes.map((n, i) => {
    const theta = i * 2.399; // golden-angle radians
    const r = Math.sqrt(i) * 28;
    return {
      ...n,
      x: cx + Math.cos(theta) * r,
      y: cy + Math.sin(theta) * r,
      vx: 0,
      vy: 0,
    };
  });
  const idx = new Map(sim.map(n => [n.id, n] as const));

  // Build the spring list once: every consecutive pair on every line
  type Spring = { a: SimNode; b: SimNode };
  const springs: Spring[] = [];
  for (const line of graph.lines) {
    for (let i = 0; i < line.showIds.length - 1; i++) {
      const a = idx.get(line.showIds[i]);
      const b = idx.get(line.showIds[i + 1]);
      if (a && b) springs.push({ a, b });
    }
  }

  for (let tick = 0; tick < opts.iterations; tick++) {
    // Repulsion (O(n²) — fine for ~800 nodes, one-time cost)
    for (let i = 0; i < sim.length; i++) {
      const a = sim[i];
      for (let j = i + 1; j < sim.length; j++) {
        const b = sim[j];
        let dx = a.x - b.x;
        let dy = a.y - b.y;
        let d2 = dx * dx + dy * dy;
        if (d2 < 1) { d2 = 1; dx = Math.random() - 0.5; dy = Math.random() - 0.5; }
        const force = opts.repulsion / d2;
        const d = Math.sqrt(d2);
        const fx = (dx / d) * force;
        const fy = (dy / d) * force;
        a.vx += fx; a.vy += fy;
        b.vx -= fx; b.vy -= fy;
      }
    }

    // Springs
    for (const { a, b } of springs) {
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const d = Math.sqrt(dx * dx + dy * dy) || 1;
      const force = (d - opts.springLen) * opts.springK;
      const fx = (dx / d) * force;
      const fy = (dy / d) * force;
      a.vx += fx; a.vy += fy;
      b.vx -= fx; b.vy -= fy;
    }

    // Center pull + damping + integrate
    for (const n of sim) {
      n.vx += (cx - n.x) * opts.centerPull;
      n.vy += (cy - n.y) * opts.centerPull;
      n.vx *= opts.damping;
      n.vy *= opts.damping;
      n.x += n.vx;
      n.y += n.vy;
    }
  }

  // Strip sim fields
  const nodes: LaidOutNode[] = sim.map(({ vx: _vx, vy: _vy, ...rest }) => {
    void _vx; void _vy;
    return rest;
  });

  return { nodes, lines: graph.lines, width: opts.width, height: opts.height };
}

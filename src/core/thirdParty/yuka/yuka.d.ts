export interface HeuristicPolicy {
	calculate: (graph: Graph, source: number, target: number) => number;
}

export class Node {
	constructor(index: number);
}
export class Edge {
	constructor(from: number, to: number, cost: number);
	copy(edge: Edge): Edge;
	clone(): Edge;
}

export class Graph {
	constructor();
	addNode(node: Node): void;
	addEdge(edge: Edge): void;
	getNode(index: number): Node | undefined;
	getEdge(from: number, to: number): Edge | undefined;
	getNodes(result: Array<Node>): Array<Node>;
	getEdgesOfNode(index: number, result: Array<Node>): Array<Node>;
	getNodeCount(): number;
	getEdgeCount(): number;
	removeNode(node: Node): Graph;
	removeEdge(edge: Edge): Graph;
	hasNode(index: number): boolean;
	hasEdge(from: number, to: number): boolean;
	clear(): void;
}

export class AStar {
	public heuristic: HeuristicPolicy;
	constructor(graph: Graph, source: number, target: number);
	search(): void;
	getPath(): Array<number>;
	getSearchTree(): Array<Edge>;
	clear(): void;
}

// import {action, makeObservable, observable, override} from 'mobx';
// import {Helper} from './helpers/Helper';
// import {Interpreter} from './Interpreter';
// // import {
// // 	AllNode,
// // 	ConvChainNode,
// // 	ConvolutionNode,
// // 	MapNode,
// // 	OneNode,
// // 	PathNode,
// // 	WFCNode,
// // 	RuleNode,
// // 	SequenceNode,
// // 	MarkovNode,
// // 	Branch,
// // 	Node,
// // 	ParallelNode,
// // 	TileNode,
// // 	OverlapNode,
// // 	AndNode,
// // } from './nodes';
// import {AllNode} from './nodes/All';
// import {AndNode} from './nodes/And';
// import {Branch} from './nodes/Branch';
// import {ConvChainNode} from './nodes/ConvChain';
// import {ConvolutionNode} from './nodes/Convolution';
// // import {EventNode} from './nodes/extensions/Event';
// // import {LogNode} from './nodes/extensions/Log';
// import {MapNode} from './nodes/Map';
// import {MarkovNode} from './nodes/Markov';
// import {Node} from './nodes/Node';
// import {OneNode} from './nodes/One';
// import {OverlapNode} from './nodes/Overlap';
// import {ParallelNode} from './nodes/Parallel';
// import {PathNode} from './nodes/Path';
// import {RuleNode} from './nodes/Rule';
// // import {ScopeNode} from './nodes/Scope';
// import {SequenceNode} from './nodes/Sequence';
// import {TileNode} from './nodes/Tile';
// import {WFCNode} from './nodes/WFC';

// export type NodeWithDepth = {
// 	node: Node;
// 	parentIndex: number;
// 	depth: number;
// 	index: number;
// 	isLastChild: boolean;
// };

// export type NodeStateInfo = {
// 	state: NodeState;
// 	parentIndex: number;
// 	depth: number;
// 	index: number;
// 	breakpoint: boolean;
// 	isLastChild: boolean;
// };

// export class NodeState<T extends Node = Node> {
// 	public node: T;
// 	@observable
// 	public isCurrent: boolean;

// 	constructor(node: T) {
// 		this.node = node;
// 		this.isCurrent = false;
// 		makeObservable(this);
// 	}

// 	public static traverse(ip: Interpreter) {
// 		const visited: NodeStateInfo[] = [];
// 		if (!ip.root) {
// 			console.error('no root node');
// 			return;
// 		}
// 		const stack: NodeWithDepth[] = [
// 			{
// 				node: ip.root,
// 				depth: 0,
// 				index: 0,
// 				parentIndex: -1,
// 				isLastChild: false,
// 			},
// 		];

// 		while (stack.length) {
// 			const {node, depth, parentIndex, index, isLastChild} = stack.pop()!;
// 			const state = this.factory(node);

// 			visited.push({
// 				state,
// 				depth,
// 				index,
// 				parentIndex,
// 				isLastChild,
// 				breakpoint: false,
// 			});

// 			if (node instanceof Branch) {
// 				for (let index = node.children.length - 1; index >= 0; index--) {
// 					stack.push({
// 						node: node.children[index],
// 						depth: depth + 1,
// 						index,
// 						parentIndex: visited.length - 1,
// 						isLastChild: index === node.children.length - 1,
// 					});
// 				}
// 			}
// 		}

// 		return visited;
// 	}

// 	// well
// 	private static factory(node: Node): NodeState {
// 		if (node instanceof AndNode) return new AndState(node);
// 		if (node instanceof MarkovNode) return new MarkovState(node);
// 		if (node instanceof SequenceNode) return new SequenceState(node);
// 		if (node instanceof ConvolutionNode) return new ConvolutionState(node);
// 		if (node instanceof ConvChainNode) return new ConvChainState(node);
// 		if (node instanceof MapNode) return new MapState(node);
// 		if (node instanceof PathNode) return new PathState(node);
// 		if (node instanceof AllNode) return new AllState(node);
// 		if (node instanceof OneNode) return new OneState(node);
// 		if (node instanceof ParallelNode) return new ParallelState(node);
// 		if (node instanceof TileNode) return new TileState(node);
// 		if (node instanceof OverlapNode) return new OverlapState(node);

// 		return new NodeState(node);
// 	}

// 	@action
// 	sync() {}

// 	get name(): string {
// 		return this.node.source?.tagName || 'no-name';
// 	}
// }

// abstract class BranchState<T extends Branch> extends NodeState<T> {
// 	@observable
// 	public index: number = -1;

// 	constructor(node: T) {
// 		super(node);
// 		makeObservable(this);
// 	}

// 	@override
// 	override sync() {}
// }

// export class SequenceState extends BranchState<SequenceNode> {
// 	override get name() {
// 		return 'sequence';
// 	}
// }

// export class MarkovState extends BranchState<MarkovNode> {
// 	override get name(): string {
// 		return 'markov';
// 	}
// }

// export class AndState extends BranchState<AndNode> {
// 	override get name(): string {
// 		return 'and';
// 	}
// }

// export class ConvChainState extends NodeState<ConvChainNode> {
// 	@observable
// 	public steps = -1;
// 	@observable
// 	public counter = 0;
// 	@observable
// 	public c0: number;
// 	@observable
// 	public c1: number;
// 	@observable
// 	public SMX: number;
// 	@observable
// 	public SMY: number;

// 	public readonly sample: Uint8Array;

// 	override get name(): string {
// 		return 'convchain';
// 	}

// 	constructor(node: ConvChainNode) {
// 		super(node);
// 		this.steps = this.node.steps || -1;
// 		this.c0 = this.node.c0;
// 		this.c1 = this.node.c1;
// 		this.SMX = this.node.SMX;
// 		this.SMY = this.node.SMY;

// 		this.sample = new Uint8Array(this.node.sample.length);
// 		this.sample.set(this.node.sample);

// 		makeObservable(this);
// 	}

// 	@override
// 	override sync() {
// 		this.node.steps = this.steps;

// 		this.node.c0 = this.c0;
// 		this.node.c1 = this.c1;

// 		this.counter = this.node.counter || 0;
// 	}
// }

// export class ConvolutionState extends NodeState<ConvolutionNode> {
// 	@observable
// 	public steps = -1;
// 	@observable
// 	public counter = 0;

// 	override get name(): string {
// 		return `convolution-${this.node.neighborhood?.toLowerCase()}`;
// 	}

// 	constructor(node: ConvolutionNode) {
// 		super(node);
// 		this.steps = this.node.steps || -1;

// 		makeObservable(this);
// 	}

// 	@override
// 	override sync() {
// 		this.node.steps = this.steps;
// 		this.counter = this.node.counter || 0;
// 	}
// }

// export class MapState extends BranchState<MapNode> {
// 	override get name(): string {
// 		return 'map';
// 	}
// }

// export class PathState extends NodeState<PathNode> {
// 	@observable
// 	public from: number[];
// 	@observable
// 	public to: number[];
// 	@observable
// 	public on: number[];
// 	@observable
// 	public colored: number;

// 	constructor(node: PathNode) {
// 		super(node);

// 		this.from = Helper.nonZeroPositions(node.start);
// 		this.to = Helper.nonZeroPositions(node.finish);
// 		this.on = Helper.nonZeroPositions(node.substrate);
// 		this.colored = node.value;

// 		makeObservable(this);
// 	}

// 	override get name(): string {
// 		return 'path';
// 	}

// 	@override
// 	override sync() {}
// }

// export abstract class RuleState<T extends RuleNode> extends NodeState<T> {
// 	@observable
// 	public steps = -1;
// 	@observable
// 	public counter = 0;
// 	@observable
// 	public temperature: number;
// 	@observable
// 	public search: boolean;
// 	@observable
// 	public searchedState: number;
// 	@observable
// 	public lastMatchedRuleIndices: number;

// 	constructor(node: T) {
// 		super(node);

// 		this.temperature = this.node.temperature;
// 		this.search = this.node.search;
// 		this.searchedState = this.node.visited;
// 		this.steps = this.node.steps || -1;
// 		this.lastMatchedRuleIndices = 0;

// 		makeObservable(this);
// 	}

// 	@override
// 	override sync() {
// 		this.node.steps = this.steps;
// 		this.counter = this.node.counter || 0;

// 		const activeIndices = this.node.last;

// 		if (activeIndices) {
// 			let mapped = 0;

// 			const rules = this.node.rules;
// 			const RL = rules.length;

// 			// Big brain way from og repo to map the incices
// 			// since the sequence can be assumed
// 			// code is modified to calculate all indices at once

// 			for (let i = 0; i < RL; i++) {
// 				if (activeIndices & (1 << i)) {
// 					mapped |= 1 << i;
// 					continue;
// 				}

// 				for (let r = i + 1; r < RL; r++) {
// 					if (rules[r].original) break;
// 					if (activeIndices & (1 << r)) {
// 						mapped |= 1 << i;
// 						break;
// 					}
// 				}
// 			}

// 			this.lastMatchedRuleIndices = mapped;
// 		}

// 		if (this.search) {
// 			this.searchedState = this.node.visited;
// 		}
// 	}
// }

// export class AllState extends RuleState<AllNode> {
// 	override get name(): string {
// 		return 'all';
// 	}
// }

// export class OneState extends RuleState<OneNode> {
// 	override get name(): string {
// 		return 'one';
// 	}
// }

// export class ParallelState extends RuleState<ParallelNode> {
// 	override get name(): string {
// 		return 'prl';
// 	}
// }

// export abstract class WFCState<T extends WFCNode> extends NodeState<T> {
// 	constructor(node: T) {
// 		super(node);
// 		makeObservable(this);
// 	}

// 	@override
// 	override sync() {}
// }

// export class TileState extends WFCState<TileNode> {
// 	override get name(): string {
// 		return `wfc-tile: ${this.node.name?.toLowerCase()}`;
// 	}
// }

// export class OverlapState extends WFCState<OverlapNode> {
// 	override get name(): string {
// 		return `wfc-overlap: ${this.node.name?.toLowerCase()}`;
// 	}
// }

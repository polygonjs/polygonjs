import {Grid} from '../Grid';
import {Interpreter} from '../Interpreter';
import {RunState, NodeOptionsElement} from './Common';
// import {
// 	AllNode,
// 	ConvChainNode,
// 	ConvolutionNode,
// 	MapNode,
// 	OneNode,
// 	OverlapNode,
// 	ParallelNode,
// 	PathNode,
// 	TileNode,
// 	AndNode,
// 	ScopeNode,
// 	MarkovNode,
// 	SequenceNode,
// } from '.';

// interface NodeConstructor {
// 	new (): Node;
// }
export abstract class Node {
	public abstract load(elem: Element, symmetry: Uint8Array, grid: Grid): Promise<boolean | null>;

	public abstract reset(): void;
	public abstract run(): RunState;

	public source?: NodeOptionsElement;
	public comment: string | null = null;
	public sync: boolean = false;

	public ip?: Interpreter;
	public grid?: Grid;

	// constructor(options: NodeOptions<Node>) {
	// 	this.source = options.source;
	// 	this.comment = options.comment;
	// 	this.sync = options.sync;
	// 	this.ip = options.ip;
	// 	this.grid = options.grid;
	// }

	// public static async factory(elem: Element, symmetry: Uint8Array, ip: Interpreter, grid: Grid) {
	// 	const name = elem.tagName.toLowerCase();
	// 	if (!Node.VALID_TAGS.has(name)) {
	// 		console.error(elem, `unknown node type: ${name}`);
	// 		return null;
	// 	}

	// 	const options: NodeOptions<Node> = {
	// 		ip,
	// 		grid,
	// 		source: elem as Element & {lineNumber: number; columnNumber: number},
	// 		comment: elem.getAttribute('comment'),
	// 		sync: elem.getAttribute('sync') === 'True',
	// 	};

	// 	const node: Node | null = {
	// 		one: () => new OneNode(options),
	// 		all: () => new AllNode(options),
	// 		prl: () => new ParallelNode(options),
	// 		and: () => new AndNode(options),
	// 		scope: () => new ScopeNode(options),
	// 		markov: () => new MarkovNode(options),
	// 		sequence: () => new SequenceNode(options),
	// 		path: () => new PathNode(options),
	// 		map: () => new MapNode(options),
	// 		convolution: () => new ConvolutionNode(options),
	// 		convchain: () => new ConvChainNode(options),
	// 		wfc: () => {
	// 			if (elem.getAttribute('sample')) return new OverlapNode(options);
	// 			if (elem.getAttribute('tileset')) return new TileNode(options);
	// 			return null;
	// 		},
	// 		...Node.EXT,
	// 	}[name as AvailableName]();

	// 	if (!node) {
	// 		console.error(elem, `unknown node type: ${name}`);
	// 		return null;
	// 	}

	// 	// node.ip = ip;
	// 	// node.grid = grid;
	// 	// node.source = <typeof node.source>elem;
	// 	// node.comment = elem.getAttribute('comment');
	// 	// node.sync = elem.getAttribute('sync') === 'True';

	// 	const success = await node.load(elem, symmetry, grid);
	// 	if (!success) console.error(elem, 'failed to load');

	// 	return success ? node : null;
	// }
}

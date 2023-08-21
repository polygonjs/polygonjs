import {Grid} from '../Grid';
import {Interpreter} from '../Interpreter';
import {VALID_TAGS, AvailableName} from './Common';
import {Node} from './Node';
import {AllNode} from './All';
import {AndNode} from './And';
import {ConvChainNode} from './ConvChain';
import {ConvolutionNode} from './Convolution';
import {EventNode} from './extensions/Event';
import {LogNode} from './extensions/Log';
import {MapNode} from './Map';
import {MarkovNode} from './Markov';
import {OneNode} from './One';
import {OverlapNode} from './Overlap';
import {ParallelNode} from './Parallel';
import {PathNode} from './Path';
import {ScopeNode} from './Scope';
import {SequenceNode} from './Sequence';
import {TileNode} from './Tile';

export async function nodeFactory(elem: Element, symmetry: Uint8Array, ip: Interpreter, grid: Grid) {
	const name = elem.tagName.toLowerCase();
	if (!VALID_TAGS.has(name)) {
		console.error(elem, `unknown node type: ${name}`);
		return null;
	}

	// const options: NodeOptions<Node> = {
	// 	ip,
	// 	grid,
	// 	source: elem as NodeOptionsElement,
	// 	comment: elem.getAttribute('comment'),
	// 	sync: elem.getAttribute('sync') === 'True',
	// };

	const node: Node | null = {
		one: () => new OneNode(),
		all: () => new AllNode(),
		prl: () => new ParallelNode(),
		and: () => new AndNode(),
		scope: () => new ScopeNode(),
		markov: () => new MarkovNode(),
		sequence: () => new SequenceNode(),
		path: () => new PathNode(),
		map: () => new MapNode(),
		convolution: () => new ConvolutionNode(),
		convchain: () => new ConvChainNode(),
		wfc: () => {
			if (elem.getAttribute('sample')) return new OverlapNode();
			if (elem.getAttribute('tileset')) return new TileNode();
			return null;
		},
		event: () => new EventNode(),
		log: () => new LogNode(),
	}[name as AvailableName]();

	if (!node) {
		console.error(elem, `unknown node type: ${name}`);
		return null;
	}

	node.ip = ip;
	node.grid = grid;
	node.source = <typeof node.source>elem;
	node.comment = elem.getAttribute('comment');
	node.sync = elem.getAttribute('sync') === 'True';

	const success = await node.load(elem, symmetry, grid);
	if (!success) console.error(elem, 'failed to load');

	return success ? node : null;
}

// private static readonly VALID_TAGS: Set<string> = new Set(AVAILABLE_NAMES);

// private static readonly EXT: {[tag: string]: () => Node} = {};
// public static registerExt(name: string, type: NodeConstructor) {
// 	if (this.VALID_TAGS.has(name)) throw new Error(`Tag <${name}> already exists`);
// 	this.VALID_TAGS.add(name);
// 	this.EXT[name] = () => new type();
// }

// public static isValidTag(tag: string) {
// 	return this.VALID_TAGS.has(tag);
// }
// }

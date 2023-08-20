import {SymmetryHelper} from '../helpers/Symmetry';
import {Node} from './Node';
import {Grid} from '../Grid';
import {Helper} from '../helpers/Helper';
import {MapNode} from './Map';
import {WFCNode} from './WFC';
export abstract class Branch<T extends Node = Node> extends Node {
	public parent: Branch | null = null;
	public readonly children: T[] = [];
	public n: number = -1;

	public override async load(elem: Element, parentSymmetry: Uint8Array, grid: Grid) {
		const symmetryString = elem.getAttribute('symmetry');
		const symmetry = SymmetryHelper.getSymmetry(this.ip.grid.MZ === 1, symmetryString, parentSymmetry);

		if (!symmetry) {
			console.error(elem, `unknown symmetry ${symmetryString}`);
			return false;
		}

		const tasks: Promise<Node | null>[] = [];
		for (const child of Helper.elemChildren(elem)) {
			if (!Node.isValidTag(child.tagName)) continue;
			tasks.push(
				(async () => {
					const node = await Node.factory(child, symmetry, this.ip, grid);
					if (!node) return null;
					if (node instanceof Branch) {
						node.parent = node instanceof MapNode || node instanceof WFCNode ? null : this;
					}
					return node;
				})()
			);
		}
		const nodes = await Promise.all(tasks);
		if (nodes.some((n) => !n)) return false;
		(<Node[]>this.children).splice(0, this.children.length, ...(nodes as Node[]));
		return true;
	}

	public override reset() {
		this.children.forEach((n) => n.reset());
		this.n = 0;
	}
}

import {SymmetryHelper} from '../helpers/Symmetry';
import {Node} from './Node';
import {Grid} from '../Grid';
import {Helper} from '../helpers/Helper';
import {BRANCH_TASK_CONTAINER} from './Common';

export abstract class Branch<T extends Node = Node> extends Node {
	public parent: Branch | null = null;
	public readonly children: T[] = [];
	public n: number = -1;

	public override async load(elem: Element, parentSymmetry: Uint8Array, grid: Grid) {
		// console.error('Branch.load not implemented');
		// return false;
		const {ip} = this;
		if (!ip) {
			return false;
		}

		const symmetryString = elem.getAttribute('symmetry');
		const symmetry = SymmetryHelper.getSymmetry(ip.grid.MZ === 1, symmetryString, parentSymmetry);

		if (!symmetry) {
			console.error(elem, `unknown symmetry ${symmetryString}`);
			return false;
		}

		const tasks: Promise<Node | null>[] = [];
		const children = Helper.elemChildren(elem);
		console.log(children);
		for (const child of children) {
			// if (!Node.isValidTag(child.tagName)) continue;
			const promise = BRANCH_TASK_CONTAINER.func({
				parentNode: this,
				elem: child,
			});
			console.log(child);
			tasks.push(promise);
			// tasks.push(
			// 	(async () => {
			// 		const node = await nodeFactory(child, symmetry, ip, grid);
			// 		if (!node) return null;
			// 		if (node instanceof Branch) {
			// 			node.parent = node instanceof MapNode || node instanceof WFCNode ? null : this;
			// 		}
			// 		return node;
			// 	})()
			// );
		}
		const nodes = await Promise.all(tasks);
		console.log(this, nodes);
		if (nodes.some((n) => !n)) return false;
		(<Node[]>this.children).splice(0, this.children.length, ...(nodes as Node[]));
		return true;
	}

	public override reset() {
		this.children.forEach((n) => n.reset());
		this.n = 0;
	}
}

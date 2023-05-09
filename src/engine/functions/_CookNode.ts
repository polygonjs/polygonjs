import {NamedFunction1} from './_Base';

export class cookNode extends NamedFunction1<[string]> {
	static override type() {
		return 'cookNode';
	}
	func(nodePath: string): void {
		const node = this.scene.node(nodePath);
		if (node) {
			node.setDirty();
			node.compute();
		}
	}
}

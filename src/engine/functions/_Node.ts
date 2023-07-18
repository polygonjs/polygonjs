import {PolyScene} from '../scene/PolyScene';
import {NamedFunction1} from './_Base';
import {BaseNodeType} from '../nodes/_Base';

export function dummyReadRefVal(value: number | null) {
	// we just need this method to force a call to .value
	// and ensure that we have a dependency with the ref()
}

function _getNode(scene: PolyScene, nodePath: string): BaseNodeType | undefined {
	dummyReadRefVal(scene.graphNodesController.pathRef(nodePath).value);
	const node = scene.node(nodePath);
	if (!node) {
		return;
	}
	return node;
}
export class getNode extends NamedFunction1<[string]> {
	static override type() {
		return 'getNode';
	}
	func(nodePath: string): BaseNodeType {
		return _getNode(this.scene, nodePath)!;
	}
}

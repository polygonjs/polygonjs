import {TypedNode} from '../_Base';
import {NodeContext} from '../../poly/NodeContext';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {FlagsControllerDBO} from '../utils/FlagsController';
import {CsgCoreGroup} from '../../../core/geometry/csg/CsgCoreGroup';
import {CsgObject} from '../../../core/geometry/csg/CsgCoreObject';

const INPUT_GEOMETRY_NAME = 'input CSG geometry';
const DEFAULT_INPUT_NAMES = [INPUT_GEOMETRY_NAME, INPUT_GEOMETRY_NAME, INPUT_GEOMETRY_NAME, INPUT_GEOMETRY_NAME];

/**
 * BaseCsgNode is the base class for all nodes that process constructive solid geometries. This inherits from [BaseNode](/docs/api/BaseNode).
 *
 */
export class TypedCsgNode<K extends NodeParamsConfig> extends TypedNode<NodeContext.CSG, K> {
	static override context(): NodeContext {
		return NodeContext.CSG;
	}
	public override readonly flags: FlagsControllerDBO = new FlagsControllerDBO(this);

	static override displayedInputNames(): string[] {
		return DEFAULT_INPUT_NAMES;
	}

	override initializeBaseNode() {
		this.flags.display.set(false);
		this.flags.display.onUpdate(() => {
			if (this.flags.display.active()) {
				const parent = this.parent();
				if (parent && parent.displayNodeController) {
					parent.displayNodeController.setDisplayNode(this);
				}
			}
		});
		this.io.outputs.setHasOneOutput();
	}

	setCsgCoreGroup(csgCoreGgroup: CsgCoreGroup) {
		this._setContainer(csgCoreGgroup);
	}

	setCsgCoreObject(object: CsgObject) {
		this._setContainerObjects([object]);
	}
	setCsgCoreObjects(objects: CsgObject[]) {
		this._setContainerObjects(objects);
	}
	private _setContainerObjects(objects: CsgObject[]) {
		const coreGroup = this.containerController.container().coreContent() || new CsgCoreGroup();
		coreGroup.setObjects(objects);
		coreGroup.touch();
		this._setContainer(coreGroup);
	}
}

export type BaseCsgNodeType = TypedCsgNode<NodeParamsConfig>;
export class BaseCsgNodeClass extends TypedCsgNode<NodeParamsConfig> {}

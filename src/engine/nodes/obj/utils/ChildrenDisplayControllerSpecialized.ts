import {Object3D} from 'three';
import {DisplayNodeController} from '../../utils/DisplayNodeController';
import {ChildrenDisplayController} from './ChildrenDisplayController';
import {TesselationParamsObjNode} from './TesselationParams';
import {CoreGroup} from '../../../../core/geometry/Group';
import {Poly} from '../../../Poly';

interface BaseObjNodeClassWithDisplayNode extends TesselationParamsObjNode {
	displayNodeController: DisplayNodeController;
}

export class ChildrenDisplayControllerSpecialized extends ChildrenDisplayController {
	constructor(protected override node: BaseObjNodeClassWithDisplayNode) {
		super(node);
	}

	override _addSpecializedObjects(coreGroup: CoreGroup, newObjects: Object3D[]) {
		const _newObjectsAreDifferent = Poly.specializedChildren.runHooks(coreGroup, newObjects, this.node.pv);
		if (_newObjectsAreDifferent) {
			this._newObjectsAreDifferent = _newObjectsAreDifferent;
		}
	}
}

import {Object3D} from 'three';
import {DisplayNodeController} from '../../utils/DisplayNodeController';
import {ChildrenDisplayController} from './ChildrenDisplayController';

import {TesselationParamsObjNode} from './TesselationParams';
import {CoreGroup} from '../../../../core/geometry/Group';
import {CoreType} from '../../../../core/Type';

interface BaseObjNodeClassWithDisplayNode extends TesselationParamsObjNode {
	displayNodeController: DisplayNodeController;
	// pv: TesselationParams;
}

export class ChildrenDisplayControllerSpecialized extends ChildrenDisplayController {
	constructor(protected override node: BaseObjNodeClassWithDisplayNode) {
		super(node);
	}

	override _addSpecializedObjects(coreGroup: CoreGroup, newObjects: Object3D[]) {
		const newCadObjects = coreGroup.cadObjects();
		if (!newCadObjects) {
			return;
		}
		for (let cadObject of newCadObjects) {
			const newObject3D = cadObject.toObject3D(this.node.pv);
			if (newObject3D) {
				this._newObjectsAreDifferent = true;
				if (CoreType.isArray(newObject3D)) {
					newObjects.push(...newObject3D);
				} else {
					newObjects.push(newObject3D);
				}
			}
		}
	}
}

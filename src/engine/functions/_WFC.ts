import {Object3D} from 'three';
import {ObjectNamedFunction6, ObjectNamedFunction1} from './_Base';
import {NeighbourIndex} from '../../core/geometry/modules/quad/graph/QuadGraphCommon';
import {getWFCSolver, getWFCBuilder} from '../../core/wfc/WFCRegister';
import {Poly} from '../Poly';

export class setWFCSoftConstraint extends ObjectNamedFunction6<[number, number, string, number, number, number]> {
	static override type() {
		return 'setWFCSoftConstraint';
	}
	func(
		object: Object3D,
		floorId: number,
		quadId: number,
		tileId: string,
		rotation: NeighbourIndex,
		quadSeed: number,
		configSeed: number
	) {
		const solver = getWFCSolver(object);
		if (!solver) {
			Poly.warn('setWFCSoftConstraint: no solver found');
			return;
		}
		return solver.addSoftContraint({
			object,
			floorId,
			quadId,
			tileId,
			rotation,
			//
			stepsCount: -1,
			quadSeed,
			configSeed,
		});
	}
}

export class WFCBuild extends ObjectNamedFunction1<[Object3D]> {
	static override type() {
		return 'WFCBuild';
	}
	func(builderObject: Object3D, solverObject: Object3D) {
		const builder = getWFCBuilder(builderObject);
		const solver = getWFCSolver(solverObject);
		if (!(builder && solver)) {
			if (!solver) {
				Poly.warn('WFCBuild: no solver found');
			} else {
				Poly.warn('WFCBuild: no builder found');
			}
			return;
		}
		return builder.update(builderObject, solverObject);
	}
}

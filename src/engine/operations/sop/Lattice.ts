import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {Vector3, Mesh} from 'three';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {CoreMask} from '../../../core/geometry/Mask';
import {DEFAULT_POSITIONS, Vector3_8, cubeLatticeDeform} from '../../../core/geometry/operation/CubeLatticeDeform';

const cubeLatticeDeformPoints: Vector3_8 = [
	new Vector3(),
	new Vector3(),
	new Vector3(),
	new Vector3(),
	new Vector3(),
	new Vector3(),
	new Vector3(),
	new Vector3(),
];

interface LatticeSopParams extends DefaultOperationParams {
	group: string;
	//
	p0: Vector3;
	p1: Vector3;
	p2: Vector3;
	p3: Vector3;
	p4: Vector3;
	p5: Vector3;
	p6: Vector3;
	p7: Vector3;
	//
	offset: Vector3;
	moveObjectPosition: boolean;
}

export class LatticeSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: LatticeSopParams = {
		group: '',
		p0: DEFAULT_POSITIONS[0].clone(),
		p1: DEFAULT_POSITIONS[1].clone(),
		p2: DEFAULT_POSITIONS[2].clone(),
		p3: DEFAULT_POSITIONS[3].clone(),
		p4: DEFAULT_POSITIONS[4].clone(),
		p5: DEFAULT_POSITIONS[5].clone(),
		p6: DEFAULT_POSITIONS[6].clone(),
		p7: DEFAULT_POSITIONS[7].clone(),
		offset: new Vector3(0, 0, 0),
		moveObjectPosition: true,
	};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static override type(): Readonly<SopType.LATTICE> {
		return SopType.LATTICE;
	}

	override cook(inputCoreGroups: CoreGroup[], params: LatticeSopParams) {
		const coreGroup = inputCoreGroups[0];

		cubeLatticeDeformPoints[0].copy(params.p0);
		cubeLatticeDeformPoints[1].copy(params.p1);
		cubeLatticeDeformPoints[2].copy(params.p2);
		cubeLatticeDeformPoints[3].copy(params.p3);
		cubeLatticeDeformPoints[4].copy(params.p4);
		cubeLatticeDeformPoints[5].copy(params.p5);
		cubeLatticeDeformPoints[6].copy(params.p6);
		cubeLatticeDeformPoints[7].copy(params.p7);

		const objects = CoreMask.filterThreejsObjects(coreGroup, params);
		for (const object of objects) {
			const geometry = (object as Mesh).geometry;
			if (geometry) {
				cubeLatticeDeform(object, cubeLatticeDeformPoints, params);
			}
		}

		return coreGroup;
	}
}

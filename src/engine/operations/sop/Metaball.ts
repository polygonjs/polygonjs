import {BaseSopOperation} from './_Base';
import {DefaultOperationParams} from '../_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {CoreConstant, ObjectType} from '../../../core/geometry/Constant';
import {MarchingCubes} from '../../../modules/three/examples/jsm/objects/MarchingCubes';
import {Vector3} from 'three/src/math/Vector3';
import {CoreType} from '../../../core/Type';
import {isBooleanTrue} from '../../../core/BooleanValue';

interface MetaballSopParams extends DefaultOperationParams {
	resolution: number;
	isolation: number;
	useMetaStrengthAttrib: boolean;
	metaStrength: number;
	enableUVs: boolean;
	enableColors: boolean;
	addPlanes: boolean;
	addPlaneX: boolean;
	addPlaneY: boolean;
	addPlaneZ: boolean;
}
const pos = new Vector3();
export class MetaballSopOperation extends BaseSopOperation {
	static readonly DEFAULT_PARAMS: MetaballSopParams = {
		resolution: 10,
		isolation: 1,
		useMetaStrengthAttrib: false,
		metaStrength: 1,
		enableUVs: false,
		enableColors: false,
		addPlanes: false,
		addPlaneX: false,
		addPlaneY: false,
		addPlaneZ: false,
	};
	static readonly INPUT_CLONED_STATE = InputCloneMode.NEVER;
	static type(): Readonly<'metaball'> {
		return 'metaball';
	}
	cook(inputContents: CoreGroup[], params: MetaballSopParams) {
		const inputCoreGroup = inputContents[0];

		const subtract = 1;
		const metaballs = new MarchingCubes(
			params.resolution,
			CoreConstant.MATERIALS[ObjectType.MESH],
			params.enableUVs,
			params.enableColors
		);
		metaballs.isolation = params.isolation;
		if (isBooleanTrue(params.addPlanes)) {
			if (isBooleanTrue(params.addPlaneX)) {
				metaballs.addPlaneX(params.metaStrength, subtract);
			}
			if (isBooleanTrue(params.addPlaneY)) {
				metaballs.addPlaneY(params.metaStrength, subtract);
			}
			if (isBooleanTrue(params.addPlaneZ)) {
				metaballs.addPlaneZ(params.metaStrength, subtract);
			}
		}

		const points = inputCoreGroup.points();
		for (let point of points) {
			point.getPosition(pos);

			let metaStrength = params.metaStrength;
			if (isBooleanTrue(params.useMetaStrengthAttrib)) {
				let metaStrength = point.attribValue('metaStrength') as number;
				if (CoreType.isNumber(metaStrength)) {
					metaStrength *= params.metaStrength;
				}
			}

			metaballs.addBall(pos.x, pos.y, pos.z, metaStrength, subtract, undefined);
		}

		return this.createCoreGroupFromObjects([metaballs]);
	}
}

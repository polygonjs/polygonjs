import {BaseSopOperation} from './_Base';
import {DefaultOperationParams} from '../_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
// import {CoreConstant, ObjectType} from '../../../core/geometry/Constant';
// import {MarchingCubes} from '../../../modules/three/examples/jsm/objects/MarchingCubes';
import {MarchingCubes} from '../../../modules/core/objects/MarchingCubes';
import {Vector3} from 'three/src/math/Vector3';
import {CoreType} from '../../../core/Type';
import {isBooleanTrue} from '../../../core/BooleanValue';

interface MetaballSopParams extends DefaultOperationParams {
	resolution: number;
	isolation: number;
	useMetaStrengthAttrib: boolean;
	metaStrength: number;
	useMetaSubstractAttrib: boolean;
	metaSubstract: number;
	enableUVs: boolean;
	enableColors: boolean;
}
const pos = new Vector3();
export class MetaballSopOperation extends BaseSopOperation {
	static readonly DEFAULT_PARAMS: MetaballSopParams = {
		resolution: 10,
		isolation: 1,
		useMetaStrengthAttrib: false,
		metaStrength: 1,
		useMetaSubstractAttrib: false,
		metaSubstract: 1,
		enableUVs: false,
		enableColors: false,
	};
	static readonly INPUT_CLONED_STATE = InputCloneMode.NEVER;
	static type(): Readonly<'metaball'> {
		return 'metaball';
	}
	cook(inputContents: CoreGroup[], params: MetaballSopParams) {
		const inputCoreGroup = inputContents[0];

		const metaballs = new MarchingCubes(
			params.resolution,
			// CoreConstant.MATERIALS[ObjectType.MESH],
			params.enableUVs,
			params.enableColors
		);
		metaballs.isolation = params.isolation;

		const points = inputCoreGroup.points();
		for (let point of points) {
			point.getPosition(pos);

			let metaStrength = params.metaStrength;
			if (isBooleanTrue(params.useMetaStrengthAttrib)) {
				let metaStrengthAttrib = point.attribValue('metaStrength') as number;
				if (CoreType.isNumber(metaStrengthAttrib)) {
					metaStrength *= metaStrengthAttrib;
				}
			}
			let metaSubstract = params.metaSubstract;
			if (isBooleanTrue(params.useMetaSubstractAttrib)) {
				let metaSubstractAttrib = point.attribValue('metaSubstract') as number;
				if (CoreType.isNumber(metaSubstractAttrib)) {
					metaSubstract *= metaSubstractAttrib;
				}
			}

			metaballs.addBall(pos.x, pos.y, pos.z, metaStrength, metaSubstract, undefined);
		}
		metaballs.createPolygons();

		return this.createCoreGroupFromGeometry(metaballs);
	}
}

import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
// import {CoreConstant, ObjectType} from '../../../core/geometry/Constant';
// import {MarchingCubes} from 'three/examples/jsm/objects/MarchingCubes';
import {MarchingCubes} from '../../../modules/core/objects/MarchingCubes';
import {Vector3} from 'three';
import {CoreType} from '../../../core/Type';
import {isBooleanTrue} from '../../../core/BooleanValue';
import {BufferGeometry} from 'three';
import {DefaultOperationParams} from '../../../core/operations/_Base';

interface MetaballSopParams extends DefaultOperationParams {
	resolution: number;
	isolation: number;
	useMetaStrengthAttrib: boolean;
	metaStrength: number;
	useMetaSubtractAttrib: boolean;
	metaSubtract: number;
	enableUVs: boolean;
	enableColors: boolean;
}
const pos = new Vector3();
export class MetaballSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: MetaballSopParams = {
		resolution: 40,
		isolation: 30,
		useMetaStrengthAttrib: false,
		metaStrength: 0.1,
		useMetaSubtractAttrib: false,
		metaSubtract: 1,
		enableUVs: false,
		enableColors: false,
	};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.NEVER;
	static override type(): Readonly<'metaball'> {
		return 'metaball';
	}
	override cook(inputContents: CoreGroup[], params: MetaballSopParams) {
		const inputCoreGroup = inputContents[0];

		try {
			const geometry = this._createMetaballsGeometry(inputCoreGroup, params);
			return this.createCoreGroupFromGeometry(geometry);
		} catch (err) {
			this.states?.error.set(`failed to create metaballs, possibly a memory issue`);
			console.error('metaballs failed');
			return this.createCoreGroupFromObjects([]);
		}
	}

	private _createMetaballsGeometry(inputCoreGroup: CoreGroup, params: MetaballSopParams) {
		const metaballs = new MarchingCubes(
			params.resolution,
			// CoreConstant.MATERIALS[ObjectType.MESH],
			params.enableUVs,
			params.enableColors
		);
		metaballs.isolation = params.isolation;

		const points = inputCoreGroup.points();
		for (let point of points) {
			point.position(pos);
			pos.multiplyScalar(0.5).addScalar(0.5);

			let metaStrength = params.metaStrength;
			if (isBooleanTrue(params.useMetaStrengthAttrib)) {
				let metaStrengthAttrib = point.attribValue('metaStrength') as number;
				if (CoreType.isNumber(metaStrengthAttrib)) {
					metaStrength *= metaStrengthAttrib;
				}
			}
			let metaSubtract = params.metaSubtract;
			if (isBooleanTrue(params.useMetaSubtractAttrib)) {
				let metaSubtractAttrib = point.attribValue('metaSubtract') as number;
				if (CoreType.isNumber(metaSubtractAttrib)) {
					metaSubtract *= metaSubtractAttrib;
				}
			}
			metaballs.addBall(pos.x, pos.y, pos.z, metaStrength, metaSubtract, undefined);
		}
		metaballs.createPolygons();
		const geometry = new BufferGeometry();
		const attribNames = Object.keys(metaballs.attributes);
		for (let attribName of attribNames) {
			const attrib = metaballs.attributes[attribName];
			geometry.setAttribute(attribName, attrib);
		}

		return geometry;
	}
}

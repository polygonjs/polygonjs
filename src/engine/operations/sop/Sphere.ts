import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {IcosahedronBufferGeometry} from 'three';
import {Vector2} from 'three';
import {Vector3} from 'three';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {isBooleanTrue} from '../../../core/BooleanValue';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {ObjectType} from '../../../core/geometry/Constant';
import {BufferGeometry} from 'three';
import {SphereBuilder} from '../../../core/geometry/builders/SphereBuilder';

interface SphereSopParams extends DefaultOperationParams {
	type: number;
	radius: number;
	resolution: Vector2;
	open: boolean;
	phiStart: number;
	phiLength: number;
	thetaStart: number;
	thetaLength: number;
	detail: number;
	center: Vector3;
	asLines: boolean;
}

enum SphereType {
	DEFAULT = 'default',
	ISOCAHEDRON = 'isocahedron',
}
type SphereTypes = {[key in SphereType]: number};
export const SPHERE_TYPE: SphereTypes = {
	default: 0,
	isocahedron: 1,
};
export const SPHERE_TYPES: Array<SphereType> = [SphereType.DEFAULT, SphereType.ISOCAHEDRON];

export class SphereSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: SphereSopParams = {
		type: SPHERE_TYPE.default,
		radius: 1,
		resolution: new Vector2(30, 30),
		open: false,
		phiStart: 0,
		phiLength: Math.PI * 2,
		thetaStart: 0,
		thetaLength: Math.PI,
		detail: 1,
		center: new Vector3(0, 0, 0),
		asLines: false,
	};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static override type(): Readonly<'sphere'> {
		return 'sphere';
	}

	override cook(input_contents: CoreGroup[], params: SphereSopParams) {
		const core_group = input_contents[0];
		if (core_group) {
			return this._cookWithInput(core_group, params);
		} else {
			return this._cookWithoutInput(params);
		}
	}
	private _cookWithoutInput(params: SphereSopParams) {
		const geometry = this._createRequiredGeometry(params);
		geometry.translate(params.center.x, params.center.y, params.center.z);
		const object = this._createSphereObject(geometry, params);
		return this.createCoreGroupFromObjects([object]);
	}
	private _cookWithInput(core_group: CoreGroup, params: SphereSopParams) {
		const bbox = core_group.boundingBox();
		const size = bbox.max.clone().sub(bbox.min);
		const center = bbox.max.clone().add(bbox.min).multiplyScalar(0.5);

		const geometry = this._createRequiredGeometry(params);
		geometry.scale(size.x, size.y, size.z);
		geometry.translate(params.center.x, params.center.y, params.center.z);
		geometry.translate(center.x, center.y, center.z);
		const object = this._createSphereObject(geometry, params);
		return this.createCoreGroupFromObjects([object]);
	}
	private _createSphereObject(geometry: BufferGeometry, params: SphereSopParams) {
		return BaseSopOperation.createObject(geometry, params.asLines ? ObjectType.LINE_SEGMENTS : ObjectType.MESH);
	}

	private _createRequiredGeometry(params: SphereSopParams) {
		if (params.type == SPHERE_TYPE.default) {
			return this._createDefaultSphere(params);
		} else {
			return this._createDefaultIsocahedron(params);
		}
	}

	private _createDefaultSphere(params: SphereSopParams) {
		const geometry = isBooleanTrue(params.open)
			? SphereBuilder.create({
					radius: params.radius,
					widthSegments: params.resolution.x,
					heightSegments: params.resolution.y,
					phiStart: params.phiStart,
					phiLength: params.phiLength,
					thetaStart: params.thetaStart,
					thetaLength: params.thetaLength,
					asLines: params.asLines,
					open: true,
			  })
			: SphereBuilder.create({
					radius: params.radius,
					widthSegments: params.resolution.x,
					heightSegments: params.resolution.y,
					asLines: params.asLines,
					open: false,
			  });

		// if (isBooleanTrue(params.asLines)) {
		// 	// const widthSegments = Math.max( 3, Math.floor( params.resolution.x ) );
		// 	// const heightSegments = Math.max( 2, Math.floor( params.resolution.y ) );

		// 	const newIndices: number[] = [];
		// 	// for ( let iy = 0; iy < heightSegments; iy ++ ) {

		// 	// 	for ( let ix = 0; ix < widthSegments; ix ++ ) {

		// 	// 		const a = grid[ iy ][ ix + 1 ];
		// 	// 		const b = grid[ iy ][ ix ];
		// 	// 		const c = grid[ iy + 1 ][ ix ];
		// 	// 		const d = grid[ iy + 1 ][ ix + 1 ];

		// 	// 		if ( iy !== 0 || thetaStart > 0 ) indices.push( a, b, d );
		// 	// 		if ( iy !== heightSegments - 1 || thetaEnd < Math.PI ) indices.push( b, c, d );

		// 	// 	}

		// 	// }
		// 	// geometry.setIndex(indices);
		// 	const currentIndices: number[] = geometry.getIndex()!.array as number[];
		// 	const facesCount = currentIndices.length / 3;
		// 	for (let faceIndex = 0; faceIndex < facesCount; faceIndex += 2) {
		// 		const a = currentIndices[faceIndex];
		// 		const b = currentIndices[faceIndex + 1];
		// 		// const c = currentIndices[faceIndex+2]
		// 		newIndices.push(a, b);
		// 		// newIndices.push(a,c)
		// 	}
		// }

		return geometry;
	}
	private _createDefaultIsocahedron(params: SphereSopParams) {
		return new IcosahedronBufferGeometry(params.radius, params.detail);
	}
}

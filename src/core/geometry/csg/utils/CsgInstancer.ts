import {Vector3} from 'three';
// import {Vector2} from 'three';
// import {Quaternion} from 'three';
import {Matrix4} from 'three';
// import { CsgCoreGroup } from '../CsgCoreGroup';
// import {InstancedBufferGeometry} from 'three';
// import {InstancedBufferAttribute} from 'three';
// import {CorePoint} from './Point';
// import {CoreGroup} from './Group';
// import {CoreGeometry} from './Geometry';
// import {BufferGeometry} from 'three';
// import {CoreType} from '../Type';
// import {Attribute} from './Attribute';
// import {PolyDictionary} from '../../types/GlobalTypes';

const DEFAULT = {
	SCALE: new Vector3(1, 1, 1),
	PSCALE: 1,
	EYE: new Vector3(0, 0, 0),
	UP: new Vector3(0, 1, 0),
};

// const DEFAULT_COLOR = new Vector3(1, 1, 1);
// const DEFAULT_UV = new Vector2(0, 0);

export enum InstanceAttrib {
	POSITION = 'instancePosition',
	SCALE = 'instanceScale',
	ORIENTATION = 'instanceOrientation',
	COLOR = 'instanceColor',
	UV = 'instanceUv',
}

// const ATTRIB_NAME_MAP: PolyDictionary<string> = {
// 	P: InstanceAttrib.POSITION,
// 	N: InstanceAttrib.ORIENTATION,
// 	up: InstanceAttrib.ORIENTATION,
// 	Cd: InstanceAttrib.COLOR,
// 	[Attribute.COLOR]: InstanceAttrib.COLOR,
// 	[Attribute.NORMAL]: InstanceAttrib.ORIENTATION,
// 	[Attribute.POSITION]: InstanceAttrib.POSITION,
// 	[Attribute.PSCALE]: InstanceAttrib.SCALE,
// 	[Attribute.SCALE]: InstanceAttrib.SCALE,
// };
export class CoreCsgInstancer {
	// private _is_pscale_present: boolean = false;
	// private _is_scale_present: boolean = false;
	// private _is_normal_present: boolean = false;
	// private _is_up_present: boolean = false;
	private _do_rotate_matrices: boolean = false;
	// private _matrices: PolyDictionary<Matrix4> = {};
	private _matrixT = new Matrix4();
	private _matrixR = new Matrix4();
	private _matrixS = new Matrix4();

	static transformAttributeNames: string[] = [
		InstanceAttrib.POSITION,
		InstanceAttrib.ORIENTATION,
		InstanceAttrib.SCALE,
	];

	// static remapName(name: string): string {
	// 	return ATTRIB_NAME_MAP[name] || name;
	// }

	constructor(/*private _coreGroup?: CsgCoreGroup*/) {
		// if (_coreGroup) {
		// 	this.setCoreGroup(_coreGroup);
		// }
	}
	// setCoreGroup(coreGroup: CsgCoreGroup) {
	// 	this._coreGroup = coreGroup;
	// 	// this._is_pscale_present = this._coreGroup.hasAttrib(Attribute.PSCALE);
	// 	// this._is_scale_present = this._coreGroup.hasAttrib(Attribute.SCALE);

	// 	// this._is_normal_present = this._coreGroup.hasAttrib(Attribute.NORMAL);
	// 	// this._is_up_present = this._coreGroup.hasAttrib(Attribute.UP);

	// 	// this._do_rotate_matrices = this._is_normal_present; //&& this._is_up_present;
	// }

	private _pointScale = new Vector3();
	private _pointNormal = new Vector3();
	private _pointUp = new Vector3();
	// private _point_m = new Matrix4()
	matrixFromPoint(point: Vector3, targetMatrix: Matrix4) {
		targetMatrix.identity();
		const t = point; //.position();
		//r = new Vector3(0,0,0)
		// if (this._is_scale_present) {
		// 	point.attribValue(Attribute.SCALE, this._pointScale);
		// } else {
		this._pointScale.copy(DEFAULT.SCALE);
		// }
		// const pscale: number = this._is_pscale_present
		// 	? (point.attribValue(Attribute.PSCALE) as number)
		// 	: DEFAULT.PSCALE;
		const pscale = DEFAULT.PSCALE;
		this._pointScale.multiplyScalar(pscale);

		//matrix = #Core.Transform.matrix(t, r, s, scale)
		// matrix.identity();

		const scale_matrix = this._matrixS;
		scale_matrix.makeScale(this._pointScale.x, this._pointScale.y, this._pointScale.z);

		const translate_matrix = this._matrixT;
		translate_matrix.makeTranslation(t.x, t.y, t.z);

		targetMatrix.multiply(translate_matrix);

		if (this._do_rotate_matrices) {
			const rotate_matrix = this._matrixR;
			const eye = DEFAULT.EYE;
			// point.attribValue(Attribute.NORMAL, this._pointNormal);
			this._pointNormal.multiplyScalar(-1);
			// if (this._is_up_present) {
			// 	point.attribValue(Attribute.UP, this._pointUp);
			// } else {
			this._pointUp.copy(DEFAULT.UP);
			// }
			this._pointUp.normalize();
			rotate_matrix.lookAt(eye, this._pointNormal, this._pointUp);

			targetMatrix.multiply(rotate_matrix);
		}

		targetMatrix.multiply(scale_matrix);
	}

	// private static _point_color = new Vector3();
	// private static _point_uv = new Vector2();
	// private static _position = new Vector3(0, 0, 0);
	// private static _quaternion = new Quaternion();
	// private static _scale = new Vector3(1, 1, 1);
	// private static _tmpMatrix = new Matrix4();
	// static updateTransformInstanceAttributes(
	// 	instancePts: CorePoint[],
	// 	templateCoreGroup: CoreGroup,
	// 	geometry: InstancedBufferGeometry
	// ) {
	// 	const instancesCount = instancePts.length;
	// 	const positions = new Float32Array(instancesCount * 3);
	// 	const scales = new Float32Array(instancesCount * 3);
	// 	const orients = new Float32Array(instancesCount * 4);
	// 	const instancer = new CoreInstancer(templateCoreGroup);
	// 	let i = 0;
	// 	for (let instancePt of instancePts) {
	// 		instancer.matrixFromPoint(instancePt, this._tmpMatrix);
	// 		const index3 = i * 3;
	// 		const index4 = i * 4;

	// 		this._tmpMatrix.decompose(this._position, this._quaternion, this._scale);

	// 		this._position.toArray(positions, index3);
	// 		this._quaternion.toArray(orients, index4);
	// 		this._scale.toArray(scales, index3);
	// 		i++;
	// 	}
	// 	geometry.setAttribute(InstanceAttrib.POSITION, new InstancedBufferAttribute(positions, 3));
	// 	geometry.setAttribute(InstanceAttrib.SCALE, new InstancedBufferAttribute(scales, 3));
	// 	geometry.setAttribute(InstanceAttrib.ORIENTATION, new InstancedBufferAttribute(orients, 4));
	// }

	// static updateColorInstanceAttribute(
	// 	instancePts: CorePoint[],
	// 	templateCoreGroup: CoreGroup,
	// 	geometry: InstancedBufferGeometry
	// ) {
	// 	const instancesCount = instancePts.length;
	// 	const colors = new Float32Array(instancesCount * 3);
	// 	const hasColor = templateCoreGroup.hasAttrib(Attribute.COLOR);
	// 	let i = 0;
	// 	for (let instancePt of instancePts) {
	// 		const color = hasColor
	// 			? (instancePt.attribValue(Attribute.COLOR, this._point_color) as Vector3)
	// 			: DEFAULT_COLOR;
	// 		color.toArray(colors, i * 3);

	// 		i++;
	// 	}
	// 	geometry.setAttribute(InstanceAttrib.COLOR, new InstancedBufferAttribute(colors, 3));
	// }

	// static createInstanceBufferGeometry(
	// 	geometryToInstance: BufferGeometry,
	// 	templateCoreGroup: CoreGroup,
	// 	attributesToCopy: string
	// ) {
	// 	const instancePts = templateCoreGroup.points();
	// 	// geometry_to_instance = new BoxBufferGeometry( 2, 2, 2 )
	// 	// geometry = new InstancedBufferGeometry()
	// 	// geometry.index = geometry_to_instance.index
	// 	// geometry.attributes.position = geometry_to_instance.attributes.position
	// 	// geometry.attributes.uv = geometry_to_instance.attributes.uv

	// 	const geometry = new InstancedBufferGeometry();
	// 	geometry.copy(geometryToInstance);
	// 	geometry.instanceCount = Infinity;

	// 	const instancesCount = instancePts.length;

	// 	// if(this._param_add_uv_offset){
	// 	const has_uv = templateCoreGroup.hasAttrib(Attribute.UV);
	// 	if (has_uv) {
	// 		const uvs = new Float32Array(instancesCount * 2);
	// 		let i = 0;
	// 		for (let instancePt of instancePts) {
	// 			const index2 = i * 2;
	// 			const uv = has_uv ? (instancePt.attribValue(Attribute.UV, this._point_uv) as Vector2) : DEFAULT_UV;
	// 			uv.toArray(uvs, index2);
	// 			i++;
	// 		}
	// 		geometry.setAttribute(InstanceAttrib.UV, new InstancedBufferAttribute(uvs, 2));
	// 	}
	// 	// }
	// 	this.updateTransformInstanceAttributes(instancePts, templateCoreGroup, geometry);
	// 	this.updateColorInstanceAttribute(instancePts, templateCoreGroup, geometry);

	// 	const attribNames = templateCoreGroup.attribNamesMatchingMask(attributesToCopy);

	// 	attribNames.forEach((attribName) => {
	// 		const attribSize = templateCoreGroup.attribSize(attribName);
	// 		const values = new Float32Array(instancesCount * attribSize);
	// 		instancePts.forEach((pt, i) => {
	// 			const value = pt.attribValue(attribName);
	// 			if (CoreType.isNumber(value)) {
	// 				values[i] = value;
	// 			} else {
	// 				(value as Vector3).toArray(values, i * attribSize);
	// 			}
	// 		});
	// 		geometry.setAttribute(attribName, new InstancedBufferAttribute(values, attribSize));
	// 	});

	// 	const coreGeometry = new CoreGeometry(geometry);
	// 	coreGeometry.markAsInstance();

	// 	return geometry;
	// }
}

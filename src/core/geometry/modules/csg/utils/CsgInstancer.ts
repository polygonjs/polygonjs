// import {Vector3, Matrix4} from 'three';

// const DEFAULT = {
// 	SCALE: new Vector3(1, 1, 1),
// 	PSCALE: 1,
// 	EYE: new Vector3(0, 0, 0),
// 	UP: new Vector3(0, 1, 0),
// };

// export enum InstanceAttrib {
// 	POSITION = 'instancePosition',
// 	SCALE = 'instanceScale',
// 	ORIENTATION = 'instanceOrientation',
// 	COLOR = 'instanceColor',
// 	UV = 'instanceUv',
// }

// export class CoreCsgInstancer {

// 	private _do_rotate_matrices: boolean = false;
// 	private _matrixT = new Matrix4();
// 	private _matrixR = new Matrix4();
// 	private _matrixS = new Matrix4();

// 	static transformAttributeNames: string[] = [
// 		InstanceAttrib.POSITION,
// 		InstanceAttrib.ORIENTATION,
// 		InstanceAttrib.SCALE,
// 	];

// 	constructor() {

// 	}

// 	private _pointScale = new Vector3();
// 	private _pointNormal = new Vector3();
// 	private _pointUp = new Vector3();
// 	// private _point_m = new Matrix4()
// 	matrixFromPoint(point: Vector3, targetMatrix: Matrix4) {
// 		targetMatrix.identity();
// 		const t = point; //.position();
// 		//r = new Vector3(0,0,0)
// 		// if (this._is_scale_present) {
// 		// 	point.attribValue(Attribute.SCALE, this._pointScale);
// 		// } else {
// 		this._pointScale.copy(DEFAULT.SCALE);
// 		// }
// 		// const pscale: number = this._is_pscale_present
// 		// 	? (point.attribValue(Attribute.PSCALE) as number)
// 		// 	: DEFAULT.PSCALE;
// 		const pscale = DEFAULT.PSCALE;
// 		this._pointScale.multiplyScalar(pscale);

// 		//matrix = #Core.Transform.matrix(t, r, s, scale)
// 		// matrix.identity();

// 		const scale_matrix = this._matrixS;
// 		scale_matrix.makeScale(this._pointScale.x, this._pointScale.y, this._pointScale.z);

// 		const translate_matrix = this._matrixT;
// 		translate_matrix.makeTranslation(t.x, t.y, t.z);

// 		targetMatrix.multiply(translate_matrix);

// 		if (this._do_rotate_matrices) {
// 			const rotate_matrix = this._matrixR;
// 			const eye = DEFAULT.EYE;
// 			// point.attribValue(Attribute.NORMAL, this._pointNormal);
// 			this._pointNormal.multiplyScalar(-1);
// 			// if (this._is_up_present) {
// 			// 	point.attribValue(Attribute.UP, this._pointUp);
// 			// } else {
// 			this._pointUp.copy(DEFAULT.UP);
// 			// }
// 			this._pointUp.normalize();
// 			rotate_matrix.lookAt(eye, this._pointNormal, this._pointUp);

// 			targetMatrix.multiply(rotate_matrix);
// 		}

// 		targetMatrix.multiply(scale_matrix);
// 	}

// }

// /**
//  * Transform the input
//  *
//  *
//  */
// import {TypedCadNode} from './_Base';
// import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
// import {CadCoreGroup} from '../../../core/geometry/cad/CadCoreGroup';
// import {CadCoreObject} from '../../../core/geometry/cad/CadCoreObject';
// import {
// 	OpenCascadeInstance,
// 	cadObjectTypeFromShape,
// 	CadObjectType,
// 	gp_Pnt2d,
// 	Geom2d_Curve,
// 	TopoDS_Shape,
// } from '../../../core/geometry/cad/CadCommon';
// import {cadGeom2dCurveTransform} from '../../../core/geometry/cad/toObject3D/CadGeom2dCurve';
// import {cadPnt2dTransform} from '../../../core/geometry/cad/toObject3D/CadPnt2d';
// import {cadShapeTransform} from '../../../core/geometry/cad/toObject3D/CadShapeCommon';
// import {CadType} from '../../poly/registers/nodes/types/Cad';
// import {CadLoader} from '../../../core/geometry/cad/CadLoader';
// import {Vector3, Vector2} from 'three';

// const t2 = new Vector2();
// // TODO: scale should use current t as pivot (maybe just scale before translate?)
// // TODO: use a transform2D node that would have more sensible transform parameters
// class TransformCadParamsConfig extends NodeParamsConfig {
// 	/** @param translate */
// 	t = ParamConfig.VECTOR3([0, 0, 0]);
// 	/** @param rotation */
// 	r = ParamConfig.VECTOR3([0, 0, 0]);
// 	/** @param scale (as a float) */
// 	s = ParamConfig.FLOAT(1, {
// 		range: [0, 2],
// 		step: 0.01,
// 	});
// }
// const ParamsConfig = new TransformCadParamsConfig();

// export class TransformCadNode extends TypedCadNode<TransformCadParamsConfig> {
// 	override paramsConfig = ParamsConfig;
// 	static override type(): CadType.TRANSFORM {
// 		return CadType.TRANSFORM;
// 	}
// 	protected override initializeNode() {
// 		this.io.inputs.setCount(1);
// 	}

// 	override async cook(inputCoreGroups: CadCoreGroup[]) {
// 		const oc = await CadLoader.core();
// 		const coreGroup0 = inputCoreGroups[0];

// 		const inputObjects = coreGroup0.objects();
// 		const newObjects: CadCoreObject<CadObjectType>[] = [];
// 		for (let inputObject of inputObjects) {
// 			// object.transform(this.pv.t, this.pv.r, tmpS);
// 			const newObject = transform(oc, inputObject, this.pv.t, this.pv.r, this.pv.s);
// 			if (newObject) {
// 				newObjects.push(newObject);
// 			}
// 		}

// 		this.setCadObjects(newObjects);
// 	}
// }

// function transform(
// 	oc: OpenCascadeInstance,
// 	coreObject: CadCoreObject<CadObjectType>,
// 	t: Vector3,
// 	r: Vector3,
// 	s: number
// ) {
// 	switch (coreObject.type()) {
// 		case CadObjectType.POINT_2D: {
// 			t2.set(t.x, t.y);
// 			cadPnt2dTransform(coreObject.object() as gp_Pnt2d, t2);
// 			return coreObject;
// 		}
// 		case CadObjectType.CURVE_2D: {
// 			t2.set(t.x, t.y);
// 			cadGeom2dCurveTransform(coreObject.object() as Geom2d_Curve, t2, r.z, s);
// 			return coreObject;
// 		}

// 		case CadObjectType.VERTEX:
// 		case CadObjectType.EDGE:
// 		case CadObjectType.WIRE:
// 		case CadObjectType.FACE:
// 		case CadObjectType.SHELL:
// 		case CadObjectType.SOLID:
// 		case CadObjectType.COMPSOLID:
// 		case CadObjectType.COMPOUND: {
// 			// make sure to re-assign the object,
// 			// since it is not modified in place
// 			const newShape = cadShapeTransform(coreObject.object() as TopoDS_Shape, t, r, s);
// 			const type = cadObjectTypeFromShape(oc, newShape);
// 			if (type) {
// 				return new CadCoreObject(newShape, type);
// 			} else {
// 				console.log('no type', newShape);
// 			}
// 			return;
// 		}
// 	}
// }

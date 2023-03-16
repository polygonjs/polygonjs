// /**
//  * Creates an SDF Level Set.
//  *
//  *
//  */

// import {SDFSopNode} from './_BaseSDF';
// import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
// import {SopType} from '../../poly/registers/nodes/types/Sop';
// import {SDFLoader} from '../../../core/geometry/sdf/SDFLoader';
// import {Box} from '../../../core/geometry/sdf/SDFCommon';
// import {Number3} from '../../../types/GlobalTypes';
// import {Vector3} from 'three';

// const pi = Math.PI;
// const v3 = new Vector3();
// const box: Box = {min: [-1, -1, -1], max: [1, 1, 1]};
// function gyroid(p: Vector3) {
// 	const x = p.x - pi / 4;
// 	const y = p.y - pi / 4;
// 	const z = p.z - pi / 4;
// 	return Math.cos(x) * Math.sin(y) + Math.cos(y) * Math.sin(z) + Math.cos(z) * Math.sin(x);
// }

// class SDFLevelSetSopParamsConfig extends NodeParamsConfig {
// 	/** @param stepSize */
// 	stepSize = ParamConfig.FLOAT(0.1, {
// 		range: [0.01, 1],
// 		rangeLocked: [true, false],
// 	});
// 	/** @param level */
// 	level = ParamConfig.FLOAT(0.1, {
// 		range: [0.01, 1],
// 		rangeLocked: [true, false],
// 	});
// 	/** @param min bound */
// 	min = ParamConfig.VECTOR3([-1, -1, -1]);
// 	/** @param max bound */
// 	max = ParamConfig.VECTOR3([1, 1, 1]);
// }
// const ParamsConfig = new SDFLevelSetSopParamsConfig();

// export class SDFLevelSetSopNode extends SDFSopNode<SDFLevelSetSopParamsConfig> {
// 	override readonly paramsConfig = ParamsConfig;
// 	static override type() {
// 		return SopType.SDF_LEVEL_SET;
// 	}

// 	override async cook() {
// 		const manifold = await SDFLoader.core();
// 		this.pv.min.toArray(box.min);
// 		this.pv.max.toArray(box.max);
// 		const convertedFunction = (p: Number3) => {
// 			v3.fromArray(p);
// 			return gyroid(v3);
// 		};

// 		const geometry = manifold.levelSet(convertedFunction, box, this.pv.stepSize, this.pv.level);

// 		this.setSDFGeometry(geometry);

// 		// const coreGroup = inputCoreGroups[0];
// 		// const newObjects: SDFObject[] = [];
// 		// const inputObjects = coreGroup.SDFObjects();
// 		// if (inputObjects) {
// 		// 	const manifold = SDFLoaderSync.manifold();
// 		// 	const height = this.pv.height;
// 		// 	for (let object of inputObjects) {
// 		// 		manifold.extrude();
// 		// 		const mesh = object.SDFGeometry().getMesh();
// 		// 		const trisCount: number = mesh.numTri;
// 		// 		const halfEdgesCount = trisCount * 3;
// 		// 		console.log({triVerts: mesh.triVerts, trisCount, halfEdgesCount});
// 		// 		const halfEdges: Smoothness[] = new Array(halfEdgesCount);
// 		// 		for (let i = 0; i < trisCount; i++) {
// 		// 			halfEdges[3 * i + 0] = {halfedge: 3 * i + 0, smoothness};
// 		// 			halfEdges[3 * i + 1] = {halfedge: 3 * i + 1, smoothness};
// 		// 			halfEdges[3 * i + 2] = {halfedge: 3 * i + 2, smoothness};
// 		// 		}
// 		// 		console.log(halfEdges);
// 		// 		const smoothed = manifold.smooth(mesh, halfEdges);
// 		// 		const newObject = new SDFObject(smoothed);
// 		// 		newObjects.push(newObject);
// 		// 	}
// 		// }

// 		// this.setSDFObjects(newObjects);
// 	}
// }

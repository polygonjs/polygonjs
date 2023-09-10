// /**
//  * TBD
//  *
//  *
//  */
// import {TetSopNode} from './_BaseTet';
// import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
// import {CoreGroup} from '../../../core/geometry/Group';
// import {SopType} from '../../poly/registers/nodes/types/Sop';
// import {Vector3} from 'three';
// import {CoreObject} from '../../../core/geometry/modules/three/CoreObject';
// import {TetObject} from '../../../core/geometry/modules/tet/TetObject';
// import {findTetContainingPosition} from '../../../core/geometry/modules/tet/utils/findTetContainingPosition';
// import {TetNeighbourDataWithSource} from '../../../core/geometry/modules/tet/TetCommon';
// import {tetCenter} from '../../../core/geometry/modules/tet/utils/tetCenter';

// const _pos = new Vector3();
// const _rayOrigin = new Vector3();
// const sharedFacesNeighbourData: Set<TetNeighbourDataWithSource> = new Set();

// class TetSplitSopParamsConfig extends NodeParamsConfig {
// 	pointsCount = ParamConfig.INTEGER(-1, {
// 		range: [-1, 100],
// 		rangeLocked: [true, false],
// 	});
// }
// const ParamsConfig = new TetSplitSopParamsConfig();

// export class TetSplitSopNode extends TetSopNode<TetSplitSopParamsConfig> {
// 	override paramsConfig = ParamsConfig;
// 	static override type() {
// 		return SopType.TET_SPLIT;
// 	}

// 	protected override initializeNode() {
// 		this.io.inputs.setCount(2);
// 	}

// 	override cook(inputCoreGroups: CoreGroup[]) {
// 		const tetObjects = inputCoreGroups[0].tetObjects() || [];
// 		const threejsObjects = inputCoreGroups[1].threejsObjects();

// 		let i = 0;
// 		for (const tetObject of tetObjects) {
// 			const threejsObject = threejsObjects[i];
// 			const points = CoreObject.points(threejsObject);
// 			for (let point of points) {
// 				point.getPosition(_pos);
// 				this._splitTetObject(tetObject, _pos);
// 			}

// 			i++;
// 		}

// 		this.setTetObjects(tetObjects);
// 	}

// 	private _splitTetObject(tetObject: TetObject, position: Vector3) {
// 		const tetGeometry = tetObject.geometry;
// 		console.log('_splitTetObject', position.toArray());
// 		// 1. find tetrahedron containing the point
// 		const firstId = tetObject.geometry.firstTetId();
// 		if (firstId == null) {
// 			return;
// 		}
// 		tetCenter(tetGeometry, firstId, _rayOrigin);
// 		console.log({_rayOrigin});
// 		const tetId = findTetContainingPosition(tetGeometry, position, _rayOrigin, firstId);
// 		console.log({tetId});

// 		// 2. remove tetrahedron
// 		if (tetId == null) {
// 			return;
// 		}
// 		tetGeometry.removeTets([tetId], sharedFacesNeighbourData);

// 		// 3. replace with new tetrahedrons
// 		const pointId = tetGeometry.addPoint(position.x, position.y, position.z);
// 		sharedFacesNeighbourData.forEach((neighbourDataWithSource) => {
// 			// const pointIndices = TET_FACE_POINT_INDICES[neighbourDataWithSource.faceIndex];
// 			const id0 = neighbourDataWithSource.pointIds[0];
// 			const id1 = neighbourDataWithSource.pointIds[1];
// 			const id2 = neighbourDataWithSource.pointIds[2];
// 			tetGeometry.addTetrahedron(pointId, id0, id1, id2);
// 		});
// 	}
// }

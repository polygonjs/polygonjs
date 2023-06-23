/**
 * Converts an input geometry to tetrahedrons
 *
 *
 *
 */
import {TetSopNode} from './_BaseTet';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {CoreGroup} from '../../../core/geometry/Group';
import {tetrahedralize} from '../../../core/geometry/tet/utils/tetrahedralize';
import {TetGeometry} from '../../../core/geometry/tet/TetGeometry';
import {MeshWithBVHGeometry, ThreeMeshBVHHelper} from '../../../core/geometry/bvh/ThreeMeshBVHHelper';
import {Mesh, Vector3} from 'three';
import {mergeFaces} from '../../../core/geometry/operation/Fuse';
// import {CoreGeometry} from '../../../core/geometry/Geometry';
import {jitterPositions} from '../../../core/geometry/operation/Jitter';

const jitterMult = new Vector3(1, 1, 1);
class TetrahedralizeSopParamsConfig extends NodeParamsConfig {
	fuseDist = ParamConfig.FLOAT(0.001);
	jitter = ParamConfig.FLOAT(0.001);
	innerPointsResolution = ParamConfig.INTEGER(5, {
		range: [0, 10],
	});
	// traversalMethod = ParamConfig.INTEGER(POINTS_TRAVERSAL_METHODS.indexOf(PointsTraversalMethod.MERGE), {
	// 	menu: {
	// 		entries: POINTS_TRAVERSAL_METHODS.map((name, value) => ({name, value})),
	// 	},
	// });
	// axisSort = ParamConfig.VECTOR3([1, 1, 1], {});
	// minQualityExp = ParamConfig.FLOAT(-2, {
	// 	range: [-4, 0],
	// 	rangeLocked: [true, true],
	// });
	stepByStep = ParamConfig.BOOLEAN(0, {
		separatorBefore: true,
	});
	step = ParamConfig.INTEGER(-1, {
		range: [-1, 5000],
		rangeLocked: [true, false],
		visibleIf: {stepByStep: 1},
	});
	deleteOutsideTets = ParamConfig.BOOLEAN(1, {
		visibleIf: {stepByStep: 1},
	});
}
const ParamsConfig = new TetrahedralizeSopParamsConfig();

export class TetrahedralizeSopNode extends TetSopNode<TetrahedralizeSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.TETRAHEDRALIZE;
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
	}

	override cook(inputCoreGroups: CoreGroup[]) {
		const coreGroup = inputCoreGroups[0];
		const inputMeshes = coreGroup.threejsObjectsWithGeo() as Mesh[];
		// const additionalPointsObjects = inputCoreGroups[1]?.threejsObjects();

		for (let inputMesh of inputMeshes) {
			mergeFaces(inputMesh.geometry, this.pv.fuseDist);
		}
		jitterPositions(coreGroup, {
			amount: this.pv.jitter,
			mult: jitterMult,
			seed: 0,
		});

		const tetGeometries: TetGeometry[] = [];
		// let i = 0;
		for (let inputMesh of inputMeshes) {
			// const additionalPointsObject = additionalPointsObjects ? additionalPointsObjects[i] : null;
			// const additionalPoints =
			// 	additionalPointsObject && (additionalPointsObject as Mesh).geometry
			// 		? CoreGeometry.points((additionalPointsObject as Mesh).geometry).map((p) => p.position())
			// 		: [];

			ThreeMeshBVHHelper.assignDefaultBVHIfNone(inputMesh);
			const tetGeometry = tetrahedralize({
				// traversalMethod: POINTS_TRAVERSAL_METHODS[this.pv.traversalMethod],
				// axisSort: this.pv.axisSort,
				mesh: inputMesh as MeshWithBVHGeometry,
				innerPointsResolution: this.pv.innerPointsResolution,
				jitterAmount: this.pv.jitter,
				// additionalPoints: additionalPoints,
				// minQuality: Math.pow(10.0, this.pv.minQualityExp),
				stage: this.pv.stepByStep ? (this.pv.step >= 0 ? this.pv.step : null) : null,
				deleteOutsideTets: this.pv.stepByStep ? this.pv.deleteOutsideTets : true,
			});
			tetGeometries.push(tetGeometry);
			// i++;
		}

		this.setTetGeometries(tetGeometries);
	}
}

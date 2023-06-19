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
import {TET_CREATION_STAGES, tetrahedralize} from '../../../core/geometry/tet/utils/tetrahedralize';
import {TetGeometry} from '../../../core/geometry/tet/TetGeometry';
import {MeshWithBVHGeometry, ThreeMeshBVHHelper} from '../../../core/geometry/bvh/ThreeMeshBVHHelper';
import {Mesh} from 'three';
import {mergeFaces} from '../../../core/geometry/operation/Fuse';

class TetrahedralizeSopParamsConfig extends NodeParamsConfig {
	resolution = ParamConfig.INTEGER(10, {
		range: [0, 100],
		rangeLocked: [true, false],
	});
	minQualityExp = ParamConfig.FLOAT(-2, {
		range: [-4, 0],
		rangeLocked: [true, true],
	});
	stage = ParamConfig.INTEGER(0, {
		menu: {
			entries: TET_CREATION_STAGES.map((name, value) => ({name, value})),
		},
		separatorBefore: true,
	});
	subStage = ParamConfig.INTEGER(0, {
		range: [0, 100],
		rangeLocked: [true, false],
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
		const objects = inputCoreGroups[0].threejsObjectsWithGeo() as Mesh[];

		const tetGeometries: TetGeometry[] = [];
		for (let object of objects) {
			mergeFaces(object.geometry, 0.01);
			ThreeMeshBVHHelper.assignDefaultBVHIfNone(object);
			const tetGeometry = tetrahedralize({
				mesh: object as MeshWithBVHGeometry,
				// resolution: params.resolution,
				minQuality: Math.pow(10.0, this.pv.minQualityExp),
				// oneFacePerTet: params.oneFacePerTet,
				// scale: params.tetScale,
				//
				stage: TET_CREATION_STAGES[this.pv.stage],
				subStage: this.pv.subStage,
				// removeOutsideTets: params.removeOutsideTets,
			});
			tetGeometries.push(tetGeometry);
		}

		this.setTetGeometries(tetGeometries);

		// this._operation = this._operation || new TetrahedralizeSopOperation(this.scene(), this.states);
		// const coreGroup = this._operation.cook(inputCoreGroups, this.pv);
		// this.setCoreGroup(coreGroup);
	}
}

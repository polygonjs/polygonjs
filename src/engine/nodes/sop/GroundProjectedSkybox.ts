/**
 * Creates a ground projected sky box
 *
 */

import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {NodeContext} from '../../poly/NodeContext';
import {SopType} from '../../poly/registers/nodes/types/Sop';
// import {GroundProjectedSkybox} from 'three/examples/jsm/objects/GroundProjectedSkybox';
import {GroundProjectedSkybox} from '../../../core/geometry/builders/groundProjectedSkybox/GroundProjectedSkybox';

class GroundProjectedSkyboxSopParamsConfig extends NodeParamsConfig {
	/** @param envMap */
	envMap = ParamConfig.NODE_PATH('', {
		nodeSelection: {
			context: NodeContext.COP,
		},
		dependentOnFoundNode: false,
	});
	/** @param scale */
	scale = ParamConfig.FLOAT(50, {
		range: [0, 100],
		rangeLocked: [true, false],
	});
	/** @param radius */
	radius = ParamConfig.FLOAT(200, {
		range: [0, 1000],
		rangeLocked: [true, false],
	});
	/** @param height */
	height = ParamConfig.FLOAT(20, {
		range: [0, 100],
		rangeLocked: [true, false],
	});
}
const ParamsConfig = new GroundProjectedSkyboxSopParamsConfig();

export class GroundProjectedSkyboxSopNode extends TypedSopNode<GroundProjectedSkyboxSopParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return SopType.GROUND_PROJECTED_SKYBOX;
	}

	protected override initializeNode() {
		this.io.inputs.setCount(0);
	}

	override async cook(inputCoreGroups: CoreGroup[]) {
		const textureNode = this.pv.envMap.nodeWithContext(NodeContext.COP, this.states?.error);
		if (!textureNode) {
			this.states?.error.set(`no texture node found`);
			return;
		}
		const container = await textureNode.compute();
		const texture = container.texture();

		const skybox = new GroundProjectedSkybox();
		const scale = this.pv.scale;
		skybox.scale.set(scale, scale, scale);
		skybox.updateMatrix();
		skybox.matrixAutoUpdate = false;
		skybox.setTexture(texture);
		skybox.radius = this.pv.radius;
		skybox.height = this.pv.height;
		this.setObject(skybox);
	}
}

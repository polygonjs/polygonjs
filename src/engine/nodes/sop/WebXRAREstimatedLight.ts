/**
 * Creates a light setup from a webXR AR session.
 *
 */

import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {Group} from 'three';
import {ThreejsObject} from '../../../core/geometry/modules/three/ThreejsObject';
import {CoreWebXRAREstimatedLightController} from '../../../core/webXR/webXRAR/CoreWebXRAREstimatedLightController';
import {SopType} from '../../poly/registers/nodes/types/Sop';
const ATTRIB_NAME = CoreWebXRAREstimatedLightController.ATTRIB_NAME;

class WebXRAREstimatedLightSopParamsConfig extends NodeParamsConfig {
	/** @param default environment map */
	// defaultEnvironment = ParamConfig.NODE_PATH('', {
	// 	nodeSelection: {
	// 		context: NodeContext.COP,
	// 	},
	// });
	/** @param apply computed environment */
	applyEnv = ParamConfig.BOOLEAN(1);
	/** @param apply computed light Probe */
	applyLightProbe = ParamConfig.BOOLEAN(1);
	/** @param apply computed directional Light */
	applyDirectionalLight = ParamConfig.BOOLEAN(1);
	/** @param directional Light intensity */
	// directionalLightIntensity = ParamConfig.FLOAT(1, {
	// 	range: [0, 1],
	// 	rangeLocked: [true, false],
	// 	visibleIf: {
	// 		applyDirectionalLight: 1,
	// 	},
	// });
}
const ParamsConfig = new WebXRAREstimatedLightSopParamsConfig();

export class WebXRAREstimatedLightSopNode extends TypedSopNode<WebXRAREstimatedLightSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.WEB_XR_AR_ESTIMATED_LIGHT;
	}

	override initializeNode() {
		this.io.inputs.setCount(0, 1);
	}

	override cook(inputCoreGroups: CoreGroup[]) {
		const coreGroup = inputCoreGroups[0];

		const defaultLightsParent = new Group();
		defaultLightsParent.name = `defaultLightsParent`;
		defaultLightsParent.matrixAutoUpdate = false;
		ThreejsObject.addAttribute(defaultLightsParent, ATTRIB_NAME.IS_DEFAULT_LIGHTS_PARENT, true);

		const objects = coreGroup.threejsObjects();
		for (let object of objects) {
			defaultLightsParent.add(object);
		}

		const group = new Group();
		group.name = this.path();
		group.matrixAutoUpdate = false;
		group.add(defaultLightsParent);
		ThreejsObject.addAttribute(group, ATTRIB_NAME.IS_ESTIMATED_LIGHT, true);
		ThreejsObject.addAttribute(group, ATTRIB_NAME.APPLY_ENV, this.pv.applyEnv);
		ThreejsObject.addAttribute(group, ATTRIB_NAME.APPLY_LIGHT_PROBE, this.pv.applyLightProbe);
		ThreejsObject.addAttribute(group, ATTRIB_NAME.APPLY_DIR_LIGHT, this.pv.applyDirectionalLight);
		// CoreObject.addAttribute(group, ATTRIB_NAME.DIR_LIGHT_INTENSITY, this.pv.directionalLightIntensity);

		// const node = this.pv.defaultEnvironment.nodeWithContext(NodeContext.COP);
		// if (node) {
		// 	CoreObject.addAttribute(group, ATTRIB_NAME.DEFAULT_ENVIRONMENT_COP_NODE_ID, node.graphNodeId());
		// } else {
		// 	this.states.error.set('default environment node not found');
		// }

		this.setObject(group);
	}
}

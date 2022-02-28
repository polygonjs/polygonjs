/**
 * Update the object's hover states
 *
 *
 */

import {TypedActorNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {Object3D} from 'three/src/core/Object3D';
class HoveredActorParamsConfig extends NodeParamsConfig {
	/** @param defines if the hover will be detected on children or not */
	includeChildren = ParamConfig.BOOLEAN(0);
}
const ParamsConfig = new HoveredActorParamsConfig();

export class HoveredActorNode extends TypedActorNode<HoveredActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'hovered';
	}

	override processActor(object: Object3D) {
		// I need
		// - current camera
		// - current mouse pos
		// - and how do I trigger anything? ie: material color change, or scale
		object.userData.states = {active: true};
		object.updateMatrix();
	}
}

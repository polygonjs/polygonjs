/**
 * Update the object's scale
 *
 *
 */

import {TypedActorNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {AttribType, AttribTypeMenuEntries, ATTRIBUTE_TYPES} from '../../../core/geometry/Constant';
import {ActorConnectionPoint, ActorConnectionPointType} from '../utils/io/connections/Actor';
class OnObjectAttributeUpdatedActorParamsConfig extends NodeParamsConfig {
	/** @param the attribute type (numeric or string) */
	type = ParamConfig.INTEGER(ATTRIBUTE_TYPES.indexOf(AttribType.NUMERIC), {
		menu: {
			entries: AttribTypeMenuEntries,
		},
	});
	/** @param the attribute name */
	name = ParamConfig.STRING('');
	/** @param the attribute size (1 for float, 2 for vector2, 3 for vector3, 4 for vector4) */
	size = ParamConfig.INTEGER(1, {
		range: [1, 4],
		rangeLocked: [true, true],
		visibleIf: {type: AttribType.NUMERIC},
	});
}
const ParamsConfig = new OnObjectAttributeUpdatedActorParamsConfig();

export class OnObjectAttributeUpdatedActorNode extends TypedActorNode<OnObjectAttributeUpdatedActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'onObjectAttributeUpdated';
	}

	override initializeNode() {
		this.io.outputs.setNamedOutputConnectionPoints([
			new ActorConnectionPoint('trigger', ActorConnectionPointType.TRIGGER),
		]);
	}
}

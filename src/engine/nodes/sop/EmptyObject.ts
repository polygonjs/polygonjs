/**
 * Creates an empty object
 *
 *
 */

import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {EmptyObjectSopOperation} from '../../operations/sop/EmptyObject';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {ObjectType} from '../../../core/geometry/Constant';

const OBJECT_TYPES: ObjectType[] = [
	ObjectType.OBJECT3D,
	ObjectType.GROUP,
	ObjectType.MESH,
	ObjectType.POINTS,
	ObjectType.LINE_SEGMENTS,
];

class EmptyObjectSopParamsConfig extends NodeParamsConfig {
	type = ParamConfig.STRING(ObjectType.GROUP, {
		menuString: {
			entries: OBJECT_TYPES.map((name, value) => ({name, value: name})),
		},
	});
}
const ParamsConfig = new EmptyObjectSopParamsConfig();

export class EmptyObjectSopNode extends TypedSopNode<EmptyObjectSopParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'emptyObject';
	}

	protected override initializeNode() {
		this.io.inputs.setCount(0);
	}

	private _operation: EmptyObjectSopOperation | undefined;
	override cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new EmptyObjectSopOperation(this._scene, this.states, this);
		const type = this.pv.type as ObjectType;
		const coreGroup = this._operation.cook(input_contents, {type});
		this.setCoreGroup(coreGroup);
	}
	setObjectType(objectType: ObjectType) {
		this.p.type.set(objectType);
	}
	objectType(): ObjectType | undefined {
		const included = OBJECT_TYPES.includes(this.pv.type as ObjectType);
		return included ? (this.pv.type as ObjectType) : undefined;
	}
}

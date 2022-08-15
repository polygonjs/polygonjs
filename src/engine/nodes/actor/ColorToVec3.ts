/**
 * converts a color to a vector3
 *
 *
 */
import {Number3} from '../../../types/GlobalTypes';
import {ActorNodeTriggerContext} from './_Base';
import {ParamType} from '../../poly/ParamType';
import {
	ActorConnectionPoint,
	ActorConnectionPointType,
	ReturnValueTypeByActorConnectionPointType,
} from '../utils/io/connections/Actor';
import {Vector3, Color} from 'three';
import {BaseVecToActorNode} from './_ConversionVecTo';

const components_c = ['r', 'g', 'b'];

enum ColorToVec3ActorNodeOutputName {
	VEC3 = 'Vector3',
}
const tmpV3 = new Vector3();
export class ColorToVec3ActorNode extends BaseVecToActorNode {
	static override type() {
		return 'colorToVec3';
	}
	static readonly INPUT_NAME_COLOR = 'color';

	override initializeNode() {
		this.io.outputs.setNamedOutputConnectionPoints([
			new ActorConnectionPoint(ColorToVec3ActorNodeOutputName.VEC3, ActorConnectionPointType.VECTOR3),
		]);
	}
	override createParams() {
		this.addParam(ParamType.COLOR, ColorToVec3ActorNode.INPUT_NAME_COLOR, components_c.map((c) => 0) as Number3);
	}

	private _defaultColor = new Color();
	public override outputValue(
		context: ActorNodeTriggerContext,
		outputName: ColorToVec3ActorNodeOutputName = ColorToVec3ActorNodeOutputName.VEC3
	): ReturnValueTypeByActorConnectionPointType[ActorConnectionPointType] {
		const color =
			this._inputValue<ActorConnectionPointType.COLOR>(ColorToVec3ActorNode.INPUT_NAME_COLOR, context) ||
			this._defaultColor;

		tmpV3.x = color.r;
		tmpV3.y = color.g;
		tmpV3.z = color.b;
		return tmpV3;
	}
}

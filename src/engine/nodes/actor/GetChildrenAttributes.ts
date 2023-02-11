/**
 * get an object attribute
 *
 *
 */

import {ActorNodeTriggerContext, TypedActorNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {
	ActorConnectionPoint,
	ActorConnectionPointType,
	ActorConnectionPointTypeToArrayTypeMap,
	ACTOR_CONNECTION_POINT_IN_NODE_DEF,
	PARAM_CONVERTIBLE_ACTOR_CONNECTION_POINT_TYPES,
	ReturnValueTypeByActorConnectionPointType,
} from '../utils/io/connections/Actor';
import {CoreObject} from '../../../core/geometry/Object';
import {CoreType} from '../../../core/Type';
import {
	Copyable,
	CreateCopyableItemFunc,
	updateCopyableArrayLength,
	updatePrimitiveArrayLength,
} from '../../../core/ArrayCopyUtils';
import {Vector2, Vector3, Vector4, Quaternion, Color, Object3D} from 'three';

const CONNECTION_OPTIONS = ACTOR_CONNECTION_POINT_IN_NODE_DEF;

const tmpV2Item: Vector2 = new Vector2();
const tmpV3Item: Vector3 = new Vector3();
const tmpV4Item: Vector4 = new Vector4();
const tmpQuatItem: Quaternion = new Quaternion();
const tmpColorItem: Color = new Color();
const tmpV2: Vector2[] = [];
const tmpV3: Vector3[] = [];
const tmpV4: Vector4[] = [];
const tmpQuat: Quaternion[] = [];
const tmpColor: Color[] = [];
const tmpBoolean: boolean[] = [];
const tmpString: string[] = [];
const tmpNumber: number[] = [];
const createVector2: CreateCopyableItemFunc<Vector2> = () => new Vector2();
const createVector3: CreateCopyableItemFunc<Vector3> = () => new Vector3();
const createVector4: CreateCopyableItemFunc<Vector4> = () => new Vector4();
const createQuaternion: CreateCopyableItemFunc<Quaternion> = () => new Quaternion();
const createColor: CreateCopyableItemFunc<Color> = () => new Color();

function updateCopyableArray<V extends Copyable>(
	children: Object3D[],
	attribName: string,
	targetVectors: V[],
	targetItem: V,
	createItem: CreateCopyableItemFunc<V>
) {
	updateCopyableArrayLength(targetVectors, children.length, createItem);

	for (let i = 0; i < children.length; i++) {
		CoreObject.attribValue(children[i], attribName, targetItem as any) as V;
		targetVectors[i].copy(targetItem as any);
	}
	return targetVectors;
}
function updatePrimitiveArray<T extends boolean | number | string>(
	children: Object3D[],
	attribName: string,
	targetValues: T[],
	defaultValue: T
) {
	updatePrimitiveArrayLength(targetValues, children.length, defaultValue);
	for (let i = 0; i < children.length; i++) {
		const val = CoreObject.attribValue(children[i], attribName, defaultValue as any) as T;
		targetValues[i] = val;
	}
	return targetValues;
}

class GetChildrenAttributesActorParamsConfig extends NodeParamsConfig {
	attribName = ParamConfig.STRING('');
	type = ParamConfig.INTEGER(PARAM_CONVERTIBLE_ACTOR_CONNECTION_POINT_TYPES.indexOf(ActorConnectionPointType.FLOAT), {
		menu: {
			entries: PARAM_CONVERTIBLE_ACTOR_CONNECTION_POINT_TYPES.map((name, i) => {
				return {name: name, value: i};
			}),
		},
	});
}
const ParamsConfig = new GetChildrenAttributesActorParamsConfig();

export class GetChildrenAttributesActorNode extends TypedActorNode<GetChildrenAttributesActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'getChildrenAttributes';
	}

	static readonly OUTPUT_NAME = 'val';
	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new ActorConnectionPoint(
				ActorConnectionPointType.OBJECT_3D,
				ActorConnectionPointType.OBJECT_3D,
				CONNECTION_OPTIONS
			),
		]);

		this.io.connection_points.set_expected_input_types_function(() => []);
		this.io.connection_points.set_output_name_function(
			(index: number) => GetChildrenAttributesActorNode.OUTPUT_NAME
		);
		this.io.connection_points.set_expected_output_types_function(() => [this._currentConnectionType()]);
	}
	private _currentConnectionType() {
		if (this.pv.type == null) {
			console.warn(`${this.type()} actor node type not valid`);
		}
		const connectionType = PARAM_CONVERTIBLE_ACTOR_CONNECTION_POINT_TYPES[this.pv.type];
		if (connectionType == null) {
			console.warn(`${this.type()} actor node type not valid`);
		}
		const arrayConnectionType = ActorConnectionPointTypeToArrayTypeMap[connectionType];
		return arrayConnectionType;
	}

	setAttribType(type: ActorConnectionPointType) {
		this.p.type.set(PARAM_CONVERTIBLE_ACTOR_CONNECTION_POINT_TYPES.indexOf(type));
	}

	public override outputValue(
		context: ActorNodeTriggerContext
	): ReturnValueTypeByActorConnectionPointType[ActorConnectionPointType] | undefined {
		const Object3D =
			this._inputValue<ActorConnectionPointType.OBJECT_3D>(ActorConnectionPointType.OBJECT_3D, context) ||
			context.Object3D;

		const children = Object3D.children;
		if (children.length == 0) {
			return [];
		}
		const attribName = this.pv.attribName;
		const firstChild = children[0];
		const firstValue = CoreObject.attribValue(firstChild, attribName);
		if (firstValue == null) {
			return [];
		}
		if (CoreType.isVector(firstValue)) {
			if (firstValue instanceof Vector2) {
				return updateCopyableArray(children, attribName, tmpV2, tmpV2Item, createVector2);
			}
			if (firstValue instanceof Vector3) {
				return updateCopyableArray(children, attribName, tmpV3, tmpV3Item, createVector3);
			}
			if (firstValue instanceof Quaternion) {
				return updateCopyableArray(children, attribName, tmpV4, tmpV4Item, createVector4);
			}
		}
		if (CoreType.isQuaternion(firstValue)) {
			return updateCopyableArray(children, attribName, tmpQuat, tmpQuatItem, createQuaternion);
		}
		if (CoreType.isColor(firstValue)) {
			return updateCopyableArray(children, attribName, tmpColor, tmpColorItem, createColor);
		}
		if (CoreType.isString(firstValue)) {
			return updatePrimitiveArray(children, attribName, tmpString, firstValue);
		}
		if (CoreType.isNumber(firstValue)) {
			return updatePrimitiveArray(children, attribName, tmpNumber, firstValue);
		}
		if (CoreType.isBoolean(firstValue)) {
			return updatePrimitiveArray(children, attribName, tmpBoolean, firstValue);
		}

		// last resort if type was not matched in the previous CoreType.isX
		return Object3D.children.map((child) =>
			CoreObject.attribValue(child, this.pv.attribName)
		) as ReturnValueTypeByActorConnectionPointType[ActorConnectionPointType];
	}
}

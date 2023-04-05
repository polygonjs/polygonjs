/**
 * get an object properties
 *
 *
 */

import {ParamlessTypedJsNode} from './_Base';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {inputObject3D} from './_BaseObject3D';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {Poly} from '../../Poly';
import {PrimitiveArray, VectorArray} from './code/assemblers/_BaseJsPersistedConfigUtils';
import {Quaternion, Vector3} from 'three';
// import {
// 	Vector3,
// 	Quaternion,
// 	Object3D,
// } from 'three';
// import {
// 	Copyable,
// 	CreateCopyableItemFunc,
// 	updateCopyableArrayLength,
// 	updatePrimitiveArrayLength,
// } from '../../../core/ArrayCopyUtils';

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

enum GetChildrenPropertiesJsNodeInputName {
	position = 'position',
	quaternion = 'quaternion',
	scale = 'scale',
	// matrix = 'matrix',
	visible = 'visible',
	castShadow = 'castShadow',
	receiveShadow = 'receiveShadow',
	frustumCulled = 'frustumCulled',
	// ptnum = 'ptnum',
	// id = 'id',
	// uuid = 'uuid',
	// name = 'name',
	// quaternion = 'quaternion',
	// rotation = 'rotation',
	up = 'up',
	matrixAutoUpdate = 'matrixAutoUpdate',
}
// const OBJECT_PROPERTIES: GetChildrenPropertiesJsNodeInputName[] = [
// 	GetChildrenPropertiesJsNodeInputName.position,
// 	GetChildrenPropertiesJsNodeInputName.quaternion,
// 	GetChildrenPropertiesJsNodeInputName.scale,
// 	// GetChildrenPropertiesJsNodeInputName.matrix,
// 	GetChildrenPropertiesJsNodeInputName.visible,
// 	GetChildrenPropertiesJsNodeInputName.castShadow,
// 	GetChildrenPropertiesJsNodeInputName.receiveShadow,
// 	GetChildrenPropertiesJsNodeInputName.frustumCulled,
// 	// GetChildrenPropertiesJsNodeInputName.uuid,
// 	// GetChildrenPropertiesJsNodeInputName.name,
// 	GetChildrenPropertiesJsNodeInputName.up,
// 	GetChildrenPropertiesJsNodeInputName.matrixAutoUpdate,
// ];
//  const MATERIAL_OUTPUT = 'material';

/**
 *
 * We need different arrays per property.
 * Otherwise, a downstream node which would
 * query positions and scales would receive 2 identical arrays,
 * instead of 2 distinct ones
 *
 */
// const tmpPositions: Vector3[] = [];
// const tmpQuat: Quaternion[] = [];
// const tmpScales: Vector3[] = [];
// const tmpVisibles: boolean[] = [];
// const tmpCastShadows: boolean[] = [];
// const tmpReceiveShadows: boolean[] = [];
// const tmpFrustumCulleds: boolean[] = [];
// const tmpUps: Vector3[] = [];
// const tmpMatrixAutoUpdates: boolean[] = [];
// const createVector2: CreateCopyableItemFunc<Vector2> = () => new Vector2();
// const createVector3: CreateCopyableItemFunc<Vector3> = () => new Vector3();
// const createQuaternion: CreateCopyableItemFunc<Quaternion> = () => new Quaternion();

// function updateCopyableArray<V extends Copyable>(
// 	children: Object3D[],
// 	propertyName: GetChildrenPropertiesJsNodeInputName,
// 	targetVectors: V[],
// 	createItem: CreateCopyableItemFunc<V>
// ) {
// 	updateCopyableArrayLength(targetVectors, children.length, createItem);

// 	for (let i = 0; i < children.length; i++) {
// 		const val = children[i][propertyName as GetChildrenPropertiesJsNodeInputName] as V;
// 		targetVectors[i].copy(val as any);
// 	}
// 	return targetVectors;
// }

// function updatePrimitiveArray<T extends boolean | number | string>(
// 	children: Object3D[],
// 	propertyName: GetChildrenPropertiesJsNodeInputName,
// 	targetValues: T[],
// 	defaultValue: T
// ) {
// 	updatePrimitiveArrayLength(targetValues, children.length, defaultValue);
// 	for (let i = 0; i < children.length; i++) {
// 		const val = children[i][propertyName as GetChildrenPropertiesJsNodeInputName] as T;
// 		targetValues[i] = val;
// 	}
// 	return targetValues;
// }

export class GetChildrenPropertiesJsNode extends ParamlessTypedJsNode {
	static override type() {
		return 'getChildrenProperties';
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(JsConnectionPointType.OBJECT_3D, JsConnectionPointType.OBJECT_3D, CONNECTION_OPTIONS),
		]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(GetChildrenPropertiesJsNodeInputName.position, JsConnectionPointType.VECTOR3_ARRAY),
			new JsConnectionPoint(
				GetChildrenPropertiesJsNodeInputName.quaternion,
				JsConnectionPointType.QUATERNION_ARRAY
			),
			new JsConnectionPoint(GetChildrenPropertiesJsNodeInputName.scale, JsConnectionPointType.VECTOR3_ARRAY),
			// new JsConnectionPoint(
			// 	GetChildrenPropertiesJsNodeInputName.matrix,
			// 	JsConnectionPointType.MATRIX4_ARRAY
			// ),
			new JsConnectionPoint(GetChildrenPropertiesJsNodeInputName.up, JsConnectionPointType.VECTOR3_ARRAY),
			new JsConnectionPoint(GetChildrenPropertiesJsNodeInputName.visible, JsConnectionPointType.BOOLEAN_ARRAY),
			new JsConnectionPoint(
				GetChildrenPropertiesJsNodeInputName.matrixAutoUpdate,
				JsConnectionPointType.BOOLEAN_ARRAY
			),
			new JsConnectionPoint(GetChildrenPropertiesJsNodeInputName.castShadow, JsConnectionPointType.BOOLEAN_ARRAY),
			new JsConnectionPoint(
				GetChildrenPropertiesJsNodeInputName.receiveShadow,
				JsConnectionPointType.BOOLEAN_ARRAY
			),
			new JsConnectionPoint(
				GetChildrenPropertiesJsNodeInputName.frustumCulled,
				JsConnectionPointType.BOOLEAN_ARRAY
			),
			// new JsConnectionPoint(GetChildrenPropertiesJsNodeInputName.id, JsConnectionPointType.INTEGER),
			// new JsConnectionPoint(GetChildrenPropertiesJsNodeInputName.uuid, JsConnectionPointType.BOOLEAN),
			//  new JsConnectionPoint(MATERIAL_OUTPUT, JsConnectionPointType.MATERIAL),
		]);
	}

	override setLines(shadersCollectionController: ShadersCollectionController) {
		const usedOutputNames = this.io.outputs.used_output_names();
		const object3D = inputObject3D(this, shadersCollectionController);
		const _v3 = (
			propertyName: GetChildrenPropertiesJsNodeInputName,
			functionName: 'getChildrenPropertiesPosition' | 'getChildrenPropertiesScale' | 'getChildrenPropertiesUp',
			type: JsConnectionPointType
		) => {
			if (!usedOutputNames.includes(propertyName)) {
				return;
			}
			const varName = this.jsVarName(propertyName);
			shadersCollectionController.addVariable(this, varName, new VectorArray([new Vector3()]));
			const func = Poly.namedFunctionsRegister.getFunction(functionName, this, shadersCollectionController);
			shadersCollectionController.addBodyOrComputed(this, [
				{
					dataType: type,
					varName,
					value: func.asString(object3D, varName),
				},
			]);
		};
		const _q = (
			propertyName: GetChildrenPropertiesJsNodeInputName,
			functionName: 'getChildrenPropertiesQuaternion',
			type: JsConnectionPointType
		) => {
			if (!usedOutputNames.includes(propertyName)) {
				return;
			}
			const varName = this.jsVarName(propertyName);
			shadersCollectionController.addVariable(this, varName, new VectorArray([new Quaternion()]));
			const func = Poly.namedFunctionsRegister.getFunction(functionName, this, shadersCollectionController);
			shadersCollectionController.addBodyOrComputed(this, [
				{
					dataType: type,
					varName,
					value: func.asString(object3D, varName),
				},
			]);
		};
		const _b = (
			propertyName: GetChildrenPropertiesJsNodeInputName,
			functionName:
				| 'getChildrenPropertiesVisible'
				| 'getChildrenPropertiesMatrixAutoUpdate'
				| 'getChildrenPropertiesCastShadow'
				| 'getChildrenPropertiesReceiveShadow'
				| 'getChildrenPropertiesFrustumCulled',
			type: JsConnectionPointType
		) => {
			if (!usedOutputNames.includes(propertyName)) {
				return;
			}
			const varName = this.jsVarName(propertyName);
			shadersCollectionController.addVariable(this, varName, new PrimitiveArray([false]));
			const func = Poly.namedFunctionsRegister.getFunction(functionName, this, shadersCollectionController);
			shadersCollectionController.addBodyOrComputed(this, [
				{
					dataType: type,
					varName,
					value: func.asString(object3D, varName),
				},
			]);
		};

		_v3(
			GetChildrenPropertiesJsNodeInputName.position,
			'getChildrenPropertiesPosition',
			JsConnectionPointType.VECTOR3_ARRAY
		);
		_v3(
			GetChildrenPropertiesJsNodeInputName.scale,
			'getChildrenPropertiesScale',
			JsConnectionPointType.VECTOR3_ARRAY
		);
		_v3(GetChildrenPropertiesJsNodeInputName.up, 'getChildrenPropertiesUp', JsConnectionPointType.VECTOR3_ARRAY);
		_q(
			GetChildrenPropertiesJsNodeInputName.quaternion,
			'getChildrenPropertiesQuaternion',
			JsConnectionPointType.QUATERNION_ARRAY
		);
		_b(
			GetChildrenPropertiesJsNodeInputName.visible,
			'getChildrenPropertiesVisible',
			JsConnectionPointType.BOOLEAN_ARRAY
		);
		_b(
			GetChildrenPropertiesJsNodeInputName.matrixAutoUpdate,
			'getChildrenPropertiesMatrixAutoUpdate',
			JsConnectionPointType.BOOLEAN_ARRAY
		);
		_b(
			GetChildrenPropertiesJsNodeInputName.castShadow,
			'getChildrenPropertiesCastShadow',
			JsConnectionPointType.BOOLEAN_ARRAY
		);
		_b(
			GetChildrenPropertiesJsNodeInputName.receiveShadow,
			'getChildrenPropertiesReceiveShadow',
			JsConnectionPointType.BOOLEAN_ARRAY
		);
		_b(
			GetChildrenPropertiesJsNodeInputName.frustumCulled,
			'getChildrenPropertiesFrustumCulled',
			JsConnectionPointType.BOOLEAN_ARRAY
		);
	}
}

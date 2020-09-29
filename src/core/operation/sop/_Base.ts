import {CoreGroup} from '../../geometry/Group';
import {BaseOperation, BaseOperationContainer} from '../_Base';
import {NodeContext} from '../../../engine/poly/NodeContext';
import {ParamsInitData} from '../../../engine/nodes/utils/io/IOController';
import {BufferGeometry} from 'three/src/core/BufferGeometry';
import {ObjectType, ObjectByObjectType, OBJECT_CONSTRUCTOR_BY_OBJECT_TYPE, CoreConstant} from '../../geometry/Constant';
import {CoreGeometryIndexBuilder} from '../../geometry/util/IndexBuilder';
import {Material} from 'three/src/materials/Material';
import {Mesh} from 'three/src/objects/Mesh';
import {Object3D} from 'three/src/core/Object3D';
export class BaseSopOperation extends BaseOperation {
	static context() {
		return NodeContext.SOP;
	}
	cook(input_contents: CoreGroup[], params: any): CoreGroup | Promise<CoreGroup> | void {}

	//
	//
	// UTILS
	//
	//
	protected create_core_group_from_objects(objects: Object3D[]) {
		const core_group = new CoreGroup();
		core_group.set_objects(objects);
		return core_group;
	}
	protected create_core_group_from_geometry(geometry: BufferGeometry, type: ObjectType = ObjectType.MESH) {
		const object = BaseSopOperation.create_object(geometry, type);
		return this.create_core_group_from_objects([object]);
	}
	protected create_object<OT extends ObjectType>(
		geometry: BufferGeometry,
		type: OT,
		material?: Material
	): ObjectByObjectType[OT] {
		return BaseSopOperation.create_object(geometry, type, material);
	}
	static create_object<OT extends ObjectType>(
		geometry: BufferGeometry,
		type: OT,
		material?: Material
	): ObjectByObjectType[OT] {
		// ensure it has an index
		this.create_index_if_none(geometry);

		const object_constructor = OBJECT_CONSTRUCTOR_BY_OBJECT_TYPE[type] as any; //THREE[type];
		material = material || CoreConstant.MATERIALS[type].clone();
		const object: Mesh = new object_constructor(geometry, material);
		object.castShadow = true;
		object.receiveShadow = true;
		object.frustumCulled = false;
		object.matrixAutoUpdate = false;

		return object as ObjectByObjectType[OT];
	}
	protected create_index_if_none(geometry: BufferGeometry) {
		BaseSopOperation.create_index_if_none(geometry);
	}
	static create_index_if_none(geometry: BufferGeometry) {
		CoreGeometryIndexBuilder.create_index_if_none(geometry);
	}
}

export type OperationInputsMap = WeakMap<SopOperationContainer, Map<number, number>>;

export class SopOperationContainer extends BaseOperationContainer {
	constructor(protected operation: BaseSopOperation, protected init_params: ParamsInitData) {
		super(operation, init_params);
	}

	// TODO: there may a better to overload add_input
	protected _inputs: SopOperationContainer[] = [];
	private _current_input_index: number = 0;
	add_input(input: SopOperationContainer) {
		super.set_input(this._current_input_index, input);
		this.increment_input_index();
	}
	increment_input_index() {
		this._current_input_index++;
	}
	current_input_index() {
		return this._current_input_index;
	}

	async compute(input_contents: CoreGroup[], operation_inputs_map: OperationInputsMap) {
		const operation_input_contents: CoreGroup[] = [];

		const node_inputs_map = operation_inputs_map.get(this);
		if (node_inputs_map) {
			node_inputs_map.forEach((node_input_index: number, operation_input_index: number) => {
				operation_input_contents[operation_input_index] = input_contents[node_input_index];
			});
		}

		for (let i = 0; i < this._inputs.length; i++) {
			const input_operation = this._inputs[i];
			const result = await input_operation.compute(input_contents, operation_inputs_map);
			if (result) {
				operation_input_contents[i] = result;
			}
		}

		return this.operation.cook(operation_input_contents, this.params);
	}
}

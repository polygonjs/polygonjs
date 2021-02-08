import {BaseSopOperation} from './_Base';
import {DefaultOperationParams} from '../_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {TypedNodePathParamValue} from '../../../core/Walker';
import {GlobalsGeometryHandler} from '../../../engine/nodes/gl/code/globals/Geometry';
import {BufferGeometry} from 'three/src/core/BufferGeometry';
import {ObjectTypeByObject} from '../../../core/geometry/Constant';
import {CoreMaterial} from '../../../core/geometry/Material';
import {NodeContext} from '../../../engine/poly/NodeContext';
import {CoreInstancer} from '../../../core/geometry/Instancer';
import {BaseBuilderMatNodeType} from '../../../engine/nodes/mat/_BaseBuilder';
import {Mesh} from 'three/src/objects/Mesh';
import {Material} from 'three/src/materials/Material';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';

interface InstanceSopParams extends DefaultOperationParams {
	attributesToCopy: string;
	applyMaterial: boolean;
	material: TypedNodePathParamValue;
}

export class InstanceSopOperation extends BaseSopOperation {
	static readonly DEFAULT_PARAMS: InstanceSopParams = {
		attributesToCopy: 'instance*',
		applyMaterial: true,
		material: new TypedNodePathParamValue(''),
	};
	static readonly INPUT_CLONED_STATE = [InputCloneMode.ALWAYS, InputCloneMode.NEVER];
	static type(): Readonly<'instance'> {
		return 'instance';
	}

	private _globals_handler: GlobalsGeometryHandler | undefined;
	private _geometry: BufferGeometry | undefined;

	async cook(input_contents: CoreGroup[], params: InstanceSopParams) {
		const core_group_to_instance = input_contents[0];
		this._geometry = undefined;

		const object_to_instance = core_group_to_instance.objectsWithGeo()[0];
		if (object_to_instance) {
			const geometry_to_instance = object_to_instance.geometry;
			if (geometry_to_instance) {
				const core_group = input_contents[1];
				this._create_instance(geometry_to_instance, core_group, params);
			}
		}

		if (this._geometry) {
			const type = ObjectTypeByObject(object_to_instance);
			if (type) {
				const object = this.create_object(this._geometry, type);

				if (params.applyMaterial) {
					const material = await this._get_material(params);
					if (material) {
						await this._applyMaterial(object as Mesh, material);
					}
				}

				return this.create_core_group_from_objects([object]);
			}
		}
		return this.create_core_group_from_objects([]);
	}

	private async _get_material(params: InstanceSopParams) {
		if (params.applyMaterial) {
			const material_node = params.material.ensure_node_context(NodeContext.MAT, this.states?.error);
			if (material_node) {
				this._globals_handler = this._globals_handler || new GlobalsGeometryHandler();
				const mat_builder_node = material_node as BaseBuilderMatNodeType;
				const matNodeAssemblerController = mat_builder_node.assemblerController;
				if (matNodeAssemblerController) {
					matNodeAssemblerController.set_assembler_globals_handler(this._globals_handler);
				}

				const container = await material_node.requestContainer();
				const material = container.material();
				return material;
			}
		}
	}

	async _applyMaterial(object: Mesh, material: Material) {
		object.material = material;
		CoreMaterial.apply_custom_materials(object, material);
	}

	private _create_instance(
		geometry_to_instance: BufferGeometry,
		template_core_group: CoreGroup,
		params: InstanceSopParams
	) {
		this._geometry = CoreInstancer.create_instance_buffer_geo(
			geometry_to_instance,
			template_core_group,
			params.attributesToCopy
		);
	}
}

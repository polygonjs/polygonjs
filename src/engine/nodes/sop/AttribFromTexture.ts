import {TypedSopNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {NodeContext} from '../../poly/NodeContext';
import {CoreGroup} from '../../../core/geometry/Group';
import {BaseCopNodeType} from '../cop/_Base';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {CoreObject} from '../../../core/geometry/Object';
import {Texture} from 'three/src/textures/Texture';
import {AttribFromTexture} from '../../../core/geometry/operation/AttribFromTexture';
import {OPERATOR_PATH_DEFAULT} from '../../params/OperatorPath';

class AttribFromTextureSopParamsConfig extends NodeParamsConfig {
	texture = ParamConfig.OPERATOR_PATH(OPERATOR_PATH_DEFAULT.NODE.UV, {
		node_selection: {context: NodeContext.COP},
	});
	uv_attrib = ParamConfig.STRING('uv');
	attrib = ParamConfig.STRING('pscale');
	add = ParamConfig.FLOAT(0);
	mult = ParamConfig.FLOAT(1);
}
const ParamsConfig = new AttribFromTextureSopParamsConfig();

export class AttribFromTextureSopNode extends TypedSopNode<AttribFromTextureSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'attrib_from_texture';
	}

	initialize_node() {
		this.io.inputs.set_count(1);
		this.io.inputs.init_inputs_cloned_state(InputCloneMode.FROM_NODE);

		this.scene.dispatch_controller.on_add_listener(() => {
			this.params.on_params_created('params_label', () => {
				this.params.label.init([this.p.attrib]);
			});
		});
	}

	async cook(input_contents: CoreGroup[]) {
		const core_group = input_contents[0];

		const node = this.p.texture.found_node();
		if (node) {
			const node_context = node.node_context();
			if (node_context == NodeContext.COP) {
				const texture_node = node as BaseCopNodeType;
				const container = await texture_node.request_container();
				const texture = container.texture();

				for (let core_object of core_group.core_objects()) {
					this._set_position_from_data_texture(core_object, texture);
				}
			} else {
				this.states.error.set('found node is not a texture');
			}
		}
		this.set_core_group(core_group);
	}

	private _set_position_from_data_texture(core_object: CoreObject, texture: Texture) {
		const geometry = core_object.core_geometry()?.geometry();
		if (!geometry) {
			return;
		}

		const uv_attrib = geometry.getAttribute('uv');

		if (uv_attrib == null) {
			this.states.error.set('uvs are required');
			return;
		}
		const operation = new AttribFromTexture();
		operation.set_attrib({
			geometry: geometry,
			texture: texture,
			uv_attrib_name: 'uv',
			target_attrib_name: this.pv.attrib,
			target_attrib_size: 1,
			add: this.pv.add,
			mult: this.pv.mult,
		});
	}
}

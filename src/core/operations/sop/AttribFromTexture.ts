import {BaseSopOperation} from './_Base';
import {DefaultOperationParams} from '../_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {TypedPathParamValue, NODE_PATH_DEFAULT} from '../../Walker';
import {NodeContext} from '../../../engine/poly/NodeContext';
import {AttribFromTexture} from '../../geometry/operation/AttribFromTexture';
import {CoreObject} from '../../geometry/Object';
import {Texture} from 'three/src/textures/Texture';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';

interface AttribFromTextureSopParams extends DefaultOperationParams {
	texture: TypedPathParamValue;
	uvAttrib: string;
	attrib: string;
	add: number;
	mult: number;
}

export class AttribFromTextureSopOperation extends BaseSopOperation {
	static readonly DEFAULT_PARAMS: AttribFromTextureSopParams = {
		texture: new TypedPathParamValue(NODE_PATH_DEFAULT.NODE.UV),
		uvAttrib: 'uv',
		attrib: 'pscale',
		add: 0,
		mult: 1,
	};
	static readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static type(): Readonly<'attribFromTexture'> {
		return 'attribFromTexture';
	}

	async cook(input_contents: CoreGroup[], params: AttribFromTextureSopParams) {
		const core_group = input_contents[0];

		const texture_node = params.texture.ensure_node_context(NodeContext.COP, this.states?.error);
		if (!texture_node) {
			return core_group;
		}
		const container = await texture_node.requestContainer();
		const texture = container.texture();
		for (let core_object of core_group.coreObjects()) {
			this._set_position_from_data_texture(core_object, texture, params);
		}

		return core_group;
	}
	private _set_position_from_data_texture(
		core_object: CoreObject,
		texture: Texture,
		params: AttribFromTextureSopParams
	) {
		const geometry = core_object.coreGeometry()?.geometry();
		if (!geometry) {
			return;
		}

		const uvAttrib = geometry.getAttribute('uv');

		if (uvAttrib == null) {
			this.states?.error.set('uvs are required');
			return;
		}
		const operation = new AttribFromTexture();
		operation.set_attrib({
			geometry: geometry,
			texture: texture,
			uvAttribName: 'uv',
			targetAttribName: params.attrib,
			targetAttribSize: 1,
			add: params.add,
			mult: params.mult,
		});
	}
}

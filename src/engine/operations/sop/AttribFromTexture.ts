import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {TypedNodePathParamValue, NODE_PATH_DEFAULT} from '../../../core/Walker';
import {NodeContext} from '../../../engine/poly/NodeContext';
import {AttribFromTexture} from '../../../core/geometry/operation/AttribFromTexture';
import {CoreObject} from '../../../core/geometry/modules/three/CoreObject';
import {Texture} from 'three';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {DefaultOperationParams} from '../../../core/operations/_Base';

interface AttribFromTextureSopParams extends DefaultOperationParams {
	texture: TypedNodePathParamValue;
	uvAttrib: string;
	attrib: string;
	attribSize: number;
	add: number;
	mult: number;
}

export class AttribFromTextureSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: AttribFromTextureSopParams = {
		texture: new TypedNodePathParamValue(NODE_PATH_DEFAULT.NODE.EMPTY),
		uvAttrib: 'uv',
		attrib: 'pscale',
		attribSize: 1,
		add: 0,
		mult: 1,
	};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static override type(): Readonly<'attribFromTexture'> {
		return 'attribFromTexture';
	}

	override async cook(inputCoreGroups: CoreGroup[], params: AttribFromTextureSopParams) {
		const coreGroup = inputCoreGroups[0];

		const textureNode = params.texture.nodeWithContext(NodeContext.COP, this.states?.error);
		if (!textureNode) {
			return coreGroup;
		}
		const container = await textureNode.compute();
		const texture = container.texture();
		for (let core_object of coreGroup.threejsCoreObjects()) {
			this._set_position_from_data_texture(core_object, texture, params);
		}

		return coreGroup;
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

		const uvAttrib = geometry.getAttribute(params.uvAttrib);

		if (uvAttrib == null) {
			this.states?.error.set(`param '${params.uvAttrib} not found'`);
			return;
		}
		const operation = new AttribFromTexture();
		operation.set_attrib({
			geometry: geometry,
			texture: texture,
			uvAttribName: params.uvAttrib,
			targetAttribName: params.attrib,
			targetAttribSize: params.attribSize,
			add: params.add,
			mult: params.mult,
		});
	}
}

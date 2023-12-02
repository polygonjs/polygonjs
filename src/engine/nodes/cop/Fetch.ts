/**
 * Imports a texture from a geometry node
 *
 *
 */
import {TypedCopNode} from './_Base';
import {Material, Mesh, Texture} from 'three';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {NodeContext} from '../../poly/NodeContext';
import {CoreMask} from '../../../core/geometry/Mask';
import {CoreType} from '../../../core/Type';

class FetchCopParamsConfig extends NodeParamsConfig {
	/** @param sop node */
	node = ParamConfig.NODE_PATH('', {
		nodeSelection: {
			context: NodeContext.SOP,
		},
	});
	/** @param group to read the material from */
	group = ParamConfig.STRING('', {
		objectMask: true,
	});
	/** @param texture name */
	name = ParamConfig.STRING('');
}
const ParamsConfig = new FetchCopParamsConfig();

export class FetchCopNode extends TypedCopNode<FetchCopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type(): 'fetch' {
		return 'fetch';
	}

	override async cook() {
		const geometryNode = this.pv.node.nodeWithContext(NodeContext.SOP, this.states.error);
		if (!geometryNode) {
			this.states.error.set(`node not found at path '${this.pv.node.path()}'`);
			return;
		}
		const container = await geometryNode.compute();
		const coreGroup = container.coreContent();
		if (!coreGroup) {
			this.states.error.set(`geometry invalid`);
			return;
		}
		const selectedObjects = CoreMask.filterThreejsObjects(coreGroup, this.pv);
		if (selectedObjects.length == 0) {
			this.states.error.set(`no object matching group`);
			return;
		}
		let texture: Texture | undefined;
		for (const selectedObject of selectedObjects) {
			const material = (selectedObject as Mesh).material;
			if (material) {
				if (CoreType.isArray(material)) {
					for (const mat of material) {
						texture = texture || this._textureFromMaterial(mat);
					}
				} else {
					texture = texture || this._textureFromMaterial(material);
				}
			}
		}
		if (!texture) {
			this.states.error.set(`no texture found`);
			return;
		}
		this.setTexture(texture);
	}
	private _textureFromMaterial(material: Material):Texture|undefined {
		const textureName = this.pv.name;
		const texture = material[textureName as keyof Material];
		if (texture && (texture as Texture).isTexture) {
			return texture as Texture;
		}
	}
}

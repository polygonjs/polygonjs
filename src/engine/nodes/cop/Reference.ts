/**
 * References a texture from another node
 *
 *
 */
import {TypedCopNode} from './_Base';
import {Material, Mesh, Texture} from 'three';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {NodeContext} from '../../poly/NodeContext';
import {CoreMask} from '../../../core/geometry/Mask';
import {CoreType} from '../../../core/Type';

class ReferenceCopParamsConfig extends NodeParamsConfig {
	/** @param sop node */
	node = ParamConfig.NODE_PATH('', {
		nodeSelection: {
			context: NodeContext.SOP,
		},
	});
	/** @param group to assign the material to */
	group = ParamConfig.STRING('', {
		objectMask: true,
	});
	/** @param texture name */
	name = ParamConfig.STRING('');
}
const ParamsConfig = new ReferenceCopParamsConfig();

export class ReferenceCopNode extends TypedCopNode<ReferenceCopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'reference';
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
		const selectedObjects = CoreMask.filterObjects(coreGroup, this.pv);
		if (selectedObjects.length == 0) {
			this.states.error.set(`no object matching group`);
			return;
		}
		let texture: Texture | undefined;
		for (const selectedObject of selectedObjects) {
			const material = (selectedObject as Mesh).material;
			if (material) {
				if (CoreType.isArray(material)) {
					for (let mat of material) {
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
	private _textureFromMaterial(material: Material) {
		const textureName = this.pv.name;
		const texture = material[textureName as keyof Material];
		if (texture && (texture as Texture).isTexture) {
			return texture;
		}
	}
}

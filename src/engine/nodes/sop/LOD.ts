/**
 * Creates LOD (Level Of Definition)
 *
 * @remarks
 * This nodes takes 1, 2 or 3 inputs. Depending on the distance to this object the camera is, one of those inputs will be displayed. This allows you to have low resolution objects displayed when the camera is far, and high resolution when the camera is close.
 */
import {TypedSopNode} from './_Base';
import {LOD} from 'three/src/objects/LOD';
import {Object3D} from 'three/src/core/Object3D';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {BaseNodeType} from '../_Base';
import {CameraNodeType, NodeContext} from '../../poly/NodeContext';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CoreTransform} from '../../../core/Transform';
class LODSopParamsConfig extends NodeParamsConfig {
	/** @param distance when switching between high res and mid res (first input and second input) */
	distance0 = ParamConfig.FLOAT(1);
	/** @param distance when switching between mid res and low res (second input and third input) */
	distance1 = ParamConfig.FLOAT(2);
	/** @param sets if the switch is done automatically */
	auto_update = ParamConfig.BOOLEAN(1);
	/** @param updates which object is displayed manually */
	update = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			LODSopNode.PARAM_CALLBACK_update(node as LODSopNode);
		},
	});
	/** @param sets which camera will be used when the switch is to be done manually */
	camera = ParamConfig.OPERATOR_PATH('/perspective_camera1', {
		visibleIf: {auto_update: 0},
		dependentOnFoundNode: false,
	});
}
const ParamsConfig = new LODSopParamsConfig();

export class LODSopNode extends TypedSopNode<LODSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'lod';
	}

	static displayed_input_names(): string[] {
		return ['high res', 'mid res', 'low res'];
	}
	private _lod = this._create_LOD();

	initialize_node() {
		this.io.inputs.set_count(1, 3);
		this.io.inputs.init_inputs_cloned_state(InputCloneMode.FROM_NODE);
	}

	private _create_LOD() {
		const lod = new LOD();
		lod.matrixAutoUpdate = false;
		return lod;
	}

	cook(input_contents: CoreGroup[]) {
		this._clear_lod();

		this._add_level(input_contents[0], 0);
		this._add_level(input_contents[1], this.pv.distance0);
		this._add_level(input_contents[2], this.pv.distance1);

		this._lod.autoUpdate = this.pv.auto_update;

		this.setObject(this._lod);
	}

	_add_level(core_group: CoreGroup | undefined, level: number) {
		if (core_group) {
			const objects = core_group.objects();
			let object: Object3D;
			for (let i = 0; i < objects.length; i++) {
				object = objects[i];
				// force objects to visible = true
				// otherwise objects previously given to the LOD would appear hidden in a recook
				object.visible = true;
				this._lod.addLevel(object, level);
				if (level == 0) {
					if (i == 0) {
						// copy transform of first object to LOD
						this._lod.matrix.copy(object.matrix);
						CoreTransform.decompose_matrix(this._lod);
					}
				}
				// reset the objects transforms so that the LOD carries that transform
				object.matrix.identity();
				CoreTransform.decompose_matrix(object);
			}
		}
	}

	private _clear_lod() {
		let child: Object3D;
		while ((child = this._lod.children[0])) {
			this._lod.remove(child);
			// ensures the removed children are at the right location
			child.matrix.multiply(this._lod.matrix);
			CoreTransform.decompose_matrix(child);
		}
		while (this._lod.levels.pop()) {}
	}

	static PARAM_CALLBACK_update(node: LODSopNode) {
		node._update_lod();
	}
	private async _update_lod() {
		if (this.p.auto_update) {
			return;
		}

		const camera_param = this.p.camera;
		if (camera_param.is_dirty) {
			await camera_param.compute();
		}
		let camera_node =
			camera_param.found_node_with_context_and_type(NodeContext.OBJ, CameraNodeType.PERSPECTIVE) ||
			camera_param.found_node_with_context_and_type(NodeContext.OBJ, CameraNodeType.ORTHOGRAPHIC);
		if (camera_node) {
			const object = camera_node.object;
			this._lod.update(object);
		} else {
			this.states.error.set('no camera node found');
		}
	}
}

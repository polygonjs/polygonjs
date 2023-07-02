/**
 * Creates LOD (Level Of Definition)
 *
 * @remarks
 * This nodes takes 1, 2 or 3 inputs. Depending on the distance to this object the camera is, one of those inputs will be displayed. This allows you to have low resolution objects displayed when the camera is far, and high resolution when the camera is close.
 */
import {TypedSopNode} from './_Base';
import {LOD} from 'three';
import {Object3D} from 'three';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {BaseNodeType} from '../_Base';
import {CAMERA_TYPES, NodeContext} from '../../poly/NodeContext';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CoreTransform} from '../../../core/Transform';
import {isBooleanTrue} from '../../../core/BooleanValue';
import {Camera} from 'three';
import {ObjectType, registerObjectType} from '../../../core/geometry/Constant';
import {SopType} from '../../poly/registers/nodes/types/Sop';
class LODSopParamsConfig extends NodeParamsConfig {
	/** @param distance when switching between high res and mid res (first input and second input) */
	distance0 = ParamConfig.FLOAT(10, {
		range: [0, 100],
		rangeLocked: [true, false],
	});
	/** @param distance when switching between mid res and low res (second input and third input) */
	distance1 = ParamConfig.FLOAT(20, {
		range: [0, 100],
		rangeLocked: [true, false],
	});
	/** @param Threshold used to avoid flickering at LOD boundaries, as a fraction of distance */
	hysteresis = ParamConfig.FLOAT(0, {
		range: [0, 1],
		rangeLocked: [true, true],
	});
	/** @param sets if the switch is done automatically */
	autoUpdate = ParamConfig.BOOLEAN(1);
	/** @param updates which object is displayed manually */
	update = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			LodSopNode.PARAM_CALLBACK_update(node as LodSopNode);
		},
	});
	/** @param sets which camera will be used when the switch is to be done manually */
	camera = ParamConfig.NODE_PATH('', {
		nodeSelection: {
			context: NodeContext.OBJ,
			types: CAMERA_TYPES,
		},
		visibleIf: {autoUpdate: 0},
		dependentOnFoundNode: false,
	});
}
const ParamsConfig = new LODSopParamsConfig();

export class LodSopNode extends TypedSopNode<LODSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.LOD;
	}

	private _lod = this._createLOD();

	override initializeNode() {
		this.io.inputs.setCount(1, 3);
		this.io.inputs.initInputsClonedState(InputCloneMode.FROM_NODE);
	}

	private _createLOD() {
		registerObjectType({type: ObjectType.LOD, ctor: LOD, humanName: 'LOD'});
		const lod = new LOD();
		lod.matrixAutoUpdate = false;
		return lod;
	}

	override cook(inputCoreGroups: CoreGroup[]) {
		this._clearLOD();

		this._addLevel(inputCoreGroups[0], 0);
		this._addLevel(inputCoreGroups[1], this.pv.distance0);
		this._addLevel(inputCoreGroups[2], this.pv.distance1);

		this._lod.autoUpdate = isBooleanTrue(this.pv.autoUpdate);

		this.setObject(this._lod);
	}

	_addLevel(coreGroup: CoreGroup | undefined, level: number) {
		if (coreGroup) {
			const objects = coreGroup.threejsObjects();
			let object: Object3D;
			for (let i = 0; i < objects.length; i++) {
				object = objects[i];
				// force objects to visible = true
				// otherwise objects previously given to the LOD would appear hidden in a recook
				object.visible = true;
				this._lod.addLevel(object, level, this.pv.hysteresis);
				if (level == 0) {
					if (i == 0) {
						// copy transform of first object to LOD
						this._lod.matrix.copy(object.matrix);
						CoreTransform.decomposeMatrix(this._lod);
					}
				}
				// reset the objects transforms so that the LOD carries that transform
				object.matrix.identity();
				CoreTransform.decomposeMatrix(object);
			}
		}
	}

	private _clearLOD() {
		let child: Object3D;
		while ((child = this._lod.children[0])) {
			this._lod.remove(child);
			// ensures the removed children are at the right location
			child.matrix.multiply(this._lod.matrix);
			CoreTransform.decomposeMatrix(child);
		}
		while (this._lod.levels.pop()) {}
	}

	static PARAM_CALLBACK_update(node: LodSopNode) {
		node._updateLOD();
	}
	private async _updateLOD() {
		if (isBooleanTrue(this.pv.autoUpdate)) {
			return;
		}

		const cameraNode = this.pv.camera.nodeWithContext(NodeContext.OBJ, this.states.error);
		// camera_param.found_node_with_context_and_type(NodeContext.OBJ, CameraNodeType.PERSPECTIVE) ||
		// camera_param.found_node_with_context_and_type(NodeContext.OBJ, CameraNodeType.ORTHOGRAPHIC);
		if (!cameraNode) {
			this.states.error.set('no camera node found');
			return;
		}
		if (!(CAMERA_TYPES as string[]).includes(cameraNode.type())) {
			this.states.error.set('node is not a camera node');
			return;
		}
		const object = cameraNode.object as Camera;
		this._lod.update(object);
	}
}

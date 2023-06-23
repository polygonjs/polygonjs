/**
 * Update a scene before some passes are rendered
 *
 * @remarks
 * The node can also be provided a second input, which has to be an UpdateScene post node.
 * This node will then be able to reset the changes made by this node.
 *
 */
import {TypedPostNode, TypedPostNodeContext, PostParamOptions} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {isBooleanTrue} from '../../../core/Type';
import {BaseNodeType} from '../_Base';
import {Mesh, Material, MeshBasicMaterial, Color} from 'three';
import {UpdateScenePass} from './utils/effects/UpdateScenePass';
import {CoreObjectType, ObjectContent} from '../../../core/geometry/ObjectContent';

const MATTE_MATERIAL = new MeshBasicMaterial({color: new Color(0, 0, 0)});

// function _effectFromPass(effectPass: EffectPass): UpdateScenePass | undefined {
// 	const effect = (effectPass as any).effects[0];
// 	if (effect instanceof UpdateScenePass) {
// 		return effect;
// 	}
// }

class UpdateScenePostParamsConfig extends NodeParamsConfig {
	/** @param reset */
	reset = ParamConfig.BOOLEAN(0, {
		...PostParamOptions,
	});
	/** @param objects Mask */
	objectsMask = ParamConfig.STRING('*', {
		...PostParamOptions,
		visibleIf: {reset: 0},
		objectMask: true,
	});
	/** @param invertMask */
	invertMask = ParamConfig.BOOLEAN(0, {
		...PostParamOptions,
		visibleIf: {reset: 0},
	});
	/** @param prints which objects are targeted by this node, for debugging */
	// printFoundObjectsFromMask = ParamConfig.BUTTON(null, {
	// 	visibleIf: {reset: 0},
	// 	callback: (node: BaseNodeType) => {
	// 		UpdateScenePostNode.PARAM_CALLBACK_printResolve(node as UpdateScenePostNode);
	// 	},
	// });
	/** @param update selected objects material to a matte one */
	setMatteMaterial = ParamConfig.BOOLEAN(1, {
		...PostParamOptions,
		visibleIf: {reset: 0},
		separatorBefore: true,
	});
	/** @param set visible state  */
	setVisible = ParamConfig.BOOLEAN(0, {
		...PostParamOptions,
		visibleIf: {reset: 0},
		separatorBefore: true,
	});
	/** @param set visible state  */
	visible = ParamConfig.BOOLEAN(0, {
		...PostParamOptions,
		visibleIf: {reset: 0, setVisible: 1},
	});
	/** @param reset */
	resetChanges = ParamConfig.BUTTON(null, {
		visibleIf: {reset: 0},
		callback: (node: BaseNodeType) => {
			UpdateScenePostNode.PARAM_CALLBACK_resetChanges(node as UpdateScenePostNode);
		},
		separatorBefore: true,
	});
	/** @param material */
	// material = ParamConfig.NODE_PATH('', {
	// 	...PostParamOptions,
	// 	visibleIf: {overrideMaterial: 1},
	// 	nodeSelection: {
	// 		context: NodeContext.MAT,
	// 	},
	// 	callback: (node: BaseNodeType) => {
	// 		UpdateScenePostNode.PARAM_CALLBACK_updatePassesMaterial(node as UpdateScenePostNode);
	// 	},
	// });
}
const ParamsConfig = new UpdateScenePostParamsConfig();
export class UpdateScenePostNode extends TypedPostNode<UpdateScenePass, UpdateScenePostParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'updateScene';
	}
	override initializeNode() {
		super.initializeNode();
		this.io.inputs.setCount(0, 2);
	}
	static override displayedInputNames(): string[] {
		return ['previous pass', 'updateScene node to reset changes of'];
	}

	override createPass(context: TypedPostNodeContext) {
		const pass = new UpdateScenePass({
			// scene: this.scene(),
			node: this,
			reset: isBooleanTrue(this.pv.reset),
			nodeToReset: this._nodeToReset(context),
			// objectsMask: this.pv.objectsMask,
			// invertMask: isBooleanTrue(this.pv.invertMask),
			// setMatteMaterial: isBooleanTrue(this.pv.setMatteMaterial),
			// setVisible: isBooleanTrue(this.pv.setVisible),
			// visible: isBooleanTrue(this.pv.visible),
		});
		// const pass = new EffectPass(context.camera, effect);
		this.updatePass(pass);

		return pass;
	}
	override updatePass(pass: UpdateScenePass) {
		// const effect = _effectFromPass(pass);
		// if (!effect) {
		// 	return;
		// }
		// pass.reset = isBooleanTrue(this.pv.reset);
		// effect.objectsMask = this.pv.objectsMask;
		// effect.invertMask = isBooleanTrue(this.pv.invertMask);
		// effect.setMatteMaterial = isBooleanTrue(this.pv.setMatteMaterial);
		// effect.setVisible = isBooleanTrue(this.pv.setVisible);
		// effect.visible = isBooleanTrue(this.pv.visible);
	}
	private _nodeToReset(context: TypedPostNodeContext): UpdateScenePostNode | undefined {
		const input2 = this.io.inputs.input(1);
		if (!input2) {
			return;
		}
		if (input2 instanceof UpdateScenePostNode) {
			return input2;
			// const pass = context.composerController.passByNodeInBuildPassesProcess(input2) as EffectPass | undefined; //input2.passesByRequester(requester);
			// console.log(pass, pass ? _effectFromPass(pass) : undefined);
			// return pass ? _effectFromPass(pass) : undefined;
		}
	}

	// static PARAM_CALLBACK_printResolve(node: UpdateScenePostNode) {
	// 	node._printResolve();
	// }
	// private _printResolve() {
	// 	let firstPass: EffectPass | undefined;
	// 	this._passesByEffectsComposer.forEach((passOrPasses) => {
	// 		const passes = CoreType.isArray(passOrPasses) ? passOrPasses : [passOrPasses];
	// 		firstPass = firstPass || passes[0];
	// 	});
	// 	if (firstPass) {
	// 		const effect = _effectFromPass(firstPass);
	// 		if (effect) {
	// 			console.log(hhis.objectsList());
	// 		}
	// 	} else {
	// 		console.error(`no pass generated by this node, maybe it has not rendered yet?`);
	// 	}
	// }
	static PARAM_CALLBACK_resetChanges(node: UpdateScenePostNode) {
		node.resetChanges();
	}
	// private _resetMat() {
	// 	this._passesByEffectsComposer.forEach((passOrPasses) => {
	// 		const passes = CoreType.isArray(passOrPasses) ? passOrPasses : [passOrPasses];
	// 		for (let pass of passes) {
	// 			const effect = _effectFromPass(pass);
	// 			if (effect) {
	// 				effect.resetChanges();
	// 			}
	// 		}
	// 	});
	// }

	// static PARAM_CALLBACK_updatePassesMaterial(node: UpdateScenePostNode) {
	// 	node._updatePassesMaterial();
	// }
	// private _updatePassesMaterial() {
	// 	const matNode = this.pv.material.nodeWithContext(NodeContext.MAT);
	// 	if (!matNode) {
	// 		this._passes_by_requester_id.forEach((pass) => {
	// 			pass.material = undefined;
	// 		});
	// 	} else {
	// 		const mat = matNode.material;
	// 		this._passes_by_requester_id.forEach((pass) => {
	// 			pass.material = mat;
	// 		});
	// 	}
	// }
	private _objectsList: ObjectContent<CoreObjectType>[] = [];
	objectsList() {
		return this._objectsList;
	}
	private _materialByMesh: Map<Mesh, Material | Material[]> = new Map();
	// private _parentByObject: Map<Object3D, Object3D | null> = new Map();
	private _visibleByObject: Map<ObjectContent<CoreObjectType>, boolean> = new Map();
	applyChanges() {
		const changeNeeded = isBooleanTrue(this.pv.setMatteMaterial) || isBooleanTrue(this.pv.setVisible);
		if (changeNeeded) {
			this._objectsList.length = 0;
			const mask = this.pv.objectsMask;
			this._scene.objectsController.traverseObjectsWithMask(
				mask,
				this._updateObjectBound,
				undefined,
				this.pv.invertMask
			);
		}
	}
	resetChanges() {
		// reset mat
		this._materialByMesh.forEach((mat, mesh) => {
			mesh.material = mat;
		});
		this._materialByMesh.clear();
		// reset visibility
		// this._parentByObject.forEach((parent, obj) => {
		// 	parent?.add(obj);
		// });
		// this._parentByObject.clear();
		this._visibleByObject.forEach((visible, obj) => {
			obj.visible = visible;
		});
		this._visibleByObject.clear();
	}
	private _updateObjectBound = this._updateObject.bind(this);
	private _updateObject(obj: ObjectContent<CoreObjectType>) {
		this._objectsList.push(obj);
		if (isBooleanTrue(this.pv.setMatteMaterial)) {
			const mesh = obj as Mesh;
			if (mesh.material) {
				this._materialByMesh.set(mesh, mesh.material);
				mesh.material = MATTE_MATERIAL;
			}
		}
		if (isBooleanTrue(this.pv.setVisible)) {
			const visible = this.pv.visible;
			// const parent = obj.parent;
			// const hasParent = parent != null;
			if (obj.visible != visible) {
				// this._parentByObject.set(obj, parent);
				// obj.removeFromParent();
				// obj.parent = null;
				// console.log('remove parent', obj);
				this._visibleByObject.set(obj, obj.visible);
				obj.visible = visible;
				// console.log(obj, obj.visible);
			}
		}
	}
}

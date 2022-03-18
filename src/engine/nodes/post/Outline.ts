import {Vector2} from 'three/src/math/Vector2';
import {TypedPostProcessNode, TypedPostNodeContext, PostParamOptions} from './_Base';
import {OutlinePass} from '../../../modules/three/examples/jsm/postprocessing/OutlinePass';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {BaseNodeType} from '../_Base';
import {Object3D} from 'three/src/core/Object3D';
class OutlinePostParamsConfig extends NodeParamsConfig {
	/** @param object mask of the objects that will have an outline */
	objectsMask = ParamConfig.STRING('*outlined*', {
		...PostParamOptions,
		objectMask: true,
	});
	/** @param updates the cached objects found by objectMask  */
	refreshObjects = ParamConfig.BUTTON(null, {
		...PostParamOptions,
	});
	/** @param debug print the objects to the dev console */
	printObjects = ParamConfig.BUTTON(null, {
		cook: false,
		callback: (node: BaseNodeType) => {
			OutlinePostNode.PARAM_CALLBACK_printResolve(node as OutlinePostNode);
		},
	});
	/** @param edgeStrenth */
	edgeStrength = ParamConfig.FLOAT(3, {
		range: [0, 10],
		rangeLocked: [true, false],
		...PostParamOptions,
	});
	/** @param edgeThickness */
	edgeThickness = ParamConfig.FLOAT(1.0, {
		range: [0, 4],
		rangeLocked: [true, false],
		...PostParamOptions,
	});
	/** @param adds a blur to the edges */
	edgeGlow = ParamConfig.FLOAT(0, {
		range: [0, 1],
		rangeLocked: [true, false],
		...PostParamOptions,
	});
	/** @param defines if the edges pulsate */
	pulsePeriod = ParamConfig.FLOAT(0, {
		range: [0, 5],
		rangeLocked: [true, false],
		...PostParamOptions,
	});
	/** @param visibleEdgeColor */
	visibleEdgeColor = ParamConfig.COLOR([1, 1, 1], {
		...PostParamOptions,
	});
	/** @param hiddenEdgeColor */
	hiddenEdgeColor = ParamConfig.COLOR([0.2, 0.1, 0.4], {
		...PostParamOptions,
	});
}
const ParamsConfig = new OutlinePostParamsConfig();
export class OutlinePostNode extends TypedPostProcessNode<OutlinePass, OutlinePostParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'outline';
	}

	private _resolvedObjects: Object3D[] = [];

	protected override _createPass(context: TypedPostNodeContext) {
		const pass = new OutlinePass(
			new Vector2(context.resolution.x, context.resolution.y),
			context.scene,
			context.camera,
			context.scene.children
		);
		this.updatePass(pass);
		return pass;
	}
	override updatePass(pass: OutlinePass) {
		pass.edgeStrength = this.pv.edgeStrength;
		pass.edgeThickness = this.pv.edgeThickness;
		pass.edgeGlow = this.pv.edgeGlow;
		pass.pulsePeriod = this.pv.pulsePeriod;
		pass.visibleEdgeColor = this.pv.visibleEdgeColor;
		pass.hiddenEdgeColor = this.pv.hiddenEdgeColor;

		this._setSelectedObjects(pass);
	}
	private _map: Map<string, Object> = new Map();
	private _setSelectedObjects(pass: OutlinePass) {
		const foundObjects = this.scene().objectsByMask(this.pv.objectsMask);

		// Ensure that we only give the top most parents to the pass.
		// Meaning that if foundObjects contains a node A and one of its children B,
		// only A is given.
		this._map.clear();
		for (let object of foundObjects) {
			this._map.set(object.uuid, object);
		}
		const isAncestorNotInList = (object: Object3D) => {
			let isAncestorInList = false;
			object.traverseAncestors((ancestor) => {
				if (this._map.has(ancestor.uuid)) {
					isAncestorInList = true;
				}
			});
			return !isAncestorInList;
		};
		this._resolvedObjects = foundObjects.filter(isAncestorNotInList);
		pass.selectedObjects = this._resolvedObjects;
	}
	static PARAM_CALLBACK_printResolve(node: OutlinePostNode) {
		node.printResolve();
	}
	private printResolve() {
		console.log(this._resolvedObjects);
	}
}

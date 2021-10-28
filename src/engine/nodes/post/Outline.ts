import {Vector2} from 'three/src/math/Vector2';
import {TypedPostProcessNode, TypedPostNodeContext, PostParamOptions} from './_Base';
import {OutlinePass} from '../../../modules/three/examples/jsm/postprocessing/OutlinePass';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {BaseNodeType} from '../_Base';
import {Object3D} from 'three/src/core/Object3D';
class OutlinePostParamsConfig extends NodeParamsConfig {
	objectsMask = ParamConfig.STRING('*outlined*', {
		...PostParamOptions,
	});
	refreshObjects = ParamConfig.BUTTON(null, {
		...PostParamOptions,
	});
	printObjects = ParamConfig.BUTTON(null, {
		cook: false,
		callback: (node: BaseNodeType) => {
			OutlinePostNode.PARAM_CALLBACK_printResolve(node as OutlinePostNode);
		},
	});
	edgeStrength = ParamConfig.FLOAT(3, {
		range: [0, 10],
		rangeLocked: [true, false],
		...PostParamOptions,
	});
	edgeThickness = ParamConfig.FLOAT(0, {
		range: [0, 4],
		rangeLocked: [true, false],
		...PostParamOptions,
	});
	edgeGlow = ParamConfig.FLOAT(0, {
		range: [0, 1],
		rangeLocked: [true, false],
		...PostParamOptions,
	});
	pulsePeriod = ParamConfig.FLOAT(0, {
		range: [0, 5],
		rangeLocked: [true, false],
		...PostParamOptions,
	});
	visibleEdgeColor = ParamConfig.COLOR([1, 1, 1], {
		...PostParamOptions,
	});
	hiddenEdgeColor = ParamConfig.COLOR([0.2, 0.1, 0.4], {
		...PostParamOptions,
	});
}
const ParamsConfig = new OutlinePostParamsConfig();
export class OutlinePostNode extends TypedPostProcessNode<OutlinePass, OutlinePostParamsConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return 'outline';
	}

	private _resolvedObjects: Object3D[] = [];

	protected _createPass(context: TypedPostNodeContext) {
		const pass = new OutlinePass(
			new Vector2(context.resolution.x, context.resolution.y),
			context.scene,
			context.camera,
			context.scene.children
		);
		this.updatePass(pass);
		return pass;
	}
	updatePass(pass: OutlinePass) {
		pass.edgeStrength = this.pv.edgeStrength;
		pass.edgeThickness = this.pv.edgeThickness;
		pass.edgeGlow = this.pv.edgeGlow;
		pass.pulsePeriod = this.pv.pulsePeriod;
		pass.visibleEdgeColor = this.pv.visibleEdgeColor;
		pass.hiddenEdgeColor = this.pv.hiddenEdgeColor;

		this._setSelectedObjects(pass);
	}
	private _setSelectedObjects(pass: OutlinePass) {
		this._resolvedObjects = this.scene().objectsByMask(this.pv.objectsMask);
		pass.selectedObjects = this._resolvedObjects;
	}
	static PARAM_CALLBACK_printResolve(node: OutlinePostNode) {
		node.printResolve();
	}
	private printResolve() {
		console.log(this._resolvedObjects);
	}
}

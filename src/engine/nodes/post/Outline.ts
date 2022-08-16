/**
 * Creates an outline
 *
 *
 */
import {BLEND_FUNCTIONS, BLEND_FUNCTION_MENU_OPTIONS} from './../../../core/post/BlendFunction';
import {TypedPostProcessNode, TypedPostNodeContext, PostParamOptions} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {BlendFunction, EffectPass, KernelSize, OutlineEffect} from 'postprocessing';
import {Object3D} from 'three';
import {KERNEL_SIZE_MENU_OPTIONS} from '../../../core/post/KernelSize';
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
	/** @param edgeStrenth */
	edgeStrength = ParamConfig.FLOAT(3, {
		range: [0, 10],
		rangeLocked: [true, false],
		...PostParamOptions,
	});
	/** @param blur */
	blur = ParamConfig.BOOLEAN(0, {
		...PostParamOptions,
	});
	kernelSize = ParamConfig.INTEGER(KernelSize.VERY_SMALL, {
		...PostParamOptions,
		...KERNEL_SIZE_MENU_OPTIONS,
		visibleIf: {blur: 1},
	});

	/** @param defines if the edges pulsate */
	pulseSpeed = ParamConfig.FLOAT(0, {
		range: [0, 5],
		rangeLocked: [true, false],
		...PostParamOptions,
	});
	/** @param visibleEdgeColor */
	visibleEdgeColor = ParamConfig.COLOR([1, 1, 1], {
		...PostParamOptions,
	});
	/** @param shows outline for hidden parts of objects */
	xRay = ParamConfig.BOOLEAN(1, {
		...PostParamOptions,
	});
	/** @param hiddenEdgeColor */
	hiddenEdgeColor = ParamConfig.COLOR([0.2, 0.1, 0.4], {
		...PostParamOptions,
		visibleIf: {xRay: 1},
	});
	/** @param opacity */
	opacity = ParamConfig.FLOAT(1, {
		range: [0, 1],
		rangeLocked: [true, false],
		...PostParamOptions,
	});
	/** @param render mode */
	blendFunction = ParamConfig.INTEGER(BLEND_FUNCTIONS.indexOf(BlendFunction.SCREEN), {
		...PostParamOptions,
		...BLEND_FUNCTION_MENU_OPTIONS,
	});
}
const ParamsConfig = new OutlinePostParamsConfig();
export class OutlinePostNode extends TypedPostProcessNode<EffectPass, OutlinePostParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'outline';
	}

	private _resolvedObjects: Object3D[] = [];
	// private _rendererSize = new Vector2();
	override createPass(context: TypedPostNodeContext) {
		const effect = new OutlineEffect(context.scene, context.camera, {
			blendFunction: BlendFunction.SCREEN,
			patternScale: 40,
			visibleEdgeColor: 0xffffff,
			hiddenEdgeColor: 0x22090a,
			height: 480,
			blur: false,
			xRay: true,
		});
		effect.selection.add(context.scene.children[0]);
		// context.renderer.getSize(this._rendererSize);
		const pass = new EffectPass(context.camera, effect);
		this.updatePass(pass);
		return pass;
	}
	override updatePass(pass: EffectPass) {
		const effect = (pass as any).effects[0] as OutlineEffect;
		effect.blendMode.opacity.value = this.pv.opacity;
		effect.blendMode.blendFunction = BLEND_FUNCTIONS[this.pv.blendFunction];

		effect.edgeStrength = this.pv.edgeStrength;
		effect.blur = this.pv.blur;
		effect.kernelSize = this.pv.kernelSize;
		effect.xRay = this.pv.xRay;
		effect.pulseSpeed = this.pv.pulseSpeed;
		effect.visibleEdgeColor = this.pv.visibleEdgeColor;
		effect.hiddenEdgeColor = this.pv.hiddenEdgeColor;
		this._setSelectedObjects(effect);
	}
	private _map: Map<string, Object3D> = new Map();
	private _setSelectedObjects(effect: OutlineEffect) {
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
		effect.selection.clear();
		for (let object of this._resolvedObjects) {
			effect.selection.add(object);
		}
	}
}

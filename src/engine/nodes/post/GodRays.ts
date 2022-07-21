/**
 * Adds god rays from a source object.
 *
 *
 */
import {CoreType} from './../../../core/Type';
import {PolyScene} from './../../scene/PolyScene';
import {Points} from 'three/src/objects/Points';
import {BLEND_FUNCTION_MENU_OPTIONS} from './../../../core/post/BlendFunction';
import {Vector2, Mesh, BufferGeometry, MeshBasicMaterial, Object3D, Material, Group} from 'three';
import {TypedPostProcessNode, TypedPostNodeContext, PostParamOptions} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {BlendFunction, GodRaysEffect, EffectPass, KernelSize} from 'postprocessing';
import {KERNEL_SIZES, KERNEL_SIZE_MENU_OPTIONS} from '../../../core/post/KernelSize';
import {BLEND_FUNCTIONS} from './../../../core/post/BlendFunction';

const tmpParent = new Group();
const tmpLightSource = new Mesh(new BufferGeometry(), new MeshBasicMaterial());
tmpParent.add(tmpLightSource);

function _updateLightSourceMaterial(material: Material) {
	material.depthWrite = false;
	material.transparent = true;
}
function _findLightSource(scene: PolyScene, objectMask: string) {
	let foundObject: Mesh | Points | undefined = undefined;
	const objects: Object3D[] = scene.objectsByMask(objectMask);
	for (let object of objects) {
		if ((object as Mesh).isMesh || (object as Points).isPoints) {
			foundObject = object as Mesh;
			break;
		}
	}
	return foundObject;
}

class GodRaysPostParamsConfig extends NodeParamsConfig {
	/** @param objects to emit godrays from. Note that while the mask can resolve multiple objects, only the first mesh or points will be used */
	objectMask = ParamConfig.STRING('*geo1*', {
		objectMask: true,
	});
	/** @param samples */
	samples = ParamConfig.INTEGER(60, {
		range: [1, 128],
		rangeLocked: [true, false],
		...PostParamOptions,
	});
	/** @param density */
	density = ParamConfig.FLOAT(0.96, {
		range: [0, 1],
		rangeLocked: [true, true],
		...PostParamOptions,
	});
	/** @param decay */
	decay = ParamConfig.FLOAT(0.9, {
		range: [0, 1],
		rangeLocked: [true, true],
		...PostParamOptions,
	});
	/** @param weight */
	weight = ParamConfig.FLOAT(0.4, {
		range: [0, 1],
		rangeLocked: [true, true],
		...PostParamOptions,
	});
	/** @param exposure */
	exposure = ParamConfig.FLOAT(0.6, {
		range: [0, 1],
		rangeLocked: [true, true],
		...PostParamOptions,
	});
	/** @param blur */
	blur = ParamConfig.BOOLEAN(1, {
		...PostParamOptions,
	});

	/** @param kernel size */
	kernelSize = ParamConfig.INTEGER(KernelSize.LARGE, {
		visibleIf: {blur: 1},
		...PostParamOptions,
		...KERNEL_SIZE_MENU_OPTIONS,
	});
	/** @param resolutionScale */
	resolutionScale = ParamConfig.FLOAT(0.5, {
		...PostParamOptions,
	});
	/** @param effect opacity */
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
const ParamsConfig = new GodRaysPostParamsConfig();
export class GodRaysPostNode extends TypedPostProcessNode<EffectPass, GodRaysPostParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'godRays';
	}

	private _rendererSize = new Vector2();
	override createPass(context: TypedPostNodeContext) {
		context.renderer.getSize(this._rendererSize);
		const bloomEffect = new GodRaysEffect(context.camera, tmpLightSource, {
			blendFunction: BlendFunction.SCREEN,
			kernelSize: KERNEL_SIZES[this.pv.kernelSize],
			blur: this.pv.blur,
			samples: this.pv.samples,
			density: this.pv.density,
			decay: this.pv.decay,
			weight: this.pv.weight,
			exposure: this.pv.exposure,
		});
		const pass = new EffectPass(context.camera, bloomEffect);
		this.updatePass(pass);
		return pass;
	}
	override updatePass(pass: EffectPass) {
		const effect = (pass as any).effects[0] as GodRaysEffect;
		effect.godRaysMaterial.samples = this.pv.samples;
		effect.godRaysMaterial.density = this.pv.density;
		effect.godRaysMaterial.decay = this.pv.decay;
		effect.godRaysMaterial.weight = this.pv.weight;
		effect.godRaysMaterial.exposure = this.pv.exposure;

		effect.blur = this.pv.blur;
		(effect.blurPass.blurMaterial as any).kernelSize = KERNEL_SIZES[this.pv.kernelSize];
		effect.blurPass.resolution.scale = this.pv.resolutionScale;

		effect.blendMode.opacity.value = this.pv.opacity;
		effect.blendMode.blendFunction = BLEND_FUNCTIONS[this.pv.blendFunction];

		const lightSource = _findLightSource(this.scene(), this.pv.objectMask);

		if (lightSource) {
			(effect as any).lightSource = lightSource;
			const material = lightSource.material;
			if (CoreType.isArray(material)) {
				for (let m of material) {
					_updateLightSourceMaterial(m);
				}
			} else {
				_updateLightSourceMaterial(material);
			}
		} else {
			(effect as any).lightSource = tmpLightSource;
		}
	}
}

import {BaseNodeType} from './../../_Base';
import {NodeContext} from './../../../poly/NodeContext';
import {TypeAssert} from './../../../poly/Assert';
import {RayMarchingUniforms, RAYMARCHING_UNIFORMS} from './../../gl/gl/raymarching/uniforms';
import {Constructor} from '../../../../types/GlobalTypes';
import {NodeParamsConfig, ParamConfig} from '../../utils/params/ParamsConfig';
import {TypedMatNode} from '../_Base';
import {Material, Texture} from 'three';
import {ShaderMaterialWithCustomMaterials} from '../../../../core/geometry/Material';
import {isBooleanTrue} from '../../../../core/Type';
import {CustomMaterialRayMarchingParamConfig} from './customMaterials/CustomMaterialRayMarching';
import {ThreeToGl} from '../../../../core/ThreeToGl';

enum RayMarchingDebugMode {
	STEPS_COUNT = 'Steps Count',
	DEPTH = 'Depth',
}
const RAYMARCHING_DEBUG_MODES: RayMarchingDebugMode[] = [RayMarchingDebugMode.STEPS_COUNT, RayMarchingDebugMode.DEPTH];
const DEBUG_STEPS_COUNT = RAYMARCHING_DEBUG_MODES.indexOf(RayMarchingDebugMode.STEPS_COUNT);
// const DEBUG_DEPTH = RAYMARCHING_DEBUG_MODES.indexOf(RayMarchingDebugMode.DEPTH);

interface EnvMapParams {
	envMapCubeUVHeight: number;
}
interface EnvMapData {
	texelWidth: number;
	texelHeight: number;
	maxMip: number;
}
interface EnvMapDataWithRotation extends EnvMapData {
	tEnvMapRotate: boolean;
}
// from three.js WebGLProgram.js
function generateCubeUVSize(parameters: EnvMapParams): EnvMapData | null {
	const imageHeight = parameters.envMapCubeUVHeight;

	if (imageHeight === null) return null;

	const maxMip = Math.log2(imageHeight) - 2;

	const texelHeight = 1.0 / imageHeight;

	const texelWidth = 1.0 / (3 * Math.max(Math.pow(2, maxMip), 7 * 16));

	return {texelWidth, texelHeight, maxMip};
}
function setDefines(shaderMaterial: ShaderMaterialWithCustomMaterials, props?: EnvMapDataWithRotation | null) {
	shaderMaterial.defines['ENVMAP_TYPE_CUBE_UV'] = props ? 1 : 0;
	shaderMaterial.defines['CUBEUV_TEXEL_WIDTH'] = props ? props.texelWidth : ThreeToGl.float(0.1);
	shaderMaterial.defines['CUBEUV_TEXEL_HEIGHT'] = props ? props.texelHeight : ThreeToGl.float(0.1);
	shaderMaterial.defines['CUBEUV_MAX_MIP'] = props ? ThreeToGl.float(props.maxMip) : ThreeToGl.float(1);
	shaderMaterial.defines['ROTATE_ENV_MAP_Y'] = props ? props.tEnvMapRotate : 0;
}

export function RayMarchingMainParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param maximum number of steps the raymarcher will run */
		maxSteps = ParamConfig.INTEGER(RAYMARCHING_UNIFORMS.MAX_STEPS.value, {
			range: [1, 128],
			rangeLocked: [true, false],
		});
		/** @param maximum distance the raymarcher will step through */
		maxDist = ParamConfig.FLOAT(RAYMARCHING_UNIFORMS.MAX_DIST.value, {
			range: [1, 100],
			rangeLocked: [true, false],
		});
		/** @param when the ray reaches this distance from a surface it will stop marching. You can lower this value to increase the precision of the raymarcher */
		surfDist = ParamConfig.FLOAT(RAYMARCHING_UNIFORMS.SURF_DIST.value, {
			range: [0, 0.1],
			rangeLocked: [true, false],
			step: 0.0000001,
		});
		/** @param precision for normals computation */
		normalsBias = ParamConfig.FLOAT(RAYMARCHING_UNIFORMS.NORMALS_BIAS.value, {
			range: [0, 0.1],
			rangeLocked: [true, false],
			step: 0.0000001,
		});
		/** @param center */
		center = ParamConfig.VECTOR3(RAYMARCHING_UNIFORMS.CENTER.value.toArray());
	};
}

export function RayMarchingEnvMapParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param toggle if you want to use an environment map */
		useEnvMap = ParamConfig.BOOLEAN(0, {
			separatorBefore: true,
			// ...BooleanParamOptions(TextureEnvMapController),
		});
		/** @param specify the environment map COP node */
		envMap = ParamConfig.NODE_PATH('', {
			visibleIf: {useEnvMap: 1},
			nodeSelection: {context: NodeContext.COP},
		});
		/** @param environment intensity */
		envMapIntensity = ParamConfig.FLOAT(1, {
			visibleIf: {useEnvMap: 1},
			cook: false,
			callback: (node: BaseNodeType) =>
				RayMarchingController.updateUniformEnvMapIntensity(node as RayMarchingMatNode),
		});
		/** @param environment roughness */
		envMapRoughness = ParamConfig.FLOAT(1, {
			visibleIf: {useEnvMap: 1},
			cook: false,
			callback: (node: BaseNodeType) =>
				RayMarchingController.updateUniformEnvMapRoughness(node as RayMarchingMatNode),
		});
		/** @param allow env map rotation */
		tEnvMapRotate = ParamConfig.BOOLEAN(0, {
			visibleIf: {useEnvMap: 1},
		});
		/** @param env map rotation */
		envMapRotation = ParamConfig.FLOAT(0, {
			range: [-Math.PI, Math.PI],
			rangeLocked: [false, false],
			step: 0.0001,
			visibleIf: {useEnvMap: 1, tEnvMapRotate: 1},
			cook: false,
			callback: (node: BaseNodeType) =>
				RayMarchingController.updateUniformEnvMapRotate(node as RayMarchingMatNode),
		});
	};
}
export function RayMarchingDebugParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param debug mode */
		debug = ParamConfig.BOOLEAN(0, {
			separatorBefore: true,
		});
		/** @param outputs color showing the number of steps required to solve the raymarching */
		debugMode = ParamConfig.INTEGER(DEBUG_STEPS_COUNT, {
			menu: {entries: RAYMARCHING_DEBUG_MODES.map((name, value) => ({name, value}))},
			visibleIf: {debug: true},
		});
		/** @param min steps count */
		debugMinSteps = ParamConfig.INTEGER(RAYMARCHING_UNIFORMS.debugMinSteps.value, {
			range: [0, 128],
			rangeLocked: [true, false],
			step: 1,
			// visibleIf: {debug: true, debugMode: DEBUG_STEPS_COUNT},
		});
		/** @param max steps count */
		debugMaxSteps = ParamConfig.INTEGER(RAYMARCHING_UNIFORMS.debugMaxSteps.value, {
			range: [0, 128],
			rangeLocked: [true, false],
			step: 1,
			// visibleIf: {debug: true, debugMode: DEBUG_STEPS_COUNT},
		});
		/** @param min depth */
		debugMinDepth = ParamConfig.FLOAT(RAYMARCHING_UNIFORMS.debugMinDepth.value, {
			range: [0, 128],
			rangeLocked: [true, false],
			step: 1,
			// visibleIf: {debug: true, debugMode: DEBUG_DEPTH},
		});
		/** @param max depth */
		debugMaxDepth = ParamConfig.FLOAT(RAYMARCHING_UNIFORMS.debugMaxDepth.value, {
			range: [0, 128],
			rangeLocked: [true, false],
			step: 1,
			// visibleIf: {debug: true, debugMode: DEBUG_DEPTH},
		});
	};
}
class RayMarchingMaterial extends Material {}
class RayMarchingParamsConfig extends CustomMaterialRayMarchingParamConfig(
	RayMarchingDebugParamConfig(RayMarchingEnvMapParamConfig(RayMarchingMainParamConfig(NodeParamsConfig)))
) {}

abstract class RayMarchingMatNode extends TypedMatNode<RayMarchingMaterial, RayMarchingParamsConfig> {}

// const worldPos = new Vector3();

export class RayMarchingController {
	constructor(protected node: RayMarchingMatNode) {}

	async updateUniformsFromParams() {
		const shaderMaterial = this.node.material as ShaderMaterialWithCustomMaterials;
		const uniforms = shaderMaterial.uniforms as unknown as RayMarchingUniforms | undefined;
		if (!uniforms) {
			return;
		}
		const pv = this.node.pv;

		uniforms.MAX_STEPS.value = pv.maxSteps;
		uniforms.MAX_DIST.value = pv.maxDist;
		uniforms.SURF_DIST.value = pv.surfDist;
		uniforms.NORMALS_BIAS.value = pv.normalsBias;
		uniforms.CENTER.value.copy(pv.center);

		uniforms.shadowDepthMin.value = pv.shadowDepthMin;
		uniforms.shadowDepthMax.value = pv.shadowDepthMax;
		uniforms.shadowDistanceMin.value = pv.shadowDistanceMin;
		uniforms.shadowDistanceMax.value = pv.shadowDistanceMax;

		this._updateUniforms();
		this._updateDebug(shaderMaterial, uniforms);
		await this._updateEnvMap(shaderMaterial, uniforms);
	}

	private _updateDebug(shaderMaterial: ShaderMaterialWithCustomMaterials, uniforms: RayMarchingUniforms) {
		const pv = this.node.pv;
		if (isBooleanTrue(pv.debug)) {
			function updateDebugMode(uniforms: RayMarchingUniforms) {
				const debugMode = RAYMARCHING_DEBUG_MODES[pv.debugMode];
				switch (debugMode) {
					case RayMarchingDebugMode.STEPS_COUNT: {
						uniforms.debugMinSteps.value = pv.debugMinSteps;
						uniforms.debugMaxSteps.value = pv.debugMaxSteps;
						shaderMaterial.defines['DEBUG_STEPS_COUNT'] = 1;
						delete shaderMaterial.defines['DEBUG_DEPTH'];
						shaderMaterial.needsUpdate = true;
						return;
					}
					case RayMarchingDebugMode.DEPTH: {
						uniforms.debugMinDepth.value = pv.debugMinDepth;
						uniforms.debugMaxDepth.value = pv.debugMaxDepth;
						shaderMaterial.defines['DEBUG_DEPTH'] = 1;
						delete shaderMaterial.defines['DEBUG_STEPS_COUNT'];
						shaderMaterial.needsUpdate = true;
						return;
					}
				}
				TypeAssert.unreachable(debugMode);
			}
			updateDebugMode(uniforms);
		} else {
			if (shaderMaterial.defines['DEBUG_STEPS_COUNT'] != null) {
				delete shaderMaterial.defines['DEBUG_STEPS_COUNT'];
				shaderMaterial.needsUpdate = true;
			}
			if (shaderMaterial.defines['DEBUG_DEPTH'] != null) {
				delete shaderMaterial.defines['DEBUG_DEPTH'];
				shaderMaterial.needsUpdate = true;
			}
		}
	}
	private async _updateEnvMap(shaderMaterial: ShaderMaterialWithCustomMaterials, uniforms: RayMarchingUniforms) {
		const pv = this.node.pv;
		setDefines(shaderMaterial, null);
		const currentDefine = shaderMaterial.defines['ENVMAP_TYPE_CUBE_UV'];

		const _fetchTexture = async () => {
			const pathParam = this.node.p.envMap;
			if (pathParam.isDirty()) {
				await pathParam.compute();
			}
			const textureNode = pathParam.value.nodeWithContext(NodeContext.COP);
			if (textureNode) {
				const container = await textureNode.compute();
				const texture = container.texture();
				return texture;
			}
		};
		const _applyTexture = (texture: Texture) => {
			(uniforms as any)['envMap'].value = texture;

			const props = generateCubeUVSize({envMapCubeUVHeight: texture.image.height});
			setDefines(shaderMaterial, props ? {...props, tEnvMapRotate: pv.tEnvMapRotate} : null);
		};
		const _removeTexture = () => {
			(uniforms as any)['envMap'].value = null;
			setDefines(shaderMaterial, null);
		};
		const _updateNeedsUpdateIfRequired = () => {
			if (currentDefine != shaderMaterial.defines['ENVMAP_TYPE_CUBE_UV']) {
				shaderMaterial.needsUpdate = true;
			}
		};

		if (isBooleanTrue(pv.useEnvMap)) {
			const texture = await _fetchTexture();
			if (texture) {
				_applyTexture(texture);
			} else {
				_removeTexture();
			}
		} else {
			_removeTexture();
		}
		_updateNeedsUpdateIfRequired();
	}
	/**
	 *
	 * uniforms
	 *
	 */
	private _updateUniforms() {
		RayMarchingController._updateUniforms(this.node);
	}
	private static _updateUniforms(node: RayMarchingMatNode) {
		this.updateUniformEnvMapIntensity(node);
		this.updateUniformEnvMapRoughness(node);
		this.updateUniformEnvMapRotate(node);
	}
	static updateUniformEnvMapIntensity(node: RayMarchingMatNode) {
		const shaderMaterial = node.material as ShaderMaterialWithCustomMaterials;
		const uniforms = shaderMaterial.uniforms as unknown as RayMarchingUniforms | undefined;
		if (!uniforms) {
			return;
		}
		(uniforms as any)['envMapIntensity'].value = node.pv.envMapIntensity;
	}
	static updateUniformEnvMapRoughness(node: RayMarchingMatNode) {
		const shaderMaterial = node.material as ShaderMaterialWithCustomMaterials;
		const uniforms = shaderMaterial.uniforms as unknown as RayMarchingUniforms | undefined;
		if (!uniforms) {
			return;
		}
		(uniforms as any)['roughness'].value = node.pv.envMapRoughness;
	}
	static updateUniformEnvMapRotate(node: RayMarchingMatNode) {
		const shaderMaterial = node.material as ShaderMaterialWithCustomMaterials;
		const uniforms = shaderMaterial.uniforms as unknown as RayMarchingUniforms | undefined;
		if (!uniforms) {
			return;
		}
		(uniforms as any)['envMapRotationY'].value = node.pv.envMapRotation;
	}
}

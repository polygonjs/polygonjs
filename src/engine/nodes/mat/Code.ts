/**
 * Creates a material for which you can write GLSL code
 *
 *
 */
import {ShaderMaterial} from 'three';
import {FrontSide} from 'three';
import {PrimitiveMatNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {
	AdvancedCommonController,
	AdvancedCommonParamConfig,
	AdvancedCommonControllers,
} from './utils/AdvancedCommonController';
import {
	UniformsTransparencyParamConfig,
	UniformsTransparencyController,
	UniformsTransparencyControllers,
} from './utils/UniformsTransparencyController';

import {
	WireframeShaderMaterialController,
	WireframeShaderMaterialParamsConfig,
	WireframeShaderMaterialControllers,
} from './utils/WireframeShaderMaterialController';
import {FogController, FogParamConfig, FogControllers} from './utils/FogController';
import {AdvancedFolderParamConfig} from './utils/AdvancedFolder';
import {StringParamLanguage} from '../../params/utils/OptionsController';
import {Constructor} from '../../../types/GlobalTypes';
import {isBooleanTrue} from '../../../core/Type';

export const VERTEX_DEFAULT = `
varying vec3 vWorldPosition;

void main() {

	vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
	vWorldPosition = worldPosition.xyz;

	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

}`;
const FRAGMENT_DEFAULT = `
varying vec3 vWorldPosition;

void main() {

	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );

}`;

interface CodeControllers
	extends AdvancedCommonControllers,
		FogControllers,
		UniformsTransparencyControllers,
		WireframeShaderMaterialControllers {}

export function CodeParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		vertexShader = ParamConfig.FOLDER(null);
		vertex = ParamConfig.STRING(VERTEX_DEFAULT, {
			language: StringParamLanguage.GLSL,
			hideLabel: true,
		});
		fragmentShader = ParamConfig.FOLDER(null);
		fragment = ParamConfig.STRING(FRAGMENT_DEFAULT, {
			language: StringParamLanguage.GLSL,
			hideLabel: true,
		});
		extensions = ParamConfig.FOLDER(null);
		clipCullDistance = ParamConfig.BOOLEAN(1);
		multiDraw = ParamConfig.BOOLEAN(1);
	};
}

class CodeMatParamsConfig extends FogParamConfig(
	WireframeShaderMaterialParamsConfig(
		AdvancedCommonParamConfig(
			UniformsTransparencyParamConfig(
				/* advanced */
				AdvancedFolderParamConfig(
					/* textures */
					CodeParamConfig(NodeParamsConfig)
				)
			)
		)
	)
) {}
const ParamsConfig = new CodeMatParamsConfig();

export class CodeMatNode extends PrimitiveMatNode<ShaderMaterial, CodeMatParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'code';
	}

	override createMaterial() {
		return new ShaderMaterial({
			vertexColors: false,
			side: FrontSide,
			opacity: 1,
		});
	}
	readonly controllers: CodeControllers = {
		advancedCommon: new AdvancedCommonController(this),
		fog: new FogController(this),
		uniformTransparency: new UniformsTransparencyController(this),
		wireframeShader: new WireframeShaderMaterialController(this),
	};
	protected override controllersList = Object.values(this.controllers);

	override async cook() {
		this._material = this._material || this.createMaterial();
		await Promise.all(this.controllersPromises(this._material));

		this._material.vertexShader = this.pv.vertex;
		this._material.fragmentShader = this.pv.fragment;
		this._material.extensions.clipCullDistance = isBooleanTrue(this.pv.clipCullDistance);
		this._material.extensions.multiDraw = isBooleanTrue(this.pv.multiDraw);
		this._material.needsUpdate = true;

		this.setMaterial(this._material);
	}
}

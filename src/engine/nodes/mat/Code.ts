/**
 * Creates a material for which you can write GLSL code
 *
 *
 */
import {ShaderMaterial} from 'three';
import {FrontSide} from 'three';
import {TypedMatNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {AdvancedCommonController, AdvancedCommonParamConfig} from './utils/AdvancedCommonController';
import {UniformsTransparencyParamConfig, UniformsTransparencyController} from './utils/UniformsTransparencyController';

import {
	WireframeShaderMaterialController,
	WireframeShaderMaterialParamsConfig,
} from './utils/WireframeShaderMaterialController';
import {FogController, FogParamConfig} from './utils/FogController';
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

interface CodeControllers {
	advancedCommon: AdvancedCommonController;
}

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
		derivatives = ParamConfig.BOOLEAN(1);
		// fragDepth = ParamConfig.BOOLEAN(1);
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

export class CodeMatNode extends TypedMatNode<ShaderMaterial, CodeMatParamsConfig> {
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
	};
	private controllerNames = Object.keys(this.controllers) as Array<keyof CodeControllers>;

	override initializeNode() {
		this.params.onParamsCreated('init controllers', () => {
			for (let controllerName of this.controllerNames) {
				this.controllers[controllerName].initializeNode();
			}
		});
	}
	override async cook() {
		for (let controllerName of this.controllerNames) {
			this.controllers[controllerName].update();
		}
		UniformsTransparencyController.update(this);
		FogController.update(this);
		WireframeShaderMaterialController.update(this);

		this.material.vertexShader = this.pv.vertex;
		this.material.fragmentShader = this.pv.fragment;
		this.material.extensions.derivatives = isBooleanTrue(this.pv.derivatives);
		this.material.needsUpdate = true;

		this.setMaterial(this.material);
	}
}

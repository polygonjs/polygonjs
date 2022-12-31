/**
 * Updates the envMap properties of the input material
 *

 *
 */
import {Material, MeshStandardMaterial} from 'three';
import {UpdateMatNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {TextureEnvMapController, EnvMapParamConfig, isValidEnvMapMaterial} from './utils/TextureEnvMapController';

interface EnvMapControllers {
	envMap: TextureEnvMapController;
}

class EnvMapMatParamsConfig extends EnvMapParamConfig(NodeParamsConfig) {}
const ParamsConfig = new EnvMapMatParamsConfig();

export class EnvMapMatNode extends UpdateMatNode<MeshStandardMaterial, EnvMapMatParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'envMap';
	}

	readonly controllers: EnvMapControllers = {
		envMap: new TextureEnvMapController(this),
	};

	override async cook(inputMaterials: Material[]) {
		const inputMaterial = inputMaterials[0];
		const controller = this.controllers.envMap;
		if (isValidEnvMapMaterial(inputMaterial)) {
			await controller.updateMaterial(inputMaterial);
			this.setMaterial(inputMaterial);
		} else {
			this.states.error.set('input material does not have envMap properties');
		}
	}
}

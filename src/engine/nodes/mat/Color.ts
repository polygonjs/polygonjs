/**
 * Updates the color properties of the input material
 *

 *
 */
import {Material} from 'three';
import {UpdateMatNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {ColoredMaterial, ColorsController, ColorParamConfig, isValidColoredMaterial} from './utils/ColorsController';

interface ColorControllers {
	colors: ColorsController;
}

class ColorMatParamsConfig extends ColorParamConfig(NodeParamsConfig) {}
const ParamsConfig = new ColorMatParamsConfig();

export class ColorMatNode extends UpdateMatNode<ColoredMaterial, ColorMatParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'color';
	}

	readonly controllers: ColorControllers = {
		colors: new ColorsController(this),
	};

	override async cook(inputMaterials: Material[]) {
		const inputMaterial = inputMaterials[0];
		console.warn(this.path(), {inputMaterial});
		const controller = this.controllers.colors;
		if (isValidColoredMaterial(inputMaterial)) {
			controller.updateMaterial(inputMaterial);
			this.setMaterial(inputMaterial);
		} else {
			this.states.error.set('input material does not have envMap properties');
		}
	}
}

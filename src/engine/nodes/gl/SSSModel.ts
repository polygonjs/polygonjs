/**
 * SSS Model
 *
 *
 *
 */

import {TypedGlNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../../nodes/utils/params/ParamsConfig';
import {GlConnectionPoint, GlConnectionPointType} from '../../nodes/utils/io/connections/Gl';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {ThreeToGl} from '../../../core/ThreeToGl';
import {FloatParam} from '../../params/Float';
import {ColorParam} from '../../params/Color';

const OUTPUT = {
	SSS_MODEL: 'SSSModel',
};
class VATDataGlParamsConfig extends NodeParamsConfig {
	color = ParamConfig.COLOR([1, 1, 1]);
	thickness = ParamConfig.FLOAT(0.1);
	power = ParamConfig.FLOAT(2.0);
	scale = ParamConfig.FLOAT(16.0);
	distortion = ParamConfig.FLOAT(0.1);
	ambient = ParamConfig.FLOAT(0.4);
	attenuation = ParamConfig.FLOAT(0.8);
}
const ParamsConfig = new VATDataGlParamsConfig();
export class SSSModelGlNode extends TypedGlNode<VATDataGlParamsConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return 'SSSModel';
	}

	initializeNode() {
		this.io.outputs.setNamedOutputConnectionPoints([
			new GlConnectionPoint(OUTPUT.SSS_MODEL, GlConnectionPointType.SSS_MODEL),
		]);
	}

	setLines(shaders_collection_controller: ShadersCollectionController) {
		const body_lines = [];
		const outSSModel = this.glVarName(OUTPUT.SSS_MODEL);
		body_lines.push(`SSSModel ${outSSModel}`);
		body_lines.push(`${outSSModel}.isActive = true;`);
		body_lines.push(this._paramLineFloat(outSSModel, this.p.color));
		body_lines.push(this._paramLineFloat(outSSModel, this.p.thickness));
		body_lines.push(this._paramLineFloat(outSSModel, this.p.power));
		body_lines.push(this._paramLineFloat(outSSModel, this.p.scale));
		body_lines.push(this._paramLineFloat(outSSModel, this.p.distortion));
		body_lines.push(this._paramLineFloat(outSSModel, this.p.ambient));
		body_lines.push(this._paramLineFloat(outSSModel, this.p.attenuation));
		shaders_collection_controller.addBodyLines(this, body_lines);
	}
	private _paramLineFloat(varName: string, param: FloatParam | ColorParam) {
		return `${varName}.${param.name()} = ${ThreeToGl.vector3(this.variableForInputParam(param))};`;
	}
}

// /**
//  * Function of SDF Tube
//  *
//  * @remarks
//  *
//  * based on [https://iquilezles.org/articles/distfunctions/](https://iquilezles.org/articles/distfunctions/)
//  */

// import {NodeParamsConfig} from '../utils/params/ParamsConfig';
// import {JsConnectionPointType, JsConnectionPoint, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
// import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
// import {TypedJsNode} from './_Base';
// import {defaultPosition} from './_BaseSDF';
// import {Poly} from '../../Poly';
// import {JsType} from '../../poly/registers/nodes/types/Js';

// const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

// const OUTPUT_NAME = 'float';

// enum TextureSDFInputName {
// 	position = 'position',
// 	center = 'center',
// 	boundMin = 'boundMin',
// 	boundMax = 'boundMax',
// 	boundScale = 'boundScale',
// 	bias = 'bias',
// }

// class TextureSDFJsParamsConfig extends NodeParamsConfig {
// 	// tex = ParamConfig.STRING('texture1');
// 	// position = ParamConfig.VECTOR3([0, 0, 0], {hidden: true});
// 	// center = ParamConfig.VECTOR3([0, 0, 0]);
// 	// boundMin = ParamConfig.VECTOR3([0, 0, 0]);
// 	// boundMax = ParamConfig.VECTOR3([1, 1, 1]);
// 	// boundScale = ParamConfig.VECTOR3([1, 1, 1]);
// 	// bias = ParamConfig.FLOAT(0.01);
// 	// tblur = ParamConfig.BOOLEAN(0);
// 	// blurDist = ParamConfig.FLOAT(0.01, {
// 	// 	visibleIf: {tblur: 1},
// 	// });
// }
// const ParamsConfig = new TextureSDFJsParamsConfig();
// export class TextureSDFJsNode extends TypedJsNode<TextureSDFJsParamsConfig> {
// 	override paramsConfig = ParamsConfig;
// 	static override type() {
// 		return JsType.TEXTURE_SDF;
// 	}

// 	override initializeNode() {
// 		super.initializeNode();

// 		this.io.inputs.setNamedInputConnectionPoints([
// 			new JsConnectionPoint(JsConnectionPointType.TEXTURE, JsConnectionPointType.TEXTURE, CONNECTION_OPTIONS),
// 			new JsConnectionPoint(TextureSDFInputName.position, JsConnectionPointType.VECTOR3, CONNECTION_OPTIONS),
// 			new JsConnectionPoint(TextureSDFInputName.center, JsConnectionPointType.VECTOR3, CONNECTION_OPTIONS),
// 			new JsConnectionPoint(TextureSDFInputName.boundMin, JsConnectionPointType.VECTOR3, CONNECTION_OPTIONS),
// 			new JsConnectionPoint(TextureSDFInputName.boundMax, JsConnectionPointType.VECTOR3, CONNECTION_OPTIONS),
// 			new JsConnectionPoint(TextureSDFInputName.boundScale, JsConnectionPointType.VECTOR3, CONNECTION_OPTIONS),
// 			new JsConnectionPoint(TextureSDFInputName.bias, JsConnectionPointType.FLOAT, CONNECTION_OPTIONS),
// 		]);

// 		this.io.outputs.setNamedOutputConnectionPoints([
// 			new JsConnectionPoint(OUTPUT_NAME, JsConnectionPointType.FLOAT),
// 		]);
// 	}

// 	override setLines(linesController: JsLinesCollectionController) {
// 		const texture = this.variableForInput(linesController, JsConnectionPointType.TEXTURE);
// 		const inputPosition = this.io.inputs.named_input(TextureSDFInputName.position);
// 		const position = inputPosition
// 			? this.variableForInput(linesController, TextureSDFInputName.position)
// 			: defaultPosition(linesController, this);
// 		const center = this.variableForInput(linesController, TextureSDFInputName.center);
// 		const boundMin = this.variableForInput(linesController, TextureSDFInputName.boundMin);
// 		const boundMax = this.variableForInput(linesController, TextureSDFInputName.boundMax);
// 		const boundScale = this.variableForInput(linesController, TextureSDFInputName.boundScale);
// 		const bias = this.variableForInput(linesController, TextureSDFInputName.bias);

// 		const func = Poly.namedFunctionsRegister.getFunction('SDFTexture', this, linesController);
// 		linesController.addBodyOrComputed(this, [
// 			{
// 				dataType: JsConnectionPointType.FLOAT,
// 				varName: this.jsVarName(OUTPUT_NAME),
// 				value: func.asString(texture, position, center, boundMin, boundMax, boundScale, bias),
// 			},
// 		]);
// 	}
// }

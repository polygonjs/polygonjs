/**
 * Updates stencil properties
 *
 *
 */
import {
	Material,
	ShaderMaterial,
	//
	StencilFunc,
	NeverStencilFunc,
	LessStencilFunc,
	EqualStencilFunc,
	LessEqualStencilFunc,
	GreaterStencilFunc,
	NotEqualStencilFunc,
	GreaterEqualStencilFunc,
	AlwaysStencilFunc,
	//
	StencilOp,
	ZeroStencilOp,
	KeepStencilOp,
	ReplaceStencilOp,
	IncrementStencilOp,
	DecrementStencilOp,
	IncrementWrapStencilOp,
	DecrementWrapStencilOp,
	InvertStencilOp,
} from 'three';
import {UpdateMatNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {ShaderMaterialWithCustomMaterials} from '../../../core/geometry/Material';

//
//
// STENCIL FUNCTIONS
//
//
const STENCIL_FUNCTIONS = [
	{NeverStencilFunc},
	{LessStencilFunc},
	{EqualStencilFunc},
	{LessEqualStencilFunc},
	{GreaterStencilFunc},
	{NotEqualStencilFunc},
	{GreaterEqualStencilFunc},
	{AlwaysStencilFunc},
];
const STENCIL_FUNCTIONS_NAMES = STENCIL_FUNCTIONS.map((obj) => Object.keys(obj)[0]);
const STENCIL_FUNCTION_BY_NAME: Record<string, StencilFunc> = {};
for (const k of STENCIL_FUNCTIONS) {
	const key = Object.keys(k)[0];
	const value = Object.values(k)[0];
	STENCIL_FUNCTION_BY_NAME[key] = value as StencilFunc;
}
const STENCIL_FUNC_ENTRIES = STENCIL_FUNCTIONS_NAMES.map((name, value) => {
	return {name: name, value: STENCIL_FUNCTION_BY_NAME[name]};
});

//
//
// STENCIL OP
//
//
const STENCIL_OPS = [
	{ZeroStencilOp},
	{KeepStencilOp},
	{ReplaceStencilOp},
	{IncrementStencilOp},
	{DecrementStencilOp},
	{IncrementWrapStencilOp},
	{DecrementWrapStencilOp},
	{InvertStencilOp},
];
const STENCIL_OPS_NAMES = STENCIL_OPS.map((obj) => Object.keys(obj)[0]);
const STENCIL_OP_BY_NAME: Record<string, StencilOp> = {};
for (const k of STENCIL_OPS) {
	const key = Object.keys(k)[0];
	const value = Object.values(k)[0];
	STENCIL_OP_BY_NAME[key] = value as StencilOp;
}
const STENCIL_OP_ENTRIES = STENCIL_OPS_NAMES.map((name, value) => {
	return {name: name, value: STENCIL_OP_BY_NAME[name]};
});

class StencilPropertiesMatParamsConfig extends NodeParamsConfig {
	/** @param stencilWrite */
	stencilWrite = ParamConfig.BOOLEAN(1);
	/** @param stencilFunc */
	stencilFunc = ParamConfig.INTEGER(EqualStencilFunc, {
		menu: {
			entries: STENCIL_FUNC_ENTRIES,
		},
	});
	/** @param stencilWriteMask */
	stencilWriteMask = ParamConfig.INTEGER(255, {
		range: [0, 255],
		rangeLocked: [true, true],
	});
	/** @param stencilWriteMask */
	stencilFuncMask = ParamConfig.INTEGER(255, {
		range: [0, 255],
		rangeLocked: [true, true],
	});
	/** @param stencilRef */
	stencilRef = ParamConfig.INTEGER(0);
	/** @param stencilFail */
	stencilFail = ParamConfig.INTEGER(KeepStencilOp, {
		menu: {
			entries: STENCIL_OP_ENTRIES,
		},
	});
	/** @param stencilZFail */
	stencilZFail = ParamConfig.INTEGER(KeepStencilOp, {
		menu: {
			entries: STENCIL_OP_ENTRIES,
		},
	});
	/** @param stencilZPass */
	stencilZPass = ParamConfig.INTEGER(KeepStencilOp, {
		menu: {
			entries: STENCIL_OP_ENTRIES,
		},
	});
}
const ParamsConfig = new StencilPropertiesMatParamsConfig();

export class StencilPropertiesMatNode extends UpdateMatNode<ShaderMaterial, StencilPropertiesMatParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'stencilProperties';
	}

	override async cook(inputMaterials: Material[]) {
		const inputMaterial = inputMaterials[0] as ShaderMaterialWithCustomMaterials;

		inputMaterial.stencilWrite = this.pv.stencilWrite;
		inputMaterial.stencilFunc = this.pv.stencilFunc as StencilFunc;
		inputMaterial.stencilWriteMask = this.pv.stencilWriteMask;
		inputMaterial.stencilFuncMask = this.pv.stencilFuncMask;
		inputMaterial.stencilRef = this.pv.stencilRef;
		inputMaterial.stencilFail = this.pv.stencilFail as StencilOp;
		inputMaterial.stencilZFail = this.pv.stencilZFail as StencilOp;
		inputMaterial.stencilZPass = this.pv.stencilZPass as StencilOp;

		this.setMaterial(inputMaterial);
	}
}

/**
 * repeats an SDF, allowing fractal effects
 *
 * @remarks
 *
 * based on [https://iquilezles.org/articles/distfunctions/](https://iquilezles.org/articles/distfunctions/)
 */

import {BaseSDFGlNode} from './_BaseSDF';
import {ThreeToGl} from '../../../../src/core/ThreeToGl';
import SDFRepeatMethods from './gl/raymarching/sdfRepeat.glsl';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {GlConnectionPointType, GlConnectionPoint} from '../utils/io/connections/Gl';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {FunctionGLDefinition} from './utils/GLDefinition';
import {isBooleanTrue} from '../../../core/Type';
import {VisibleIfParamOptions} from '../../params/utils/OptionsController';

const OUTPUT_NAME = 'p';

const clampVisibility: VisibleIfParamOptions[] = [{repeatX: 1}, {repeatY: 1}, {repeatZ: 1}];
const clampAxisVisibility: VisibleIfParamOptions[] = clampVisibility.map((option) => ({...option, clamped: 1}));
const clampAxisBoundVisibilityX: VisibleIfParamOptions[] = clampAxisVisibility.map((option) => ({
	...option,
	clampedX: 1,
}));
const clampAxisBoundVisibilityY: VisibleIfParamOptions[] = clampAxisVisibility.map((option) => ({
	...option,
	clampedY: 1,
}));
const clampAxisBoundVisibilityZ: VisibleIfParamOptions[] = clampAxisVisibility.map((option) => ({
	...option,
	clampedZ: 1,
}));

class SDFRepeatGlParamsConfig extends NodeParamsConfig {
	position = ParamConfig.VECTOR3([0, 0, 0], {hidden: true});
	center = ParamConfig.VECTOR3([0, 0, 0]);
	period = ParamConfig.VECTOR3([1, 1, 1]);
	repeatX = ParamConfig.BOOLEAN(1);
	repeatY = ParamConfig.BOOLEAN(1);
	repeatZ = ParamConfig.BOOLEAN(1);
	clamped = ParamConfig.BOOLEAN(0, {visibleIf: clampVisibility});
	clampedX = ParamConfig.BOOLEAN(0, {visibleIf: clampAxisVisibility});
	boundX = ParamConfig.VECTOR2([-1, 1], {visibleIf: clampAxisBoundVisibilityX});
	clampedY = ParamConfig.BOOLEAN(0, {visibleIf: clampAxisVisibility});
	boundY = ParamConfig.VECTOR2([-1, 1], {visibleIf: clampAxisBoundVisibilityY});
	clampedZ = ParamConfig.BOOLEAN(0, {visibleIf: clampAxisVisibility});
	boundZ = ParamConfig.VECTOR2([-1, 1], {visibleIf: clampAxisBoundVisibilityZ});
}
const ParamsConfig = new SDFRepeatGlParamsConfig();
export class SDFRepeatGlNode extends BaseSDFGlNode<SDFRepeatGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'SDFRepeat';
	}

	override initializeNode() {
		super.initializeNode();
		this.io.connection_points.spare_params.setInputlessParamNames([
			'repeatX',
			'repeatY',
			'repeatZ',
			'clamped',
			'clampedX',
			'clampedY',
			'clampedZ',
		]);
		this.io.outputs.setNamedOutputConnectionPoints([
			new GlConnectionPoint(OUTPUT_NAME, GlConnectionPointType.VEC3),
		]);
	}

	override setLines(shadersCollectionController: ShadersCollectionController) {
		const position = this.position();
		const center = ThreeToGl.vector3(this.variableForInputParam(this.p.center));
		const period = ThreeToGl.vector3(this.variableForInputParam(this.p.period));
		const float = this.glVarName(OUTPUT_NAME);
		const functionName = `SDFRepeat${this._functionSuffixUnclamped()}`;
		const bodyLines: string[] = [];
		if (this.clamped()) {
			const boundMin = this.glVarName('boundMin');
			const boundMax = this.glVarName('boundMax');
			const boundX = ThreeToGl.vector3(this.variableForInputParam(this.p.boundX));
			const boundY = ThreeToGl.vector3(this.variableForInputParam(this.p.boundY));
			const boundZ = ThreeToGl.vector3(this.variableForInputParam(this.p.boundZ));
			const clampedAxisesCount = this._clampedAxisesCount();
			switch (clampedAxisesCount) {
				case 1: {
					let bounds = boundX;
					if (this.clampedX()) {
						bounds = boundX;
					} else {
						if (this.clampedY()) {
							bounds = boundY;
						} else {
							bounds = boundZ;
						}
					}
					bodyLines.push(`float ${boundMin} = ${bounds}.x`, `float ${boundMax} = ${bounds}.y`);
					break;
				}
				case 2: {
					let bounds1 = boundX;
					let bounds2 = boundY;
					if (this.clampedX()) {
						bounds1 = boundX;
						if (this.clampedY()) {
							bounds2 = boundY;
						} else {
							bounds2 = boundZ;
						}
					} else {
						bounds1 = boundY;
						bounds2 = boundZ;
					}
					bodyLines.push(
						`vec2 ${boundMin} = vec2(${bounds1}.x, ${bounds2}.x)`,
						`vec2 ${boundMax} = vec2(${bounds1}.y, ${bounds2}.y)`
					);
					break;
				}
				case 3: {
					bodyLines.push(
						`vec3 ${boundMin} = vec3(${boundX}.x,${boundY}.x,${boundZ}.x)`,
						`vec3 ${boundMax} = vec3(${boundX}.y,${boundY}.y,${boundZ}.y)`
					);
					break;
				}
			}

			bodyLines.push(
				`vec3 ${float} = ${functionName}(${position} - ${center}, ${period}, ${boundMin}, ${boundMax})`
			);
		} else {
			bodyLines.push(`vec3 ${float} = ${functionName}(${position} - ${center}, ${period})`);
		}

		shadersCollectionController.addBodyLines(this, bodyLines);
		shadersCollectionController.addDefinitions(this, [new FunctionGLDefinition(this, SDFRepeatMethods)]);
	}
	private _clampedAxisesCount() {
		let count = 0;
		if (this.clampedX()) {
			count++;
		}
		if (this.clampedY()) {
			count++;
		}
		if (this.clampedZ()) {
			count++;
		}
		return count;
	}

	repeatAll() {
		const x = isBooleanTrue(this.pv.repeatX);
		const y = isBooleanTrue(this.pv.repeatY);
		const z = isBooleanTrue(this.pv.repeatZ);
		return (x && y && z) || !(x || y || z);
	}
	clamped() {
		const x = isBooleanTrue(this.pv.repeatX);
		const y = isBooleanTrue(this.pv.repeatY);
		const z = isBooleanTrue(this.pv.repeatZ);
		const clamped = isBooleanTrue(this.pv.clamped);
		const clampedX = isBooleanTrue(this.pv.clampedX);
		const clampedY = isBooleanTrue(this.pv.clampedY);
		const clampedZ = isBooleanTrue(this.pv.clampedZ);
		return clamped && ((x && clampedX) || (y && clampedY) || (z && clampedZ));
	}
	clampedX() {
		const x = isBooleanTrue(this.pv.repeatX);
		const clamped = isBooleanTrue(this.pv.clamped);
		const clampedX = isBooleanTrue(this.pv.clampedX);
		return clamped && x && clampedX;
	}
	clampedY() {
		const y = isBooleanTrue(this.pv.repeatY);
		const clamped = isBooleanTrue(this.pv.clamped);
		const clampedY = isBooleanTrue(this.pv.clampedY);
		return clamped && y && clampedY;
	}
	clampedZ() {
		const z = isBooleanTrue(this.pv.repeatZ);
		const clamped = isBooleanTrue(this.pv.clamped);
		const clampedZ = isBooleanTrue(this.pv.clampedZ);
		return clamped && z && clampedZ;
	}
	clampedAll() {
		return this.clampedX() && this.clampedY() && this.clampedZ();
	}
	private _functionSuffixUnclamped() {
		const x = isBooleanTrue(this.pv.repeatX);
		const y = isBooleanTrue(this.pv.repeatY);
		const z = isBooleanTrue(this.pv.repeatZ);
		const repeatAll = this.repeatAll();
		const args: string[] = [];
		if (!repeatAll) {
			if (x) args.push('X');
			if (y) args.push('Y');
			if (z) args.push('Z');
		}

		// clamped
		const clampedX = isBooleanTrue(this.pv.clampedX);
		const clampedY = isBooleanTrue(this.pv.clampedY);
		const clampedZ = isBooleanTrue(this.pv.clampedZ);
		if (this.clamped()) {
			args.push('Clamped');
			if (!this.clampedAll()) {
				if ((repeatAll || x) && clampedX) args.push('X');
				if ((repeatAll || y) && clampedY) args.push('Y');
				if ((repeatAll || z) && clampedZ) args.push('Z');
			}
		}

		return args.join('');
	}
}

/**
 * Set the geometry color
 *
 *
 */
import {TypedCsgNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CsgCoreGroup} from '../../../core/geometry/csg/CsgCoreGroup';
import type {colors} from '@jscad/modeling';
import {colorToCsgRGB} from '../../../core/geometry/csg/CsgVecToVector';
// import {CsgObject} from '../../../core/geometry/csg/CsgCoreObject';
// const {colorize} = jscad.colors;

// function colorize(color: jscad.colors.RGB, object: CsgObject) {
// 	if (jscad.geometries.geom3.isA(object)) {
// 		geom3Colorize(color, object);
// 	} else {
// 		object.color = color;
// 	}
// }
// function geom3Colorize(color: jscad.colors.RGB, object: jscad.geometries.geom3.Geom3) {
// 	for (let poly of object.polygons) {
// 		poly.color = color;
// 	}
// }

class ColorCsgParamsConfig extends NodeParamsConfig {
	/** @param color */
	color = ParamConfig.COLOR([1, 1, 1]);
}
const ParamsConfig = new ColorCsgParamsConfig();

export class ColorCsgNode extends TypedCsgNode<ColorCsgParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'color';
	}
	protected override initializeNode() {
		this.io.inputs.setCount(1);
	}

	private _color: colors.RGB = [0, 0, 0];
	override cook(inputCoreGroups: CsgCoreGroup[]) {
		colorToCsgRGB(this.pv.color, this._color);
		const objects = inputCoreGroups[0].objects();
		for (let object of objects) {
			// do not use colorize as it clones the geo, which is not wanted here
			// colorize(this._color, object);
			object.color = this._color;
		}
		this.setCsgCoreObjects(objects);
	}
}

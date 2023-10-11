/**
 * Set a vertex color attribute
 *
 * @remarks
 * Note that just like the attrib_create, it is possible to use an expression to set the attribute value
 *
 */
import {Color} from 'three';
import {BufferAttribute} from 'three';
import {CoreColor} from '../../../core/Color';
import {TypedSopNode} from './_Base';
import {BaseCorePoint} from '../../../core/geometry/entities/point/CorePoint';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {BufferGeometry} from 'three';
import {Mesh} from 'three';

const DEFAULT_COLOR = new Color(1, 1, 1);
const COLOR_ATTRIB_NAME = 'color';

type ValueArrayByName = PolyDictionary<number[]>;
interface ArrayByGeometryUUID {
	R: ValueArrayByName;
	G: ValueArrayByName;
	B: ValueArrayByName;
}

import {ColorSopOperation} from '../../operations/sop/Color';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {PolyDictionary} from '../../../types/GlobalTypes';
import {isBooleanTrue} from '../../../core/BooleanValue';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {pointsFromObject} from '../../../core/geometry/entities/point/CorePointUtils';
import {CoreObjectType, ObjectContent, isObject3D} from '../../../core/geometry/ObjectContent';
import {corePointClassFactory} from '../../../core/geometry/CoreObjectFactory';
const DEFAULT = ColorSopOperation.DEFAULT_PARAMS;
class ColorSopParamsConfig extends NodeParamsConfig {
	/** @param toggle on if the color should be copied from another attribute */
	fromAttribute = ParamConfig.BOOLEAN(DEFAULT.fromAttribute);
	/** @param attribute name to copy value from */
	attribName = ParamConfig.STRING(DEFAULT.attribName, {
		visibleIf: {fromAttribute: 1},
	});
	/** @param color valu */
	color = ParamConfig.COLOR(DEFAULT.color, {
		visibleIf: {fromAttribute: 0},
		expression: {forEntities: true},
	});
	/** @param toggle on if the value should be set with hsv values rather than rgb */
	asHsv = ParamConfig.BOOLEAN(DEFAULT.asHsv, {
		visibleIf: {fromAttribute: 0},
	});
}
const ParamsConfig = new ColorSopParamsConfig();

export class ColorSopNode extends TypedSopNode<ColorSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.COLOR;
	}

	private _arrayByGeometryUUID: ArrayByGeometryUUID = {
		R: {},
		G: {},
		B: {},
	};

	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(InputCloneMode.FROM_NODE);
	}

	override async cook(inputCoreGroups: CoreGroup[]) {
		const coreGroup = inputCoreGroups[0];
		const objects = coreGroup.allObjects();

		for (const object of objects) {
			if (isBooleanTrue(this.pv.fromAttribute)) {
				this._setFromAttribute(object);
			} else {
				const hasExpression = this.p.color.hasExpression();
				if (hasExpression) {
					await this._evalExpressions(object);
				} else {
					this._evalSimpleValues(object);
				}
			}
		}

		// needs update required for when no cloning
		if (!this.io.inputs.cloneRequired(0)) {
			const geometries = coreGroup.geometries();
			for (const geometry of geometries) {
				(geometry.getAttribute(COLOR_ATTRIB_NAME) as BufferAttribute).needsUpdate = true;
			}
		}

		this.setCoreGroup(coreGroup);
	}

	_setFromAttribute<T extends CoreObjectType>(object: ObjectContent<T>) {
		const corePointClass = corePointClassFactory(object);

		const attribName = this.pv.attribName;
		if (attribName.trim().length == 0) {
			return;
		}
		const srcAttrib = corePointClass.attribute(object, attribName) as BufferAttribute | undefined;
		if (!srcAttrib) {
			return;
		}

		this._createInitColor(object);
		const points = pointsFromObject(object);

		const srcAttribSize = corePointClass.attribSize(object, attribName);
		const srcArray = srcAttrib.array;
		const destArray = (corePointClass.attribute(object, COLOR_ATTRIB_NAME) as BufferAttribute).array as number[];

		switch (srcAttribSize) {
			case 1: {
				for (let i = 0; i < points.length; i++) {
					const dest_i = i * 3;
					destArray[dest_i + 0] = srcArray[i];
					destArray[dest_i + 1] = 1 - srcArray[i];
					destArray[dest_i + 2] = 0;
				}
				break;
			}
			case 2: {
				for (let i = 0; i < points.length; i++) {
					const dest_i = i * 3;
					const src_i = i * 2;
					destArray[dest_i + 0] = srcArray[src_i + 0];
					destArray[dest_i + 1] = srcArray[src_i + 1];
					destArray[dest_i + 2] = 0;
				}
				break;
			}
			case 3: {
				for (let i = 0; i < srcArray.length; i++) {
					destArray[i] = srcArray[i];
				}
				break;
			}
			case 4: {
				for (let i = 0; i < points.length; i++) {
					const dest_i = i * 3;
					const src_i = i * 4;
					destArray[dest_i + 0] = srcArray[src_i + 0];
					destArray[dest_i + 1] = srcArray[src_i + 1];
					destArray[dest_i + 2] = srcArray[src_i + 2];
				}
				break;
			}
		}
	}

	private _createInitColor<T extends CoreObjectType>(object: ObjectContent<T>) {
		const corePointClass = corePointClassFactory(object);

		if (!corePointClass.hasAttribute(object, COLOR_ATTRIB_NAME)) {
			corePointClass.addNumericAttribute(object, COLOR_ATTRIB_NAME, 3, DEFAULT_COLOR);
		}
	}

	_evalSimpleValues<T extends CoreObjectType>(object: ObjectContent<T>) {
		const corePointClass = corePointClassFactory(object);

		this._createInitColor(object);

		let newColor: Color;
		if (isBooleanTrue(this.pv.asHsv)) {
			newColor = new Color();
			CoreColor.setHSV(this.pv.color.r, this.pv.color.g, this.pv.color.b, newColor);
		} else {
			newColor = this.pv.color; //.clone();
		}
		corePointClass.addNumericAttribute(object, COLOR_ATTRIB_NAME, 3, newColor);
	}

	async _evalExpressions<T extends CoreObjectType>(object: ObjectContent<T>) {
		const points = pointsFromObject(object);

		if (!isObject3D(object)) {
			return;
		}
		// const coreGeometry = core_object.coreGeometry();
		// if (coreGeometry) {
		this._createInitColor(object);
		// }
		const geometry = (object as Mesh).geometry as BufferGeometry;
		if (geometry) {
			const array = (geometry.getAttribute(COLOR_ATTRIB_NAME) as BufferAttribute).array as number[];

			const tmpArrayR = await this._updateFromParam(geometry, array, points, 0);
			const tmpArrayG = await this._updateFromParam(geometry, array, points, 1);
			const tmpArrayB = await this._updateFromParam(geometry, array, points, 2);

			if (tmpArrayR) {
				this._commitTmpValues(tmpArrayR, array, 0);
			}
			if (tmpArrayG) {
				this._commitTmpValues(tmpArrayG, array, 1);
			}
			if (tmpArrayB) {
				this._commitTmpValues(tmpArrayB, array, 2);
			}

			// to hsv
			if (isBooleanTrue(this.pv.asHsv)) {
				let current = new Color();
				let target = new Color();
				let index;
				for (const point of points) {
					index = point.index() * 3;
					current.fromArray(array, index);
					CoreColor.setHSV(current.r, current.g, current.b, target);
					target.toArray(array, index);
				}
			}
		}

		// const colorr_param = this.param('colorr');
		// const colorg_param = this.param('colorg');
		// const colorb_param = this.param('colorb');

		// r
		// if(colorr_param.has_expression()){
		// 	await colorr_param.eval_expression_for_entities(points, (point, value)=>{
		// 		array[point.index()*3+0] = value
		// 	})
		// } else {
		// 	for(let point of points){
		// 		array[point.index()*3+0] = this.pv.color.r
		// 	}
		// }
		// g
		// if(colorg_param.has_expression()){
		// 	await colorg_param.eval_expression_for_entities(points, (point, value)=>{
		// 		array[point.index()*3+1] = value
		// 	})
		// } else {
		// 	for(let point of points){
		// 		array[point.index()*3+1] = this.pv.color.g
		// 	}
		// }
		// b
		// if(colorb_param.has_expression()){
		// 	await colorb_param.eval_expression_for_entities(points, (point, value)=>{
		// 		array[point.index()*3+2] = value
		// 	})
		// } else {
		// 	for(let point of points){
		// 		array[point.index()*3+2] = this.pv.color.b
		// 	}
		// }
	}

	private async _updateFromParam(
		geometry: BufferGeometry,
		array: number[],
		points: BaseCorePoint[],
		offset: number
	): Promise<number[] | undefined> {
		// const component_name = ['r', 'g', 'b'][offset];
		const param = this.p.color.components[offset];
		const paramValue = [this.pv.color.r, this.pv.color.g, this.pv.color.b][offset];
		const arraysByGeometryUUID = [
			this._arrayByGeometryUUID.R,
			this._arrayByGeometryUUID.B,
			this._arrayByGeometryUUID.G,
		][offset];

		let tmpArray: number[] | undefined;
		if (param.hasExpression() && param.expressionController) {
			tmpArray = this._initArrayIfRequired(geometry, arraysByGeometryUUID, points.length);
			if (param.expressionController.entitiesDependent()) {
				await param.expressionController.computeExpressionForPoints(points, (point, value) => {
					// array[point.index()*3+2] = value
					(tmpArray as number[])[point.index()] = value;
				});
			} else {
				for (const point of points) {
					(tmpArray as number[])[point.index()] = param.value;
				}
			}
		} else {
			for (const point of points) {
				array[point.index() * 3 + offset] = paramValue;
			}
		}
		return tmpArray;
	}

	private _initArrayIfRequired(
		geometry: BufferGeometry,
		arraysByGeometryUUID: ValueArrayByName,
		pointsCount: number
	) {
		const uuid = geometry.uuid;
		const currentArray = arraysByGeometryUUID[uuid];
		if (currentArray) {
			// only create new array if we need more point, or as soon as the length is different?
			if (currentArray.length < pointsCount) {
				arraysByGeometryUUID[uuid] = new Array(pointsCount);
			}
		} else {
			arraysByGeometryUUID[uuid] = new Array(pointsCount);
		}
		return arraysByGeometryUUID[uuid];
	}

	private _commitTmpValues(tmpArray: number[], targetArray: number[], offset: number) {
		for (let i = 0; i < tmpArray.length; i++) {
			targetArray[i * 3 + offset] = tmpArray[i];
		}
	}
}

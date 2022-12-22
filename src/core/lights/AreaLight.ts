import {ParamConfig} from '../../engine/nodes/utils/params/ParamsConfig';
import {Constructor, Number3} from '../../types/GlobalTypes';
import {ColorConversion} from '../Color';
import {DefaultOperationParams} from '../operations/_Base';
import {
	Color,
	Group,
	BackSide,
	BufferGeometry,
	Float32BufferAttribute,
	Line,
	LineBasicMaterial,
	Mesh,
	MeshBasicMaterial,
	RectAreaLight,
} from 'three';

export interface AreaLightParams extends DefaultOperationParams {
	color: Color;
	intensity: number;
	width: number;
	height: number;
	showHelper: boolean;
	name: string;
}

export const DEFAULT_AREA_LIGHT_PARAMS: AreaLightParams = {
	color: new Color(1, 1, 1),
	intensity: 1,
	width: 1,
	height: 1,
	showHelper: false,
	name: 'areaLight',
};
const DEFAULT = DEFAULT_AREA_LIGHT_PARAMS;

export function AreaLightParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		light = ParamConfig.FOLDER();
		/** @param light color */
		color = ParamConfig.COLOR(DEFAULT.color.toArray() as Number3, {
			conversion: ColorConversion.SRGB_TO_LINEAR,
		});
		/** @param light intensity */
		intensity = ParamConfig.FLOAT(DEFAULT.intensity, {
			range: [0, 2],
			rangeLocked: [true, false],
		});
		/** @param grid width */
		width = ParamConfig.FLOAT(DEFAULT.width, {
			range: [0, 10],
			rangeLocked: [true, false],
		});
		/** @param grid height */
		height = ParamConfig.FLOAT(DEFAULT.height, {
			range: [0, 10],
			rangeLocked: [true, false],
		});
		// helper
		/** @param toggle on to show helper */
		showHelper = ParamConfig.BOOLEAN(DEFAULT.showHelper);
		/** @param light name */
		name = ParamConfig.STRING('`$OS`');
	};
}

/**
 *  This helper must be added as a child of the light
 */
function createLineGeo() {
	const geometry = new BufferGeometry();
	const positions = [1, 1, 0, -1, 1, 0, -1, -1, 0, 1, -1, 0, 1, 1, 0].map((i) => i * 0.5);
	geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
	geometry.computeBoundingSphere();
	return geometry;
}

function createMeshGeo() {
	const positions = [1, 1, 0, -1, 1, 0, -1, -1, 0, 1, 1, 0, -1, -1, 0, 1, -1, 0].map((i) => i * 0.5);

	const geometry = new BufferGeometry();
	geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
	geometry.computeBoundingSphere();
	return geometry;
}

// inherits from Group and not Line, to ensure that .copy can pass the recursive argument
export class CoreRectAreaLightHelper extends Group {
	public _childMesh = new Mesh(createMeshGeo(), new MeshBasicMaterial({side: BackSide, fog: false}));
	public _childLine = new Line(createLineGeo(), new LineBasicMaterial());

	constructor(public light: RectAreaLight, public readonly nodeName: string) {
		super();

		this.matrixAutoUpdate = false;
		this._childMesh.matrixAutoUpdate = false;
		this._childLine.matrixAutoUpdate = false;

		this.name = `CoreRectAreaLightHelper_${this.nodeName}`;
		this._childMesh.name = `CoreRectAreaLightHelperChildMesh_${this.nodeName}`;
		this._childLine.name = `CoreRectAreaLightHelperChildLine_${this.nodeName}`;

		this.add(this._childMesh);
		this.add(this._childLine);
	}

	update() {
		this.scale.set(1 * this.light.width, 1 * this.light.height, 1);
		this.updateMatrix();

		this._childLine.material.color.copy(this.light.color).multiplyScalar(this.light.intensity);

		// prevent hue shift
		const c = this._childLine.material.color;
		const max = Math.max(c.r, c.g, c.b);
		if (max > 1) c.multiplyScalar(1 / max);

		this._childMesh.material.color.copy(this._childLine.material.color);

		// ignore world scale on light
		this.matrixWorld.extractRotation(this.light.matrixWorld).scale(this.scale).copyPosition(this.light.matrixWorld);

		this._childMesh.matrixWorld.copy(this.matrixWorld);
	}

	override copy(source: this, recursive?: boolean): this {
		super.copy(source, false);

		return this as this;
	}

	dispose() {
		this._childLine.geometry.dispose();
		this._childLine.material.dispose();
		this._childMesh.geometry.dispose();
		this._childMesh.material.dispose();
	}
	override clone(recursive?: boolean): this {
		const cloned = new CoreRectAreaLightHelper(this.light, this.nodeName) as this;
		cloned.updateMatrixWorld();
		cloned.copy(this, false);
		cloned.update();
		return cloned;
	}
}

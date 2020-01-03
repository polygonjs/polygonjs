import lodash_isNumber from 'lodash/isNumber'

import {Vector3} from 'three/src/math/Vector3'
import {Vector2} from 'three/src/math/Vector2'
import {Quaternion} from 'three/src/math/Quaternion'
import {Matrix4} from 'three/src/math/Matrix4'
import {InstancedBufferGeometry} from 'three/src/core/InstancedBufferGeometry'
import {InstancedBufferAttribute} from 'three/src/core/InstancedBufferAttribute'
import {BoxBufferGeometry} from 'three/src/geometries/BoxGeometry'
// const THREE = {BoxBufferGeometry, InstancedBufferAttribute, InstancedBufferGeometry, Matrix4, Quaternion, Vector2, Vector3}

import {CorePoint} from './Point'
// import {Core} from 'src/core/_Module';
import {CoreGroup} from './Group'
import {CoreGeometry} from './Geometry'
import {BufferGeometry} from 'three/src/core/BufferGeometry'

interface MatricesByString {
	[propName: string]: Matrix4
}

const DEFAULT = {
	SCALE: new Vector3(1, 1, 1),
	PSCALE: 1,
	EYE: new Vector3(0, 0, 0),
	UP: new Vector3(0, 1, 0),
}
const SCALE_ATTRIB_NAME = 'scale'
const PSCALE_ATTRIB_NAME = 'pscale'
const NORMAL_ATTRIB_NAME = 'normal'
const UP_ATTRIB_NAME = 'up'
const MATRIX_T = 'translate'
const MATRIX_R = 'rotate'
const MATRIX_S = 'scale'

const DEFAULT_COLOR = new Vector3(1, 1, 1)
const DEFAULT_UV = new Vector2(0, 0)
const ATTRIB_NAME_UV = 'uv'
const ATTRIB_NAME_COLOR = 'color'

export class CoreInstancer {
	private _is_pscale_present: boolean
	private _is_scale_present: boolean
	private _is_normal_present: boolean
	private _is_up_present: boolean
	private _do_rotate_matrices: boolean
	private _matrices: MatricesByString

	constructor(private _group_wrapper: CoreGroup) {
		this._is_pscale_present = this._group_wrapper.has_attrib('pscale')
		this._is_scale_present = this._group_wrapper.has_attrib('scale')

		this._is_normal_present = this._group_wrapper.has_attrib('normal')
		this._is_up_present = this._group_wrapper.has_attrib('up')

		this._do_rotate_matrices = this._is_normal_present //&& this._is_up_present;
	}

	matrices(): Matrix4[] {
		this._matrices = {}
		this._matrices[MATRIX_T] = new Matrix4()
		this._matrices[MATRIX_R] = new Matrix4()
		this._matrices[MATRIX_S] = new Matrix4()

		return this._group_wrapper.points().map((point) => {
			return this._matrix_from_point(point)
		})
	}

	_matrix_from_point(point: CorePoint): Matrix4 {
		const t = point.position()
		//r = new Vector3(0,0,0)
		let scale = this._is_scale_present
			? point.attrib_value(SCALE_ATTRIB_NAME)
			: DEFAULT.SCALE
		const pscale = this._is_pscale_present
			? point.attrib_value(PSCALE_ATTRIB_NAME)
			: DEFAULT.PSCALE
		scale = scale.clone().multiplyScalar(pscale)

		//matrix = #Core.Transform.matrix(t, r, s, scale)
		const matrix = new Matrix4()
		matrix.identity()

		const scale_matrix = this._matrices[MATRIX_S]
		scale_matrix.makeScale(scale.x, scale.y, scale.z)

		const translate_matrix = this._matrices[MATRIX_T]
		translate_matrix.makeTranslation(t.x, t.y, t.z)

		matrix.multiply(translate_matrix)

		if (this._do_rotate_matrices) {
			const rotate_matrix = this._matrices[MATRIX_R]
			const eye = DEFAULT.EYE
			const center = point
				.attrib_value(NORMAL_ATTRIB_NAME)
				.multiplyScalar(-1)
			const up = this._is_up_present
				? point.attrib_value(UP_ATTRIB_NAME)
				: DEFAULT.UP
			up.normalize()
			rotate_matrix.lookAt(eye, center, up)

			matrix.multiply(rotate_matrix)
		}

		matrix.multiply(scale_matrix)

		return matrix
	}

	static create_instance_buffer_geo(
		geometry_to_instance: BufferGeometry,
		template_core_group: CoreGroup,
		attributes_to_copy: string
	) {
		const instance_pts = template_core_group.points()
		// geometry_to_instance = new BoxBufferGeometry( 2, 2, 2 )
		// geometry = new InstancedBufferGeometry()
		// geometry.index = geometry_to_instance.index
		// geometry.attributes.position = geometry_to_instance.attributes.position
		// geometry.attributes.uv = geometry_to_instance.attributes.uv

		const geometry = new InstancedBufferGeometry()
		geometry.copy(geometry_to_instance)

		const instances_count = instance_pts.length
		const positions = new Float32Array(instances_count * 3)
		const colors = new Float32Array(instances_count * 3)
		const scales = new Float32Array(instances_count * 3)
		const orients = new Float32Array(instances_count * 4)

		const has_color = template_core_group.has_attrib(ATTRIB_NAME_COLOR)

		const position = new Vector3(0, 0, 0)
		const quaternion = new Quaternion()
		const scale = new Vector3(1, 1, 1)

		const instancer = new CoreInstancer(template_core_group)
		const instance_matrices = instancer.matrices()

		instance_pts.forEach((instance_pt, i) => {
			const index3 = i * 3
			const index4 = i * 4

			const matrix = instance_matrices[i]
			matrix.decompose(position, quaternion, scale)

			position.toArray(positions, index3)
			quaternion.toArray(orients, index4)
			scale.toArray(scales, index3)

			const color = has_color
				? instance_pt.attrib_value(ATTRIB_NAME_COLOR)
				: DEFAULT_COLOR
			color.toArray(colors, index3)
		})

		// if(this._param_add_uv_offset){
		const has_uv = template_core_group.has_attrib(ATTRIB_NAME_UV)
		if (has_uv) {
			const uvs = new Float32Array(instances_count * 2)
			instance_pts.forEach((instance_pt, i) => {
				const index2 = i * 2
				const uv = has_uv
					? instance_pt.attrib_value(ATTRIB_NAME_UV)
					: DEFAULT_UV
				uv.toArray(uvs, index2)
			})
			geometry.setAttribute(
				'instanceUv',
				new InstancedBufferAttribute(uvs, 2)
			)
		}
		// }

		geometry.setAttribute(
			'instancePosition',
			new InstancedBufferAttribute(positions, 3)
		)
		geometry.setAttribute(
			'instanceScale',
			new InstancedBufferAttribute(scales, 3)
		)
		geometry.setAttribute(
			'instanceOrientation',
			new InstancedBufferAttribute(orients, 4)
		)
		geometry.setAttribute(
			'instanceColor',
			new InstancedBufferAttribute(colors, 3)
		)

		const attrib_names = template_core_group.attrib_names_matching_mask(
			attributes_to_copy
		)

		attrib_names.forEach((attrib_name) => {
			const attrib_size = template_core_group.attrib_size(attrib_name)
			const values = new Float32Array(instances_count * attrib_size)
			instance_pts.forEach((pt, i) => {
				const value = pt.attrib_value(attrib_name)
				if (lodash_isNumber(value)) {
					values[i] = value
				} else {
					value.toArray(values, i * attrib_size)
				}
			})
			geometry.setAttribute(
				attrib_name,
				new InstancedBufferAttribute(values, attrib_size)
			)
		})

		const geometry_wrapper = new CoreGeometry(geometry)
		geometry_wrapper.mark_as_instance()

		return geometry
	}
}

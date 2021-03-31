import {PolyDictionary, Vector2Like} from '../../../types/GlobalTypes';
import {PolyScene} from '../PolyScene';
import {Vector2} from 'three/src/math/Vector2';
import {IUniform} from 'three/src/renderers/shaders/UniformsLib';

type IUniforms = PolyDictionary<IUniform>;
export interface IUniformsWithTime extends IUniforms {
	time: IUniform;
}
export interface IUniformsWithResolution extends IUniforms {
	resolution: {
		value: Vector2Like;
	};
}

export class UniformsController {
	constructor(private scene: PolyScene) {}

	private _time_dependent_uniform_owners: PolyDictionary<IUniformsWithTime> = {}; //new Map()
	private _time_dependent_uniform_owners_ids: string[] | null = null;

	private _resolution: Vector2 = new Vector2(1, 1);
	private _resolution_dependent_uniform_owners: PolyDictionary<IUniformsWithResolution> = {};
	private _resolution_dependent_uniform_owners_ids: string[] = [];

	// time
	addTimeDependentUniformOwner(id: string, uniforms: IUniformsWithTime) {
		this._time_dependent_uniform_owners[id] = uniforms;
		if (!this._time_dependent_uniform_owners_ids) {
			this._time_dependent_uniform_owners_ids = [];
		}
		if (!this._time_dependent_uniform_owners_ids.includes(id)) {
			this._time_dependent_uniform_owners_ids.push(id);
		}
	}
	removeTimeDependentUniformOwner(id: string) {
		delete this._time_dependent_uniform_owners[id];
		if (this._time_dependent_uniform_owners_ids) {
			const index = this._time_dependent_uniform_owners_ids.indexOf(id);
			if (index >= 0) {
				this._time_dependent_uniform_owners_ids.splice(index, 1);
			}
		}
	}
	public updateTimeDependentUniformOwners() {
		const time = this.scene.time();
		if (this._time_dependent_uniform_owners_ids) {
			for (let id of this._time_dependent_uniform_owners_ids) {
				const uniforms = this._time_dependent_uniform_owners[id];
				uniforms.time.value = time;
			}
		}
	}

	// resolution
	addResolutionDependentUniformOwner(id: string, uniforms: IUniformsWithResolution) {
		this._resolution_dependent_uniform_owners[id] = uniforms;
		if (!this._resolution_dependent_uniform_owners_ids) {
			this._resolution_dependent_uniform_owners_ids = [];
		}
		if (!this._resolution_dependent_uniform_owners_ids.includes(id)) {
			this._resolution_dependent_uniform_owners_ids.push(id);
		}

		if (this._resolution) {
			this.updateResolutionDependentUniforms(uniforms);
		}
	}
	removeResolutionDependentUniformOwner(id: string) {
		delete this._resolution_dependent_uniform_owners[id];
		if (this._resolution_dependent_uniform_owners_ids) {
			const index = this._resolution_dependent_uniform_owners_ids.indexOf(id);
			if (index >= 0) {
				this._resolution_dependent_uniform_owners_ids.splice(index, 1);
			}
		}
	}

	updateResolutionDependentUniformOwners(resolution: Vector2) {
		this._resolution.copy(resolution);
		for (let id of this._resolution_dependent_uniform_owners_ids) {
			const uniforms = this._resolution_dependent_uniform_owners[id];
			this.updateResolutionDependentUniforms(uniforms);
		}
	}
	updateResolutionDependentUniforms(uniforms: IUniformsWithResolution) {
		uniforms.resolution.value.x = this._resolution.x; // * window.devicePixelRatio;
		uniforms.resolution.value.y = this._resolution.y; // * window.devicePixelRatio;
	}
}

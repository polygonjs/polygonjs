/**
 * triggers an event when a parameter has changed
 *
 *
 */
import {TypedEventNode} from './_Base';
import {EventConnectionPoint, EventConnectionPointType} from '../utils/io/connections/Event';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CoreGraphNode} from '../../../core/graph/CoreGraphNode';
import {BaseParamType} from '../../params/_Base';
import {RampParam} from '../../params/Ramp';

function previousValueParamOptions() {
	return {
		cook: false,
		hidden: true,
	};
}

class ParamEventParamsConfig extends NodeParamsConfig {
	/** @param set to listen or stop listening to the param */
	active = ParamConfig.BOOLEAN(true);
	/** @param the parameter to update */
	param = ParamConfig.PARAM_PATH('', {
		paramSelection: true,
		computeOnDirty: true,
	});
	boolean = ParamConfig.BOOLEAN(0, previousValueParamOptions());
	integer = ParamConfig.INTEGER(0, previousValueParamOptions());
	float = ParamConfig.FLOAT(0, previousValueParamOptions());
	vector2 = ParamConfig.VECTOR2([0, 0], previousValueParamOptions());
	vector3 = ParamConfig.VECTOR3([0, 0, 0], previousValueParamOptions());
	vector4 = ParamConfig.VECTOR4([0, 0, 0, 0], previousValueParamOptions());
	ramp = ParamConfig.RAMP(RampParam.DEFAULT_VALUE, previousValueParamOptions());
	string = ParamConfig.STRING('', previousValueParamOptions());
}
const ParamsConfig = new ParamEventParamsConfig();

export class ParamEventNode extends TypedEventNode<ParamEventParamsConfig> {
	paramsConfig = ParamsConfig;
	static type(): Readonly<'param'> {
		return 'param';
	}
	static readonly OUTPUT_NAME = 'valueChanged';

	initializeNode() {
		this.io.outputs.setNamedOutputConnectionPoints([
			new EventConnectionPoint(ParamEventNode.OUTPUT_NAME, EventConnectionPointType.BASE),
		]);
		this.scene().dispatchController.onAddListener(() => {
			this.params.onParamsCreated('params_label', () => {
				this.params.label.init([this.p.param]);
			});
		});
	}

	async cook() {
		await this._listenToParam();
		this.cookController.endCook();
	}
	dispose() {
		super.dispose();
		this._reset();
	}
	private _reset() {
		this.__paramCoreGraphNode__?.graphRemove();
	}

	private _resolvedParam: BaseParamType | null = null;
	private _previousValueParam: BaseParamType | null = null;
	private async _listenToParam() {
		if (!this.p.param) {
			// in the current implementation,
			// cook is triggered a first time when the node is created (before the params are created),
			// and therefore _listenToParam.
			// So we need to check that the parameter does exist
			return;
		}
		if (this._resolvedParam) {
			this.__paramCoreGraphNode__?.removeGraphInput(this._resolvedParam);
			this._previousValueParam = null;
		}
		if (this.p.param.isDirty()) {
			// TODO: investigate occasions
			// where the referenced param is recomputed
			// (such as in a material builder)
			// and this node refers to an old param
			await this.p.param.compute();
		}
		this._resolvedParam = this.p.param.value.param();
		if (this._resolvedParam) {
			const previousValueParams = [
				this.p.boolean,
				this.p.integer,
				this.p.float,
				this.p.vector2,
				this.p.vector3,
				this.p.vector4,
				this.p.ramp,
				this.p.string,
			];
			for (let p of previousValueParams) {
				if (p.type() == this._resolvedParam.type()) {
					this._previousValueParam = p;
					await this._resolvedParam.compute();
					this._previousValueParam.copyValue(this._resolvedParam);
				}
			}
			if (!this._previousValueParam) {
				this.states.error.set(
					`param type ${this._resolvedParam.type()} is not supported, availables are: ${previousValueParams
						.map((p) => p.type())
						.join(', ')}`
				);
			}
			this.paramGraphNode().addGraphInput(this._resolvedParam);
		}
	}
	private paramGraphNode() {
		return (this.__paramCoreGraphNode__ = this.__paramCoreGraphNode__ || this._createCoreGraphNode());
	}
	private __paramCoreGraphNode__: CoreGraphNode | undefined;
	private _createCoreGraphNode() {
		const node = new CoreGraphNode(this.scene(), 'event/Param');
		node.dirtyController.addPostDirtyHook('onParamDirty', this._onParamDirtyBound);
		return node;
	}
	private _onParamDirtyBound = this._onParamDirty.bind(this);
	private async _onParamDirty() {
		if (!(this._resolvedParam && this._previousValueParam)) {
			return;
		}
		await this._resolvedParam.compute();
		const valueChanged = !this._resolvedParam.isValueEqual(this._previousValueParam.value);

		if (valueChanged) {
			this._previousValueParam.copyValue(this._resolvedParam);
			this.dispatchEventToOutput(ParamEventNode.OUTPUT_NAME, {});
		}
	}
}

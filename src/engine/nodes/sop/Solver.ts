/**
 * A solver re-uses its output as its input on each frame
 *
 */
import {SubnetSopNodeLike, SopSubnetChildrenDisplayController} from './utils/subnet/ChildrenDisplayController';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {TimeController} from '../../scene/utils/TimeController';
import {CoreGroup} from '../../../core/geometry/Group';
import {DisplayNodeController} from '../utils/DisplayNodeController';

class SolverSopParamsConfig extends NodeParamsConfig {
	startFrame = ParamConfig.INTEGER(TimeController.START_FRAME);
}
const ParamsConfig = new SolverSopParamsConfig();

export class SolverSopNode extends SubnetSopNodeLike<SolverSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'solver';
	}
	private _last_simulated_frame: number | null = null;
	public override readonly childrenDisplayController: SopSubnetChildrenDisplayController =
		new SopSubnetChildrenDisplayController(this, {dependsOnDisplayNode: false});
	public override readonly displayNodeController: DisplayNodeController = new DisplayNodeController(
		this,
		{
			onDisplayNodeRemove: () => {
				// this.node.setDirty();
			},
			onDisplayNodeSet: () => {
				// this.node.setDirty();
			},
			onDisplayNodeUpdate: () => {
				// this.node.setDirty();
			},
		},
		{dependsOnDisplayNode: false}
	);

	override initializeNode() {
		this.io.inputs.setCount(0, 4);
		this.io.inputs.initInputsClonedState(InputCloneMode.NEVER);

		this.addGraphInput(this.scene().timeController.graphNode);
	}

	private _previousFrameCoreGroup: CoreGroup | undefined;
	previousFrameCoreGroup() {
		return this._previousFrameCoreGroup;
	}
	override async cook(input_contents: CoreGroup[]) {
		if (this.pv.startFrame == this.scene().frame()) {
			this._reset();
		}
		this.computeSolverIfRequired();
	}

	private _reset() {
		this._previousFrameCoreGroup = undefined;
		this._last_simulated_frame = null;
	}

	private computeSolverIfRequired() {
		const frame = this.scene().frame();
		const start_frame: number = this.pv.startFrame;
		if (frame >= start_frame) {
			if (this._last_simulated_frame == null) {
				this._last_simulated_frame = start_frame - 1;
			}

			if (frame > this._last_simulated_frame) {
				this._computeSolverMultipleTimes(frame - this._last_simulated_frame);
			}
		}
	}
	private _computeSolverMultipleTimes(iterations_count = 1) {
		for (let i = 0; i < iterations_count; i++) {
			this.computeSolver();
		}
		this._last_simulated_frame = this.scene().frame();
	}
	private async computeSolver() {
		const child_output_node = this.childrenDisplayController.output_node();
		if (child_output_node) {
			const container = await child_output_node.compute();
			const core_content = container.coreContent();
			if (core_content) {
				this._previousFrameCoreGroup = core_content;
				this.setCoreGroup(core_content);
			} else {
				if (child_output_node.states.error.active()) {
					this.states.error.set(child_output_node.states.error.message());
				} else {
					this._previousFrameCoreGroup = undefined;
					this.setObjects([]);
				}
			}
		} else {
			this.states.error.set('no output node found inside subnet');
		}
	}

	isOnFrameStart(): boolean {
		return this.scene().frame() == this.pv.startFrame;
	}
}

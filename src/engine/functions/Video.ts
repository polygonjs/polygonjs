import {dummyReadRefVal} from '../../core/reactivity/CoreReactivity';
import {VideoCopNode} from '../nodes/cop/Video';
import {NodeContext} from '../poly/NodeContext';
import {CopType} from '../poly/registers/nodes/types/Cop';
import {PolyScene} from '../scene/PolyScene';
import {NamedFunction1} from './_Base';

function _getVideoNode(scene: PolyScene, nodePath: string) {
	const node = scene.node(nodePath);
	if (!node) {
		return;
	}
	if (node.context() != NodeContext.COP) {
		return;
	}
	if (node.type() != CopType.VIDEO) {
		return;
	}
	const videoNode = node as VideoCopNode;
	return videoNode;
}

export class getVideoPropertyCurrentTime extends NamedFunction1<[string]> {
	static override type() {
		return 'getVideoPropertyCurrentTime';
	}
	func(nodePath: string): number {
		dummyReadRefVal(this.timeController.timeUniform().value);
		return _getVideoNode(this.scene, nodePath)?.videoCurrentTime() || 0;
	}
}
export class getVideoPropertyDuration extends NamedFunction1<[string]> {
	static override type() {
		return 'getVideoPropertyDuration';
	}
	func(nodePath: string): number {
		dummyReadRefVal(this.timeController.timeUniform().value);
		return _getVideoNode(this.scene, nodePath)?.videoDuration() || 0;
	}
}
export class getVideoPropertyPlaying extends NamedFunction1<[string]> {
	static override type() {
		return 'getVideoPropertyPlaying';
	}
	func(nodePath: string): boolean {
		dummyReadRefVal(this.timeController.timeUniform().value);
		return _getVideoNode(this.scene, nodePath)?.videoStatePlaying() || false;
	}
}
export class getVideoPropertyMuted extends NamedFunction1<[string]> {
	static override type() {
		return 'getVideoPropertyMuted';
	}
	func(nodePath: string): boolean {
		dummyReadRefVal(this.timeController.timeUniform().value);
		return _getVideoNode(this.scene, nodePath)?.videoStateMuted() || false;
	}
}

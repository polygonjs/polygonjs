import {Object3D} from 'three/src/core/Object3D';

export interface ActorProcessor {
	processActor(object: Object3D): void;
}

export class ActorBuilder {
	private _processors: ActorProcessor[] = [];

	addProcessor(processor: ActorProcessor) {
		this._processors.push(processor);
	}
	setActorProcessors(processors: ActorProcessor[]) {
		this._processors = [...processors];
	}
	processors() {
		return this._processors;
	}

	process(object: Object3D) {
		for (let processor of this._processors) {
			processor.processActor(object);
		}
	}

	clone() {
		const newActorBuilder = new ActorBuilder();
		newActorBuilder.setActorProcessors(this.processors());
		return newActorBuilder;
	}
}

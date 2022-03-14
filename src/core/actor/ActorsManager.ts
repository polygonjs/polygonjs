import {Scene} from 'three/src/scenes/Scene';
// import {Object3D} from 'three/src/core/Object3D';
// import {ActorBuilder} from './ActorBuilder';

// export interface Object3DWithActors extends Object3D {
// 	actorsBuilders?: ActorBuilder[];
// }

export class ActorsManager {
	// static assignActorBuilder(object: Object3D, actorBuilder: ActorBuilder) {
	// 	const objectWithActors = object as Object3DWithActors;
	// 	objectWithActors.actorsBuilders = objectWithActors.actorsBuilders || [];
	// 	objectWithActors.actorsBuilders.push(actorBuilder);
	// }

	static tick(scene: Scene) {
		scene.traverse((object) => {
			// const actorsBuilders = (object as Object3DWithActors).actorsBuilders;
			// if (actorsBuilders) {
			// 	for (let actorsBuilder of actorsBuilders) {
			// 		actorsBuilder.process(object);
			// 	}
			// }
		});
	}
}

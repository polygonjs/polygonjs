import {TimelineBuilderProperty} from './TimelineBuilderProperty';
import {Scene} from 'three/src/scenes/Scene';
import gsap from 'gsap';

export class TimelineBuilder {
	private _properties: TimelineBuilderProperty[] = [];

	set_data(object: any) {}

	merge(timeline_builder?: TimelineBuilder) {
		if (!timeline_builder) {
			return;
		}
	}
	copy(timeline_builder: TimelineBuilder) {
		let property: TimelineBuilderProperty;
		while ((property = this._properties[0])) {
			this._properties.pop();
		}
		for (property of timeline_builder.properties()) {
			const new_property = property.clone();
			this._properties.push(new_property);
		}
	}

	add_property(property: TimelineBuilderProperty) {
		this._properties.push(property);
	}
	properties() {
		return this._properties;
	}

	play(scene: Scene) {
		// const object = scene.children[0].children[0];
		// console.log(object);
		const timeline = gsap.timeline();

		for (let property of this._properties) {
			property.add_to_timeline(timeline, scene);
		}
		// // t2.pause();
		// t2.to(object.position, {duration: 1, y: object.position.y + 1, ease: 'power2.out'});
		// t2.to(object.scale, {duration: 1, z: object.scale.z + 1, ease: 'power2.out'}, 0);

		// const t1 = gsap.timeline();
		// t1.to(object.position, {duration: 1, x: object.position.x + 1, ease: 'power2.out'});
		// t1.to(object.rotation, {duration: 1, y: object.rotation.y + Math.PI, ease: 'power2.out'}, 0)
		// const timeline = gsap.timeline({
		// 	onComplete: () => {
		// 		console.log('timeline completed');
		// 	},
		// });
		// timeline.add(t1);
		// timeline.add(t2);
	}
}

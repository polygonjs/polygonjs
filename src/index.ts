// import {PolyScene} from 'src/engine/scene/PolyScene';
// import 'src/engine/poly/registers/All';
// import {ThreejsViewer} from './engine/viewers/Threejs';

// export {PolyScene, ThreejsViewer};

export class Test {
	constructor(num: number) {
		console.log('num', num);
	}
}

// const scene = new PolyScene();
// scene.root.create_node('ambient_light');

// scene.loading_controller.mark_as_loaded();

// const perspective_camera1 = scene.root.create_node('perspective_camera');
// perspective_camera1.p.t.z.set(5);

// const geo1 = scene.root.create_node('geo');
// geo1.flags.display.set(true);
// const box1 = geo1.create_node('box');
// box1.flags.display.set(true);
// geo1.p.r.y.set('$F+20');

// const stylesheet = document.createElement('style');
// stylesheet.innerText = 'html, body, canvas, .canvas_container {height: 100%; margin: 0px;} canvas {display: block;}';
// document.body.appendChild(stylesheet);
// const container = document.createElement('div');
// container.classList.add('canvas_container');
// document.body.appendChild(container);
// new ThreejsViewer(container, scene, perspective_camera1);

// scene.play();

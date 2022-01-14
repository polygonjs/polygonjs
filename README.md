# Polygonjs

[![NPM package][npm]][npm-url]
[![Language Grade][lgtm]][lgtm-url]
[![Twitter][twitter-img]][twitter-url]

Polygonjs is a node-based 3D Webgl engine. [Learn more](https://polygonjs.com/).

![Inside Polygonjs node-based Editor](https://raw.githubusercontent.com/polygonjs/polygonjs-assets/master/demo/media/demo.002.png?v=2)

Install:

`npm install @polygonjs/polygonjs`

or

`yarn add @polygonjs/polygonjs`

You can also load it from the CDN:

`https://unpkg.com/@polygonjs/polygonjs@latest/dist/all.js`.

The API is designed to be very simple. Here is how you create a minimal scene with a box:

```html
<script type="module">
	// import from the CDN
	import {PolyScene} from 'https://unpkg.com/@polygonjs/polygonjs@latest/dist/all.js';
	// or import from the npm module
	// import {PolyScene} from '@polygonjs/polygonjs/dist/src/engine/scene/PolyScene';

	// create a scene
	const scene = new PolyScene();
	const rootNode = scene.root();

	// create a box
	const geo = rootNode.createNode('geo');
	const box = geo.createNode('box');

	// add a light
	rootNode.createNode('hemisphereLight');

	// create a camera
	const perspectiveCamera1 = rootNode.createNode('perspectiveCamera');
	perspectiveCamera1.p.t.set([5, 5, 5]);
	// add OrbitControls
	const events1 = perspectiveCamera1.createNode('eventsNetwork');
	const orbitsControls = events1.createNode('cameraOrbitControls');
	perspectiveCamera1.p.controls.setNode(orbitsControls);

	const element = document.getElementById('app');
	perspectiveCamera1.createViewer({element});
</script>
```

which should give you this (you can try it on [this page](https://polygonjs.com/examples/start.html)):

<a href="https://polygonjs.com/examples/start.html" target="_blank"><img width="512" src="https://raw.githubusercontent.com/polygonjs/polygonjs-assets/master/docs/start.gif" /></a>

Let's now look at an example that demonstrates how powerful a node-based engine can be:

```javascript
import {PolyScene} from 'https://unpkg.com/@polygonjs/polygonjs@latest/dist/all.js';
// create a scene
const scene = new PolyScene();
const rootNode = scene.root();

// create a geo node to add the geometry nodes we will need
const geo = rootNode.createNode('geo');

// create a plane
const plane = geo.createNode('plane');
plane.p.size.set([10, 10]); // make the plane larger

// add noise to the plane
const noise = geo.createNode('noise');
noise.setInput(0, plane);
noise.p.freq.set([0.1, 0.1, 0.1]);
noise.p.amplitude.set(3); // lower the noise amount
noise.p.useNormals.set(1); // have the noise in the direction of the normals

// scatter points on the plane
const scatter = geo.createNode('scatter');
scatter.setInput(0, noise);
scatter.p.pointsCount.set(1000);

// copy boxes on the points
const box = geo.createNode('box');
box.p.size.set(0.1);
const copy = geo.createNode('copy');
copy.setInput(0, box);
copy.setInput(1, scatter);
copy.flags.display.set(true);

// add an hemisphere light and a spotlight
const hemisphereLight = rootNode.createNode('hemisphereLight');
hemisphereLight.p.skyColor.set([0.5, 0.5, 0.5]);
hemisphereLight.p.groundColor.set([0, 0, 0]);

// create a camera
const perspectiveCamera1 = rootNode.createNode('perspectiveCamera');
perspectiveCamera1.p.t.set([5, 5, 5]);
// add OrbitControls
const events1 = perspectiveCamera1.createNode('eventsNetwork');
const orbitsControls = events1.createNode('cameraOrbitControls');
perspectiveCamera1.p.controls.setNode(orbitsControls);

const element = document.getElementById('app');
perspectiveCamera1.createViewer({element);
```

And we can also create some html inputs:

```html
<div>
	<label>Size</label>
	<input id='box-size' type='range' min=0 max=2 step=0.01 value=0.1></input>
</div>
```

and add them some events:

```javascript
document.getElementById('box-size').addEventListener('input', function (event) {
	box.p.size.set([event.target.value, event.target.value]);
});
```

And by updating the parameter size of the box, **every node that depends on it will recook** and update the geometry displayed on screen.

By adding a few more events, we get the following (you can try it on [this page](https://polygonjs.com/examples/start2.html)):

<a href="https://polygonjs.com/examples/start2.html" target="_blank"><img width="512" src="https://raw.githubusercontent.com/polygonjs/polygonjs-assets/master/docs/start2.gif" /></a>

What we've done is essentially create a procedural network, where nodes depend on their inputs. If the inputs update, the dependent nodes will also update accordingly. This allows us to **create complex 3D scenes in no time**.

## Node-based

The nodes are grouped in contexts, each for a specific type of task:

-   [ANIM](https://polygonjs.com/docs/nodes/anim) nodes are to create animations.
-   [AUDIO](https://polygonjs.com/docs/nodes/audio) nodes are to generate and modify audio.
-   [COP](https://polygonjs.com/docs/nodes/cop) nodes can import and update textures.
-   [EVENT](https://polygonjs.com/docs/nodes/event) nodes are to trigger or react to events.
-   [GL](https://polygonjs.com/docs/nodes/gl) nodes help you create GLSL shaders.
-   [MAT](https://polygonjs.com/docs/nodes/mat) nodes are to create materials.
-   [OBJ](https://polygonjs.com/docs/nodes/obj) are to add objects to your scene.
-   [POST](https://polygonjs.com/docs/nodes/post) nodes are to set up post processing.
-   [ROP](https://polygonjs.com/docs/nodes/rop) nodes allow you to set up the renderers.
-   [SOP](https://polygonjs.com/docs/nodes/sop) nodes are to manipulate geometries.

## Plugins

Polygonjs is designed to be extensible. You can create your own plugins to add custom nodes. There are currently 4 official plugins:

-   [Mapbox](https://github.com/polygonjs/polygonjs-plugin-mapbox) to add 3D objects to Mapbox maps.
-   [Occlusion](https://github.com/polygonjs/polygonjs-plugin-occlusion) to calculate occlusion on a geometry and get more pleasant lighting.
-   [Palette](https://github.com/polygonjs/polygonjs-plugin-palette) to add matching colors based on curated palettes.
-   [Physics](https://github.com/polygonjs/polygonjs-plugin-physics) to create and simulate rigid bodies.

<p align="center">
  <a href="https://github.com/polygonjs/polygonjs-plugin-mapbox" target="_blank"><img width="256" src="https://raw.githubusercontent.com/polygonjs/example-plugin-mapbox/main/doc/mapbox_examples.256.jpg" /></a>
  <a href="https://github.com/polygonjs/polygonjs-plugin-occlusion" target="_blank"><img width="256" src="https://raw.githubusercontent.com/polygonjs/example-plugin-occlusion/main/doc/occlusion_examples.256.jpg" /></a>
  <a href="https://github.com/polygonjs/polygonjs-plugin-palette" target="_blank"><img width="256" src="https://raw.githubusercontent.com/polygonjs/example-plugin-palette/main/doc/palette_examples.256.jpg" /></a>
  <a href="https://github.com/polygonjs/polygonjs-plugin-physics" target="_blank"><img width="256" src="https://raw.githubusercontent.com/polygonjs/example-plugin-physics/main/doc/physics_examples.256.jpg" /></a>
</p>

[npm]: https://img.shields.io/npm/v/@polygonjs/polygonjs.svg
[npm-url]: https://www.npmjs.com/package/@polygonjs/polygonjs
[lgtm]: https://img.shields.io/lgtm/grade/javascript/g/polygonjs/polygonjs.svg?label=code%20quality
[lgtm-url]: https://lgtm.com/projects/g/polygonjs/polygonjs/
[twitter-img]: https://img.shields.io/twitter/follow/polygonjs.svg?style=social&label=Follow
[twitter-url]: https://twitter.com/intent/follow?screen_name=polygonjs

## Based on Threejs

Polygonjs is based on the powerful webgl library [Threejs](https://threejs.org/). While Polygonjs offers many nodes for many different types of 3D scenes, there are times where you may want to dig deeper and update the scenes in specific ways.

For this, you can directly access the threejs objects. There are 2 ways to do so:

-   **From the scene**

```javascript
const scene = new PolyScene();
const threejsScene = scene.threejsScene();
```

-   **From any node**

```javascript
const scene = new POLY.PolyScene();
const rootNode = scene.root();
const geo = rootNode.createNode('geo');
const plane = geo.createNode('plane');

// now let's get the content of the plane node
const container = await plane.compute();
// the container is an envelope that contains a coreGroup
const coreGroup = container.coreContent();
// and we can now get an array of THREE.Object3D:
const objects = coreGroup.objects();
// and we can use THREE Api:
const object = objects[0];
object.position.set(0, 1, 0);
object.updateMatrix();
```

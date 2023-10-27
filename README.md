# Polygonjs

[![NPM package][npm]][npm-url]
[![Twitter][twitter-img]][twitter-url]
[![Discord][discord-img]][discord-url]
[![Forum][forum-img]][forum-url]

Polygonjs is a node-based **3D WebGL design tool**.

--- [Home Page](https://polygonjs.com/) --- [Documentation](https://polygonjs.com/docs) --- [Try Demo](https://polygonjs.com/demo) ---

Polygonjs helps creating 3D interactives experiences for the web, **without having to code**.

A 3D scene is built by creating and connecting nodes. This gives you a non-destructive worflow, where you can try different ideas quickly, without fearing of breaking anything.

Polygonjs is also **designed to be extended**. This means that if it does not have a feature you need, you can add it, either by using its API, or by reading in this repository how the existing nodes are implemented and using that as a starting point.

The editor can be used both from the web or locally. The web version is convenient to discover the editor, but the local version is recommended for production, since it has the following advantages:

-   quick access to models and textures on your computer
-   tree shaked exports: It exports only the nodes you use.
-   git integration: Every files is saved as text, either json or javascript.
-   version tracking: It is an npm module, and has its version in package.json just like other dependencies
-   integration to any web project (such as threejs, vuejs, react, vanilla)

![Inside Polygonjs node-based Editor](https://raw.githubusercontent.com/polygonjs/polygonjs-assets/master/demo/media/demo.003.jpg?v=1)

## Start a project:

The easiest way to start a project is by using the cli tool:

`npm create polygonjs@latest`

or

`yarn create polygonjs`

You'll then be able to choose one of the templates for vanilla js, threejs, vuejs, react or react-three-fiber.

## Add to an existing project:

If you already have an npm project, you can easily add it with:

`npm add polygonjs-editor`

or

`yarn add polygonjs-editor`

And you can then start the editor with:

`npm run polygonjs-editor`

or

`yarn polygonjs-editor`

## Node-based

The nodes are grouped in contexts, each for a specific type of task:

-   [ANIM](https://polygonjs.com/docs/nodes/anim) nodes create animations.
-   [AUDIO](https://polygonjs.com/docs/nodes/audio) nodes generate and modify audio.
-   [COP](https://polygonjs.com/docs/nodes/cop) nodes import and update textures.
-   [EVENT](https://polygonjs.com/docs/nodes/event) nodes trigger or react to scene events.
-   [GL](https://polygonjs.com/docs/nodes/gl) nodes create GLSL shaders.
-   [JS](https://polygonjs.com/docs/nodes/js) nodes add state & events to scene objects.
-   [MAT](https://polygonjs.com/docs/nodes/mat) nodes create materials.
-   [OBJ](https://polygonjs.com/docs/nodes/obj) nodes add objects to your scene.
-   [POST](https://polygonjs.com/docs/nodes/post) nodes set up post processing.
-   [ROP](https://polygonjs.com/docs/nodes/rop) nodes set up the renderers.
-   [SOP](https://polygonjs.com/docs/nodes/sop) nodes handle procedural modelling.

## Plugins

Polygonjs is designed to be extensible. You can create your own plugins to add custom nodes. There are currently 4 official plugins:

-   [Mapbox](https://github.com/polygonjs/polygonjs-plugin-mapbox) to add 3D objects to Mapbox maps.
-   [Occlusion](https://github.com/polygonjs/polygonjs-plugin-occlusion) to calculate occlusion on a geometry and get more pleasant lighting.
-   [Mediapipe Facemesh](https://github.com/polygonjs/polygonjs-plugin-mediapipe-facemesh) to track a face from a webcam feed
-   [Physics](https://github.com/polygonjs/polygonjs-plugin-physics) to create and simulate rigid bodies.

<div align="center">
  <a href="https://github.com/polygonjs/plugin-mapbox" target="_blank"><img width="256" src="https://raw.githubusercontent.com/polygonjs/example-plugin-mapbox/main/doc/mapbox_examples.256.jpg" /></a>
  <a href="https://github.com/polygonjs/plugin-occlusion" target="_blank"><img width="256" src="https://raw.githubusercontent.com/polygonjs/example-plugin-occlusion/main/doc/occlusion_examples.256.jpg" /></a>
</div>
<div align="center">
  <a href="https://github.com/polygonjs/plugin-mediapipe-facemesh" target="_blank"><img width="256" src="https://github.com/polygonjs/example-plugin-mediapipe_facemesh/blob/main/public/images/metal.jpg?raw=true" /></a>
  <a href="https://github.com/polygonjs/plugin-physics" target="_blank"><img width="256" src="https://raw.githubusercontent.com/polygonjs/example-plugin-physics/main/doc/physics_examples.256.jpg" /></a>
</div>

[npm]: https://img.shields.io/npm/v/@polygonjs/polygonjs.svg
[npm-url]: https://www.npmjs.com/package/@polygonjs/polygonjs
[lgtm]: https://img.shields.io/lgtm/grade/javascript/g/polygonjs/polygonjs.svg?label=code%20quality
[lgtm-url]: https://lgtm.com/projects/g/polygonjs/polygonjs/
[twitter-img]: https://img.shields.io/twitter/follow/polygonjs.svg?style=social&label=Follow
[twitter-url]: https://twitter.com/polygonjs
[discord-img]: https://img.shields.io/discord/957773366419406888
[discord-url]: https://polygonjs.com/discord
[forum-img]: https://img.shields.io/discourse/status?server=https%3A%2F%2Fforum.polygonjs.com
[forum-url]: https://polygonjs.com/forum

## Based on Threejs

Polygonjs is based on the powerful webgl library [Threejs](https://threejs.org/). While Polygonjs offers many nodes for many different types of 3D scenes, there are times where you may want to dig deeper and update the scenes in specific ways.

For this, you can directly access the threejs objects. There are 2 ways to do so:

-   **From the scene**

```javascript
const scene = new PolyScene(); // this is the polygonjs scene
const threejsScene = scene.threejsScene(); // and it contains the threejs scene
```

-   **From any node**

```javascript
const scene = new PolyScene();
const rootNode = scene.root();
const geo = rootNode.createNode('geo');
const plane = geo.createNode('plane');

// now let's get the content of the plane node
const container = await plane.compute();
// the container is an envelope that contains a coreGroup
const coreGroup = container.coreContent();
// and we can now get an array of THREE.Object3D:
const objects = coreGroup.threejsObjects();
// and we can use threejs API:
const object = objects[0];
object.position.set(0, 1, 0);
object.updateMatrix();
```

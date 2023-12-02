import type {QUnit} from '../../../helpers/QUnit';
import {ThreejsCoreObject} from '../../../../src/core/geometry/modules/three/ThreejsCoreObject';
import {CameraAttribute} from '../../../../src/core/camera/CoreCamera';
import {
	CameraViewerCodePresetName,
	cameraViewerCodeSopPresetRegister,
} from '../../../../examples/presets/sop/CameraViewerCode';
import {RendererUtils} from '../../../helpers/RendererUtils';
import {CoreSleep} from '../../../../src/core/Sleep';

const THREE_VERSION = 158;

export function testenginenodessopCameraViewerCode(qUnit: QUnit) {
	qUnit.test('sop/cameraViewerCode simple', async (assert) => {
		const scene = window.scene;
		const geo1 = window.geo1;
		const perspectiveCamera1 = geo1.createNode('perspectiveCamera');
		perspectiveCamera1.setName('perspectiveCamera_MAIN_WITH_CODE');
		const cameraViewerCode1 = geo1.createNode('cameraViewerCode');
		const presetsCollection = cameraViewerCodeSopPresetRegister.setupFunc(cameraViewerCode1);
		const preset = presetsCollection.getPreset(CameraViewerCodePresetName.COLOR)!;
		assert.ok(preset, 'preset ok');
		const presetEntries = preset.entries();
		for (const entry of presetEntries) {
			(entry.param as any).set(entry.value as unknown as any);
		}

		cameraViewerCode1.setInput(0, perspectiveCamera1);
		cameraViewerCode1.flags.display.set(true);
		const container = await cameraViewerCode1.compute();
		const objects = container.coreContent()!.allObjects()!;
		assert.equal(objects.length, 1);
		const cameraObject = objects[0];

		assert.equal(ThreejsCoreObject.attribValue(cameraObject, CameraAttribute.VIEWER_ID), 'my-viewer');
		assert.equal(
			ThreejsCoreObject.attribValue(cameraObject, CameraAttribute.VIEWER_HTML),
			`<div id='my-viewer'></div>
<div id='color-bars'>
	<div class='color-bar red'></div>
	<div class='color-bar green'></div>
	<div class='color-bar blue'></div>
</div>

<style>
	#my-viewer {
		height: 100%;
	}
	#color-bars {
		position: absolute;
		top: 0px;
		left: 0px;
		width: 100%;
		height: 20px;
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}
	.color-bar {
		height: 100%;
		flex: 1 1 0%;
		display: inline-block;
	}
	.color-bar.red { background-color: red; }
	.color-bar.green { background-color: green; }
	.color-bar.blue { background-color: blue; }
</style>

`
		);

		await CoreSleep.sleep(50);
		const viewer = (await scene.camerasController.createMainViewer({
			autoRender: false,
			cameraMaskOverride: '*/perspectiveCamera_MAIN_WITH_CODE',
		}))!;
		assert.ok(viewer, '_viewer');

		await RendererUtils.withViewer({viewer, mount: true}, async ({viewer, element}) => {
			scene.play();
			await CoreSleep.sleep(500);

			const id = viewer.id();
			assert.equal(
				viewer.domElement()?.innerHTML,
				`<div class="CoreThreejsViewer" style="height: 100%;"><div id="my-viewer"><canvas id="TypedViewer_${id}" data-engine="three.js r${THREE_VERSION}" width="400" height="400" style="display: block; outline: none; width: 100%; height: 100%;"></canvas></div>
<div id="color-bars">
	<div class="color-bar red"></div>
	<div class="color-bar green"></div>
	<div class="color-bar blue"></div>
</div>

<style>
	#my-viewer {
		height: 100%;
	}
	#color-bars {
		position: absolute;
		top: 0px;
		left: 0px;
		width: 100%;
		height: 20px;
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}
	.color-bar {
		height: 100%;
		flex: 1 1 0%;
		display: inline-block;
	}
	.color-bar.red { background-color: red; }
	.color-bar.green { background-color: green; }
	.color-bar.blue { background-color: blue; }
</style>

</div>`
			);
		});
	});
}

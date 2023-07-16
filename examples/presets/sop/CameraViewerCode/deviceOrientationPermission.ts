export const EXAMPLE_DEVICE_ORIENTATION_PERMISSION = `<div id='my-viewer'></div>
<div id='button-container'>
	<button id="startButton">START</button>
</div>

<style>
	#my-viewer {
		height: 100%;
	}
	#button-container {
		position: absolute;
		top: 0px;
		left: 0px;
		width: 100%;
		padding: 20px 20px;
	}
	#startButton {
		width: 100%;
		padding: 10px 10px;
		display: block;
		margin: auto;
		background-color: #eb660d;
		border: 2px solid #dc550c;
		color: white;
		cursor: pointer;
	}
</style>
<script>
	// do not use const so that we don't get 'already declared variables' errors
	// when loading this multiple times
	startButton = document.getElementById('startButton');
	startButton.onclick = function() {
		if (
			window.DeviceOrientationEvent !== undefined &&
			typeof window.DeviceOrientationEvent.requestPermission === 'function'
		) {
			window.DeviceOrientationEvent.requestPermission()
				.then(function (response) {
					if (response == 'granted') {
						scene.play();
					}
				})
				.catch(function (error) {
					// alert('error:"'+error+'"');
				});
		} else {
			scene.play();
		}
		startButton.parentElement.removeChild(startButton);
	}
</script>
`;

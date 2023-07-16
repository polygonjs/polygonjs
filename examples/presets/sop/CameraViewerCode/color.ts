export const EXAMPLE_COLOR = `<div id='my-viewer'></div>
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

`;

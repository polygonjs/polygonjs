export const EXAMPLE_SCROLL = `<div id="main-container">
	<div id="my-viewer"></div>
	<div id="scroll-container">
		<div class="checkpoint-padding orange">padding 1</div>
		<div id="checkpoint1" class="red">#checkpoint1</div>
		<div class="checkpoint-padding green">padding 2</div>
		<div id="checkpoint2" class="green">#checkpoint2</div>
		<div class="checkpoint-padding purple">padding 3</div>
		<div id="checkpoint3" class="teal">#checkpoint3</div>
		<div class="checkpoint-padding yellow">padding 4</div>
		<div id="checkpoint4" class="lightgreen">#checkpoint4</div>
		<div class="checkpoint-padding red">padding 5</div>
	</div>
</div>

<style>
	#main-container {
		position: relative;
		height: 100%;
		background-color: rgb(0, 255, 0);
	}
	#my-viewer {
		position: absolute;
		width: 100%;
		height: 100%;
	}
	#scroll-container {
		position: relative;
		height: 100%;
		overflow-y: scroll;
	}
	.checkpoint-padding {
		pointer-events: none;
		height: 120vh;
		color: orange;
		border: 4px solid transparent;
	}
	.checkpoint {
		pointer-events: none;
		height: 120vh;
		color: white;
		border: 4px solid transparent;
	}
	.orange { border-color: orange; }
	.red { border-color: red; }
	.green { border-color: green; }
	.blue { border-color: blue; }
	.purple { border-color: purple; }
	.teal { border-color: teal; }
	.yellow { border-color: yellow; }
	.lightgreen { border-color: lightgreen; }
</style>
`;

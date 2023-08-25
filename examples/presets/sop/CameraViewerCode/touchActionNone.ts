/**
 * this is necessary for the js/onObjectSwipe nodes to work
 */
export const EXAMPLE_TOUCH_ACTION_NONE = `
<div id="my-viewer"></div>

<style>
	#my-viewer {
		position: absolute;
		width: 100%;
		height: 100%;
		touch-action: none;
	}
</style>
`;

import {CSSOptions, HTMLOptions, JSOptions} from './_Base';

const CSS = (options: CSSOptions) => `
/* POSTER */
#polygonjs-loading-poster {
	position: absolute;
	top: 0px;
	left: 0px;
	height: 100%;
	width: 100%;
}
#polygonjs-loading-poster {
	pointer-events: none;
	background: url('${options.posterUrl}') no-repeat center center;
	-webkit-background-size: cover;
	-moz-background-size: cover;
	-o-background-size: cover;
	background-size: cover;
	opacity: 1;
	transition: opacity 0.8s ease-in-out;
	-webkit-transition: opacity 0.8s ease-in-out;
	-moz-transition: opacity 0.8s ease-in-out;
	-ms-transition: opacity 0.8s ease-in-out;
	-o-transition: opacity 0.8s ease-in-out;
}
#polygonjs-loading-poster.fade-out {
	opacity: 0;
}

/* PROGRESS BAR */
.polygonjs-progress-bar-container {
	position: absolute;
	top: 0px;
	left: 0px;
	width: 100%;
	height: 8px;
	pointer-events: none;
}
.polygonjs-progress-bar-container .polygonjs-progress-bar {
	height: 100%;
	width: 0%;
	animation-name: progress-bar-color;
	animation-duration: 4s;
	animation-iteration-count: infinite;
}
.fadeable {
	opacity: 1;
	transition: opacity 0.5s ease-in-out;
}
.visible {
	opacity: 1;
}
.hidden {
	opacity: 0;
}

@keyframes progress-bar-color {
	0% {
		background-color: rgb(115, 214, 115);
	}
	50% {
		background-color: rgb(60, 60, 211);
	}
	100% {
		background-color: rgb(115, 214, 115);
	}
}
`;

const HTML = (options: HTMLOptions) => `
<div id="polygonjs-loading-poster"></div>
<div id="polygonjs-progress-bar-container" class="polygonjs-progress-bar-container fadeable">
	<div id="polygonjs-progress-bar" class="polygonjs-progress-bar"></div>
</div>
`;

const JS = (options: JSOptions) => `
const container = document.getElementById('polygonjs-progress-bar-container');
const barElement = document.getElementById('polygonjs-progress-bar');
const poster = document.getElementById('polygonjs-loading-poster');
export function onProgress(ratio) {
	if (!(barElement && container && poster)) {
		console.log('progress bar elements missing', barElement, container, poster);
		return;
	}
	if (ratio < 1) {
		const percent = Math.round(ratio * 100) + '%'
		barElement.style.width = percent;
	} else {
		// when we reach 1, we can remove the progress bar and fade out the poster
		if (container.parentElement) {
			container.parentElement.removeChild(container);
		}
		if (poster) {
			poster.classList.add('fade-out');
			setTimeout(() => {
				if (poster.parentElement) {
					poster.parentElement.removeChild(poster);
				}
			}, 1200);
		}
	}
}
`;

import {BaseProgressBar} from './_Base';
export class ProgressBarTop extends BaseProgressBar {
	constructor() {
		super({HTML, CSS, JS});
	}
}

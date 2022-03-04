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
#polygonjs-progress-bar-container {
	position: absolute;
	top: 0px;
	left: 0px;
	width: 100%;
	height: 100%;
	text-align: center;
	opacity: 1;
	transition: opacity 0.8s ease-in-out;
	-webkit-transition: opacity 0.8s ease-in-out;
	-moz-transition: opacity 0.8s ease-in-out;
	-ms-transition: opacity 0.8s ease-in-out;
	-o-transition: opacity 0.8s ease-in-out;
}
#polygonjs-progress-bar-container.hidden {
	opacity: 0;
}
#polygonjs-progress-bar-overlay {
	position: absolute;
	top: 0px;
	left: 0px;
	width: 100%;
	height: 100%;
	background-color: #eee;
	opacity: 0.5;
}
#polygonjs-progress-bar-and-label {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translateX(-50%) translateY(-50%);
	width: 200px;
	margin: auto;
}
#polygonjs-progress-bar-label {
	color: #111;
	padding-bottom: 10px;
}
#polygonjs-progress-bar {
	width: 100%;
	height: 10px;
	border: 1px solid #111;
	padding: 2px;
	border-radius: 5px;
}
#polygonjs-progress {
	width: 0%;
	background-color: green;
	height: 100%;
}
`;

const HTML = (options: HTMLOptions) => `
<div id="polygonjs-loading-poster"></div>
<div id="polygonjs-progress-bar-container">
	<div id="polygonjs-progress-bar-overlay"></div>
	<div id="polygonjs-progress-bar-and-label">
		<div id="polygonjs-progress-bar-label">0%</div>
		<div id="polygonjs-progress-bar">
			<div id="polygonjs-progress"></div>
		</div>
	</div>
</div>
`;

const JS = (options: JSOptions) => `
const poster = document.getElementById('polygonjs-loading-poster');
const container = document.getElementById('polygonjs-progress-bar-container');
const mainElement = document.getElementById('polygonjs-progress');
const barElement = document.getElementById('polygonjs-progress-bar-label');
export function updateProgressBarCenterWithPercent(ratio: progress) {
	if (!(mainElement && barElement && container && poster)) {
		console.log('progress bar elements missing');
		return;
	}
	if (progress < 1) {
		const percent = Math.round(progress * 100) + '%';
		mainElement.style.width = percent;
		barElement.innerText = percent;
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
export class ProgressBarCenterWithPercent extends BaseProgressBar {
	constructor() {
		super({HTML, CSS, JS});
	}
}

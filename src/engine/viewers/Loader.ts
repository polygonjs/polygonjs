export class ViewerLoader {
	private _el: HTMLElement

	constructor(private _parent: HTMLElement) {
		if (window.POLY.viewer_loaders_manager().viewers_required()) {
			this.build()
			this._parent.appendChild(this._el)
			window.POLY.viewer_loaders_manager().register_loader(this)
		}
	}
	using_activedesign(): boolean {
		// COMMENT NEXT LINE WHEN EXPORTING
		return false
		return true
	}

	dispose() {
		// do remove the element after the css transition has completed
		this._el.classList.remove('visible')
		this._el.classList.add('hidden')
		setTimeout(() => {
			this._parent.removeChild(this._el)
		}, 250)
	}

	build() {
		this._el = document.createElement('div')
		this._el.classList.add('ViewerLoader')
		this._el.classList.add('text-center')
		this._el.classList.add('visible')

		const svg_container = document.createElement('span')
		svg_container.classList.add('svg_container')

		svg_container.innerHTML = `
		<svg height="64" width="64">
			<circle cx="32" cy="32" r="29" stroke-width="5" fill="none">
		<svg/>
		`

		// const svg = document.createElement('svg')
		// svg.style.height = '64px'
		// svg.style.width = '64px'
		// const circle = document.createElement('circle')
		// circle.style.height = '64px'
		// circle.style.width = '64px'
		// circle.setAttribute('cx', '32')
		// circle.setAttribute('cy', '32')
		// circle.setAttribute('r', '29')
		// circle.setAttribute('stroke-width', '5')
		// circle.setAttribute('fill', 'none')

		if (!this.using_activedesign()) {
			const img = document.createElement('img')
			img.classList.add('img_loader')
			img.src = this._img_url()
			this._el.appendChild(img)
		}

		this._el.appendChild(svg_container)
		// svg_container.appendChild(svg)
		// svg.appendChild(circle)
	}
	_img_url() {
		return `/images/icon.256.png?${Date.now()}`
	}
}

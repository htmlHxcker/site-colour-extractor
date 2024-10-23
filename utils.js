function isLightColor(color) {
	const rgb = color.match(/\d+/g);
	if (!rgb) return false;
	const luminance = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;
	return luminance > 0.5;
}

function rgbToHex(rgb) {
	const values = rgb.match(/\d+/g);
	if (!values) return rgb;

	const r = parseInt(values[0]);
	const g = parseInt(values[1]);
	const b = parseInt(values[2]);

	return `#${r.toString(16).padStart(2, '0')}${g
		.toString(16)
		.padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function rgbToHsl(rgb) {
	const values = rgb.match(/\d+/g);
	if (!values) return rgb;

	let r = parseInt(values[0]) / 255;
	let g = parseInt(values[1]) / 255;
	let b = parseInt(values[2]) / 255;

	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	let h,
		s,
		l = (max + min) / 2;

	if (max === min) {
		h = s = 0;
	} else {
		const d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

		switch (max) {
			case r:
				h = (g - b) / d + (g < b ? 6 : 0);
				break;
			case g:
				h = (b - r) / d + 2;
				break;
			case b:
				h = (r - g) / d + 4;
				break;
		}
		h /= 6;
	}

	return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(
		l * 100
	)}%)`;
}

async function getColorDetails(color) {
	const hexColor = rgbToHex(color).replace('#', '');
	const response = await fetch(
		`https://www.thecolorapi.com/id?hex=${hexColor}`
	);
	return response.json();
}

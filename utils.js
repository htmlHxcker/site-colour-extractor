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

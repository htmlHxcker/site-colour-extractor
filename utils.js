function isLightColor(color) {
	const rgb = color.match(/\d+/g);
	if (!rgb) return false;
	const luminance = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;
	return luminance > 0.5;
}

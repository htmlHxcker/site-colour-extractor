async function initialize() {
	const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
	console.log('Current tab:', tab);

	chrome.scripting
		.executeScript({
			target: { tabId: tab.id },

			func: extractColors,
			world: 'MAIN',
		})
		.then((results) => {
			console.log('Extraction results:', results);
			if (results && results[0] && results[0].result) {
				chrome.storage.local.set({ colorData: results[0].result });
				displayColors(results);
			}
		});
}

function extractColors() {
	console.log('Starting color extraction');
	const elements = document.querySelectorAll('*');
	console.log('Found elements:', elements.length);

	const colorMap = new Map();

	function updateColorCount(map, color, type) {
		if (!map.has(color)) {
			map.set(color, { count: 0, types: new Set() });
		}
		const data = map.get(color);
		data.count++;
		data.types.add(type);
	}

	elements.forEach((element) => {
		const styles = window.getComputedStyle(element);
		const bgColor = styles.backgroundColor;
		const textColor = styles.color;

		if (bgColor !== 'transparent' && bgColor !== 'rgba(0, 0, 0, 0)') {
			updateColorCount(colorMap, bgColor, 'background');
		}
		if (textColor !== 'transparent' && textColor !== 'rgba(0, 0, 0, 0)') {
			updateColorCount(colorMap, textColor, 'text');
		}
	});

	const sortedColors = Array.from(colorMap.entries()).sort(
		(a, b) => b[1].count - a[1].count
	);
	console.log('Sorted colors:', sortedColors);
	return sortedColors;
}
function updateColorCount(map, color, type) {
	if (!map.has(color)) {
		map.set(color, { count: 0, types: new Set() });
	}
	const data = map.get(color);
	data.count++;
	data.types.add(type);
}

function displayColors(results) {
	const palette = document.getElementById('colorPalette');
	palette.innerHTML = '';

	if (!results || !results[0] || !results[0].result) {
		return;
	}

	const colors = results[0].result.slice(0, 5); // Only take top 5 colors
	colors.forEach(([color, data]) => {
		const colorBar = document.createElement('div');
		colorBar.className = 'color-bar';
		colorBar.style.backgroundColor = color;

		const hexValue = document.createElement('div');
		hexValue.className = 'color-hex';
		// Set text color to black for light colors
		hexValue.style.color = isLightColor(color) ? 'black' : 'white';
		hexValue.textContent = rgbToHex(color);

		colorBar.appendChild(hexValue);
		palette.appendChild(colorBar);
	});
}

function isLightColor(color) {
	const rgb = color.match(/\d+/g);
	if (!rgb) return false;
	// Calculate relative luminance
	const luminance = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;
	return luminance > 0.5;
}
document.getElementById('showDetailedReport').addEventListener('click', () => {
	chrome.tabs.create({ url: 'report.html' });
});

function rgbToHex(rgb) {
	// Convert RGB to Hex implementation
	return rgb; // Placeholder
}

// Initialize on popup load
document.addEventListener('DOMContentLoaded', initialize);

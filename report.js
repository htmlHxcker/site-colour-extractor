let colorData = [];

document.getElementById('sortOrder').addEventListener('change', (e) => {
	sortAndDisplayColors(e.target.value);
});

async function initialize() {
	chrome.storage.local.get(['colorData'], (result) => {
		colorData = result.colorData || [];
		sortAndDisplayColors('most-used');
	});
}

function sortAndDisplayColors(sortType) {
	let sortedColors = [...colorData];

	switch (sortType) {
		case 'least-used':
			sortedColors.reverse();
			break;
		case 'background':
			sortedColors = sortedColors.filter(([_, data]) =>
				data.types.has('background')
			);
			break;
		case 'text':
			sortedColors = sortedColors.filter(([_, data]) => data.types.has('text'));
			break;
	}

	displayColorGrid(sortedColors);
}

function displayColorGrid(colors) {
	const grid = document.getElementById('colorGrid');
	grid.innerHTML = '';

	colors.forEach(([color, data]) => {
		const colorItem = document.createElement('div');
		colorItem.className = 'color-item';
		colorItem.style.backgroundColor = color;
		colorItem.addEventListener('click', () => showColorDetails(color));
		grid.appendChild(colorItem);
	});
}

function showColorDetails(color) {
	const details = document.getElementById('colorDetails');
	const preview = details.querySelector('.color-preview');
	const info = details.querySelector('.color-info');

	preview.style.backgroundColor = color;

	info.innerHTML = `
    <div>
      <h3>HEX</h3>
      <p>${rgbToHex(color)}</p>
    </div>
    <div>
      <h3>RGB</h3>
      <p>${color}</p>
    </div>
    <div>
      <h3>HSL</h3>
      <p>${rgbToHsl(color)}</p>
    </div>
    <div>
      <h3>Name</h3>
      <p>${getColorName(color)}</p>
    </div>
  `;

	details.classList.add('active');
}

// Helper functions for color conversions
function rgbToHex(rgb) {
	// Implementation
}

function rgbToHsl(rgb) {
	// Implementation
}

function getColorName(rgb) {
	// Implementation using a color naming library or API
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initialize);

function extractColors() {
	const elements = document.querySelectorAll('*');
	const colorMap = new Map();

	elements.forEach((element) => {
		const styles = window.getComputedStyle(element);
		updateColorCount(colorMap, styles.backgroundColor, 'background');
		updateColorCount(colorMap, styles.color, 'text');
	});

	return Array.from(colorMap.entries())
		.filter(
			([color]) => color !== 'transparent' && color !== 'rgba(0, 0, 0, 0)'
		)
		.sort((a, b) => b[1].count - a[1].count);
}

function updateColorCount(map, color, type) {
	if (!map.has(color)) {
		map.set(color, { count: 0, types: new Set() });
	}
	const data = map.get(color);
	data.count++;
	data.types.add(type);
}

export default function Path(d) {
	if (!(this instanceof Path)) {
		return new Path(d);
	}

	if (Array.isArray(d)) {
		this.points = d;
	} else {
		this.points = d.trim()
			.split(/\s*(?=[A-Z])/i)
			.map((pointString) => {
				return pointString.trim()
				// These two replaces are to simplify the split regex
					.replace(/([^, ])-/g, '$1,-')
					.replace(/([a-z])(?![,])/gi, '$1 ')
					.split(/[\s,]+/)
					.map((coord, i) => (i === 0 ? coord : Number(coord)));
			})
			.map((pointArray, i, allPoints) => {
				// This is done in a separate map so that lastPoint is parsed point
				const command = pointArray[0];

				if (i === 0 || command.toUpperCase() === command) {
					return pointArray;
				}

				const prev = allPoints[i - 1];

				pointArray[0] = pointArray[0].toUpperCase();

				pointArray.slice(1).forEach((num, i) => {
					pointArray[i + 1] += prev[prev.length - (i % 2 === 0 ? 2 : 1)];
				});

				return pointArray;
			});

		this._originalPath = d;
	}
}

Path.prototype.reverse = function reversePath() {
	// convert all curves to C
	const points = this.points.map((num, i) => {
		if (num[0] === 'M' || num[0] === 'L' || num[0] === 'C') {
			return num.slice();
		}

		if (num[0] === 'S') {
			return sToC(num, this.points[i - 1]);
		}

		throw new Error('Reversing paths with that in is not yet supported, sorry');
	});

	// Reverse
	const reversedPoints = [
		['M', ...points[points.length - 1].splice(-2, 2)]
	];

	// Don't hit 0: that'll just equal 'M'
	for (let i = points.length - 1; i >= 1; i--) {
		// reverse arguments
		const oldPoint = points[i];
		const newPoint = [oldPoint[0]];

		for (let j = oldPoint.length - 2; j > 0; j -= 2) {
			newPoint.push(...oldPoint.slice(j, j + 2));
		}

		// grab coordinates from prev
		newPoint.push(...points[i - 1].splice(-2, 2));

		reversedPoints.push(newPoint);
	}

	return new Path(reversedPoints);
};

Path.prototype.d = function getPathString(options) {
	options = Object.assign({
		type: 'relative',
	}, options);

	return this.points
		.map((point, i, allPoints) => {
			if (i === 0 || options.type === 'absolute') {
				return point[0] + point.slice(1).map(toImpreciseString).join(',');
			}

			const prev = allPoints[i - 1];

			return point[0].toLowerCase() + point.slice(1).map((num, j) => {
					return toImpreciseString(num - prev[prev.length - (j % 2 === 0 ? 2 : 1)]);
				}).join(',');
		})
		.join('');
};

function toImpreciseString(num) {
	return num.toFixed(1).replace('.0', '');
}

Path.prototype.toString = Path.prototype.d;

Path.scale = function initPathScale(pathStrings, options) {
	options = Object.assign({
		loop: false, // start from 0 when loop gets above 1?
	}, options);

	const paths = pathStrings.map((str) => str instanceof Path ? str : new Path(str));

	// Check that what we're trying to do is actually possible with this lib
	paths.slice(1).forEach((path) => {
		if (path.points.length !== paths[0].points.length) {
			throw new Error('Both paths have to be the same length, sorry');
		}

		path.points.forEach(([command], i) => {
			if (!mixable(command, paths[0].points[i][0])) {
				throw new Error('Command types have to match, sorry');
			}
		});
	});

	if (options.loop) {
		paths.push(paths[0]);
	}

	const sectionSize = 1 / (paths.length - 1);

	return function pathScale(x) {
		if (options.loop) {
			x %= 1;
		}

		// Calculate which two paths to mix, and how much to actually mix them by
		const index = Math.floor(x / sectionSize);
		const realX = (x % sectionSize) / sectionSize;

		// If x lands on a path, just return the path
		if (realX < Number.EPSILON || index + 1 === paths.length) {
			return paths[index];
		}

		return Path.mix(paths[index], paths[index + 1], realX);
	};
};

Path.mix = function mixPaths(a, b, x = 0.5) {
	if (!(a instanceof Path)) {
		return Path.mix(new Path(a), b, x);
	}

	if (!(b instanceof Path)) {
		return Path.mix(a, new Path(b), x);
	}

	if (a.points.length !== b.points.length) {
		throw new Error('Both paths have to be the same length, sorry');
	}

	// Mix the two lines by mixing the individual points together
	const newPoints = a.points.map((aPoint, i) => mixPoints(a, b, i, x));

	return new Path(newPoints);
};

Path.reverse = function reversePath(path) {
	return new Path(path).reverse().d();
};

function mixPoints(a, b, i, x) {
	let aPoints = a.points[i];
	let bPoints = b.points[i];

	if (aPoints[0] === 'S' && bPoints[0] === 'C') {
		aPoints = sToC(aPoints, a.points[i - 1]);
	} else if (bPoints[0] === 'S' && aPoints[0] === 'C') {
		bPoints = sToC(bPoints, b.points[i - 1]);
	}

	if (aPoints[0] === bPoints[0]) {
		const newPoints = aPoints.slice(1).map((num, j) => num * (1 - x) + bPoints[j + 1] * x);
		return [aPoints[0], ...newPoints];
	}

	throw new Error('Mixing those command types isn\'t supported, sorry');
}

function sToC(points, prev) {
	let x1, y1;

	if (prev[0] === 'C' || prev[0] === 'S') {
		x1 = prev[prev.length - 2] * 2 - prev[prev.length - 4];
		y1 = prev[prev.length - 1] * 2 - prev[prev.length - 3];
	} else {
		x1 = prev[prev.length - 1];
		y1 = prev[prev.length - 2];
	}

	return ['C', x1, y1, ...points.slice(1)];
}

function mixable(a, b) {
	if (a === b) {
		return true;
	}

	if (a === 'C' && b === 'S') {
		return true;
	}

	if (a === 'S' && b === 'C') {
		return true;
	}

	return false;
}
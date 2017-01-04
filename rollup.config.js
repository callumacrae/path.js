import babel from 'rollup-plugin-babel';

export default {
	entry: 'src/path.js',
	dest: 'dist/path.js',
	sourceMap: true,
	plugins: [
		babel({
			presets: ['es2015-rollup'],
			babelrc: false
		})
	],
	format: 'umd',
	moduleName: 'Path'
};
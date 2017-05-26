import test from 'ava';
import Path from './dist/path';

test('Path constructor', (t) => {
	const path0 = new Path('M 100 200 L 300 400');
	t.is(path0.d(), 'M100,200l200,200');

	const path1 = new Path(' M -20 20.5l 10,400');
	t.is(path1.d(), 'M-20,20.5l10,400');

	const path2 = new Path('M7,-1l1-.5');
	t.is(path2.toString(), 'M7,-1l1,-0.5');

	t.pass();
});

test('path function', (t) => {
	const path0 = Path('M 100 200 L 300 400');
	t.is(path0.d(), 'M100,200l200,200');

	t.pass();
});

test('simple scales', (t) => {
	const pathScale0 = Path.scale(['M 100 100 L 200 200', 'M 200 100 L 100 200']);

	t.is(typeof pathScale0, 'function');
	t.is(pathScale0(0).toString(), 'M100,100l100,100');
	t.is(pathScale0(0.25).toString(), 'M125,100l50,100');
	t.is(pathScale0(0.5).toString(), 'M150,100l0,100');
	t.is(pathScale0(0.75).toString(), 'M175,100l-50,100');
	t.is(pathScale0(1).toString(), 'M200,100l-100,100');
	t.is(pathScale0(1.5).toString(), 'M200,100l-100,100');

	t.pass();
});

test('complex scales', (t) => {
	const pathScale0 = Path.scale([
		'M90.7,181.3c0,0,48.4-23.7,72.1,19',
		'M100.7,181.3c0,0,24.2,32.3-19,47.3',
		'M100.7,181.3c0,0,17,30-40,38.3',
		'M100.7,181.3c0,0-6.9,39.7-47.5,18.6'
	]);

	t.is(typeof pathScale0, 'function');
	t.is(pathScale0(0).toString(), 'M90.7,181.3c0,0,48.4,-23.7,72.1,19');
	t.is(pathScale0(0.5).toString(), 'M100.7,181.3c0,0,20.6,31.2,-29.5,42.8');
	t.is(pathScale0(0.75).toString(), 'M100.7,181.3c0,0,11,32.4,-41.9,33.4');
	t.is(pathScale0(1).toString(), 'M100.7,181.3c0,0,-6.9,39.7,-47.5,18.6');

	t.pass();
});

test('scale looping', (t) => {
	const pathScale0 = Path.scale([
		'M90.7,181.3c0,0,48.4-23.7,72.1,19',
		'M100.7,181.3c0,0,24.2,32.3-19,47.3',
		'M100.7,181.3c0,0,17,30-40,38.3',
		'M100.7,181.3c0,0-6.9,39.7-47.5,18.6'
	], { loop: true });

	t.is(typeof pathScale0, 'function');
	t.is(pathScale0(0).toString(), 'M90.7,181.3c0,0,48.4,-23.7,72.1,19');
	t.is(pathScale0(0.25).toString(), 'M100.7,181.3c0,0,24.2,32.3,-19,47.3');
	t.is(pathScale0(0.5).toString(), 'M100.7,181.3c0,0,17,30,-40,38.3');
	t.is(pathScale0(0.75).toString(), 'M100.7,181.3c0,0,-6.9,39.7,-47.5,18.6');
	t.is(pathScale0(1).toString(), 'M90.7,181.3c0,0,48.4,-23.7,72.1,19');
	t.is(pathScale0(1.25).toString(), 'M100.7,181.3c0,0,24.2,32.3,-19,47.3');
	t.is(pathScale0(100.75).toString(), 'M100.7,181.3c0,0,-6.9,39.7,-47.5,18.6');
	t.is(pathScale0(100.85).toString(), 'M96.7,181.3c0,0,15.2,14.3,0.3,18.8');

	t.pass();
});

test('Path.mix()', (t) => {
	const a = 'M 100 100 L 200 200';
	const b = 'M 200 100 L 100 200';

	t.is(Path.mix(a, b, 0).toString(), 'M100,100l100,100');
	t.is(Path.mix(a, b, 0.25).toString(), 'M125,100l50,100');
	t.is(Path.mix(a, b, 0.5).toString(), 'M150,100l0,100');
	t.is(Path.mix(a, b, 0.75).toString(), 'M175,100l-50,100');
	t.is(Path.mix(a, b, 1).toString(), 'M200,100l-100,100');

	t.pass();
});

test('Path.mix() default x value of 0.5', (t) => {
	const a = 'M 100 100 L 200 200';
	const b = 'M 200 100 L 100 200';

	t.is(Path.mix(a, b).toString(), 'M150,100l0,100');

	t.pass();
});

test('Path.mix() should support mixing S and C after S and C', (t) => {
	const a = 'M 0 0 C 10 10, 20 -10, 30 0 S 50 -10, 60 0';
	const b = 'M 0 0 C 10 10, 20 -10, 30 0 C 40 -10, 50 10, 60 0';

	t.is(Path.mix(a, b, 0).toString(), 'M0,0c10,10,20,-10,30,0c10,10,20,-10,30,0');
	t.is(Path.mix(a, b, 0.25).toString(), 'M0,0c10,10,20,-10,30,0c10,5,20,-5,30,0');
	t.is(Path.mix(a, b, 0.5).toString(), 'M0,0c10,10,20,-10,30,0c10,0,20,0,30,0');
	t.is(Path.mix(a, b, 0.75).toString(), 'M0,0c10,10,20,-10,30,0c10,-5,20,5,30,0');
	t.is(Path.mix(a, b, 1).toString(), 'M0,0c10,10,20,-10,30,0c10,-10,20,10,30,0');

	t.is(Path.mix(b, a, 0.25).toString(), 'M0,0c10,10,20,-10,30,0c10,-5,20,5,30,0');
	t.is(Path.mix(b, a, 0.75).toString(), 'M0,0c10,10,20,-10,30,0c10,5,20,-5,30,0');

	t.pass();
});

test('Path.mix() should support mixing S and C after M', (t) => {
	const a = 'M 0 0 S 50 -10, 60 0';
	const b = 'M 0 0 C 40 -10, 50 10, 60 0';

	t.is(Path.mix(a, b, 0).toString(), 'M0,0c0,0,50,-10,60,0');
	t.is(Path.mix(a, b, 0.25).toString(), 'M0,0c10,-2.5,50,-5,60,0');
	t.is(Path.mix(a, b, 0.5).toString(), 'M0,0c20,-5,50,0,60,0');
	t.is(Path.mix(a, b, 0.75).toString(), 'M0,0c30,-7.5,50,5,60,0');
	t.is(Path.mix(a, b, 1).toString(), 'M0,0c40,-10,50,10,60,0');

	t.pass();
});

test('Path.scale() should support mixing S and C after M', (t) => {
	const pathScale = Path.scale([
		'M258,351c-44-9-67-43-36-60',
		'M270,340s-93-4-54-50'
	]);

	t.is(typeof pathScale, 'function');
	t.is(pathScale(0).toString(), 'M258,351c-44,-9,-67,-43,-36,-60');
	t.is(pathScale(0.5).toString(), 'M264,345.5c13,-39.5,-80,-23.5,-45,-55');
	t.is(pathScale(1).toString(), 'M270,340s-93,-4,-54,-50');

	t.pass();
});

test('path.reverse()', (t) => {
	const path0 = new Path('M 100 200 L 300 400');

	t.is(path0.reverse().toString(), 'M300,400l-200,-200');
	t.is(path0.toString(), 'M100,200l200,200'); // should have left original alone

	t.pass();
});

test('Path.reverse()', (t) => {
	t.is(Path.reverse('M 100 200 L 300 400'), 'M300,400l-200,-200');

	t.is(Path.reverse('M0,0c40,-10,50,10,60,0'), 'M60,0c-10,10,-20,-10,-60,0');
	t.is(Path.reverse('M 0 0 S 50 -10, 60 0'), 'M60,0c-10,-10,-60,0,-60,0');
	t.is(Path.reverse('M 0 0 S 50 -10, 60 0c40,-10,50,10,60,0'), 'M120,0c-10,10,-20,-10,-60,0c-10,-10,-60,0,-60,0');

	t.pass();
});

// this is a regression test
test('tail weirdness', (t) => {
	const tailScale = Path.scale([
		'M290.7,204.5c-9,0-9,9-18,9s-9-9-18-9s-9,9-18,9s-9-9-18-9s-9,9-18,9s-9-9-18-9s-9,9-18,9',
		'M288.7,213.5c-9,0-9-9-18-9s-9,9-18,9s-9-9-18-9s-9,9-18,9s-9-9-18-9s-9,9-18,9s-9-9-18-9'
	], { loop: true });

	t.is(typeof tailScale, 'function');
	t.is(tailScale(0).toString(), 'M290.7,204.5c-9,0,-9,9,-18,9s-9,-9,-18,-9s-9,9,-18,9s-9,-9,-18,-9s-9,9,-18,9s-9,-9,-18,-9s-9,9,-18,9');
	t.is(tailScale(0.2).toString(), 'M289.9,208.1c-9,0,-9,1.8,-18,1.8s-9,-1.8,-18,-1.8s-9,1.8,-18,1.8s-9,-1.8,-18,-1.8s-9,1.8,-18,1.8s-9,-1.8,-18,-1.8s-9,1.8,-18,1.8');
	t.is(tailScale(0.5).toString(), 'M288.7,213.5c-9,0,-9,-9,-18,-9s-9,9,-18,9s-9,-9,-18,-9s-9,9,-18,9s-9,-9,-18,-9s-9,9,-18,9s-9,-9,-18,-9');
	t.is(tailScale(0.666).toString(), 'M289.4,210.5c-9,0,-9,-3,-18,-3s-9,3,-18,3s-9,-3,-18,-3s-9,3,-18,3s-9,-3,-18,-3s-9,3,-18,3s-9,-3,-18,-3');
	t.is(tailScale(0.8).toString(), 'M289.9,208.1c-9,0,-9,1.8,-18,1.8s-9,-1.8,-18,-1.8s-9,1.8,-18,1.8s-9,-1.8,-18,-1.8s-9,1.8,-18,1.8s-9,-1.8,-18,-1.8s-9,1.8,-18,1.8');
	t.is(tailScale(1).toString(), 'M290.7,204.5c-9,0,-9,9,-18,9s-9,-9,-18,-9s-9,9,-18,9s-9,-9,-18,-9s-9,9,-18,9s-9,-9,-18,-9s-9,9,-18,9');

	t.pass();
});
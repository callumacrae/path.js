# path.js [![Build Status](https://travis-ci.org/SamKnows/path.js.svg?branch=master)](https://travis-ci.org/SamKnows/path.js)

> A library for morphing between SVG paths, written at [SamKnows].

## Installation

```
$ npm install --save path-js
```

## Usage

Has a fairly similar API to [chroma.js], for some reason.

```js
var path = require('path-js');

path('M 100 100 L 200 200').d(); // M100,100l100,100
```

To morph between paths, use `path.scale()`:

```js
var pathScale = path.scale(['M 100 100 L 200 200', 'M 200 100 L 100 200', 'M 300 300 L 400 200']);
pathScale(0.25); // M150,100l0,100
```

It takes a number between 0 and 1. It doesn't yet support `.domain()`, although
I'll gladly accept a PR.

Only a subset of paths are supported - they have to have the same number of
points, and the command types of each point has to match. For anything more
complicated, check out GreenSock's [MorphSVG] plugin.

### Looping mode

If you enable looping mode, the scale loops back to the first specified path,
and numbers greater than 1 are accepted.

```js
var pathScale = path.scale(['M 100 100 L 200 200', 'M 200 100 L 100 200'], {
  loop: true
});

pathScale(0); // M100,100l100,100
pathScale(0.25); // M150,100l0,100
pathScale(0.5); // M200,100l-100,100
pathScale(0.75); // M150,100l0,100
pathScale(1); // M100,100l100,100
```

### `path.mix()`

If you don't want the complexity that comes with a scale, use `path.mix()`
instead. It takes three arguments: two paths, and a number between 0 and 1 that
says how much of each should be used.

Be aware that if you use this, you lose the performance gains from using a
scale.

### `path.reverse()`

This function simply reverses the points of a line - you get the same line, but
backwards.

## License

Released under the MIT license.

[SamKnows]: http://samknows.com/
[chroma.js]: http://gka.github.io/chroma.js/
[MorphSVG]: https://greensock.com/morphSVG
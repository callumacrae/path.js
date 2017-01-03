# path.js

> A library for morphing between SVG paths, written by [SamKnows].

## Installation

```
$ npm install --save path-js
```

## Usage

Has a fairly similar API to [chroma.js], for some reason.

```js
var path = require('path-js');

path('') // @todo
```

To morph between paths, use `path.scale()`:

```js
var pathScale = path.scale(['path one', 'path two', 'path three']);
pathScale(0.75); // @todo
```

It takes a number between 0 and 1. It doesn't yet support `.domain()`, although
I'll gladly accept a PR.

Only a subset of paths are supported - they have to have the same number of
points, and the command types of each point has to match. For anything more
complicated, check out GreenSock's [MorphSVG] plugin.

## License

Released under the MIT license.

[SamKnows]: http://samknows.com/
[chroma.js]: http://gka.github.io/chroma.js/
[MorphSVG]: https://greensock.com/morphSVG
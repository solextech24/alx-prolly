While studying documentation across repositories, I often copied code into a JavaScript or TypeScript file, the browser console, or a Node.js REPL. It would be more convenient to press a button and immediately run the code I’m reading.

With the JavaScript REPL extension, you can start a REPL session inside a Markdown file and evaluate code in JavaScript, TypeScript, or CoffeeScript code blocks.

```javascript
console.log("We ♡ JavaScript!");
```

## Playground for MDN Web Docs (and more)

MDN often provides live editors, but many examples are static. Running those examples through this extension can be more convenient. You can browse MDN Web Docs in Markdown (with or without preview) and execute examples via the extension. Run the command `JS Repl: Docs` to try it. You can also practice with official TypeScript, CoffeeScript, Node.js, Lodash, RxJS, and Ramda docs. [Learn more](https://github.com/axilleasiv/vscode-javascript-repl-docs/wiki/Playground-for-MDN-Web)


## Description
Create evaluable code blocks by wrapping code with triple backticks. For syntax highlighting in Markdown, add a language identifier immediately after the opening backticks (no space).


- javascript
- js
- jsx
- mjs
- typescript
- ts
- tsx
- coffeescript
- coffee

As users are evaluating code blocks inside a markdown file, by default only one active block is allowed. If there are more than one code block in the visible range of the active block the extension decides which one to activate. If there are mixed code blocks with different languages for example there is one js code block and a ts code block the extension decides which languages to activate and after that which block.

The extension evaluates only one language per time or keystroke and this is the language of the code block that users are editing.

So users can have in the same markdown file javascript, typescript of CoffeeScript code blocks that could be evaluated but only one language per time.

You can use all REPL features, including `require`/`import` of workspace files and installed `node_modules` resolved relative to the Markdown file. Security note: running code from documentation executes locally with your user permissions. Only run code you trust.
Only one block is active at a time: the block containing the cursor. If multiple blocks are in the viewport, activation follows the cursor position. When the file contains multiple languages, the active language is the one of the active block.

Evaluation triggers on edits to the active block (debounced). Mixed-language files are supported, but only one language is evaluated at a time.

Finally, the users can normally use all the available features of the repl extension for example they can `require` and `import` files or `node_modules` relative to the markdown file path.
const obj = {
  language: 'javascript'
}; //=
```

Users can include only the previous block by writing after the language identifier the following `repl-`

```js repl-
// Try to edit this comment
console.log(obj);

const objNew = {
  language: 'unknown'
}
```

Users can include all the previous blocks that have the same language identifier by adding after the language identifier the `repl--`

```js repl--
// Try to edit this comment
console.log(obj);
console.log(objNew);

```

Users can include the next blocks in the same language by adding after the language identifier the `repl++`

```js repl++
// Try to edit this comment
hello(); /*= */
hello2(); /*= */

```

Maybe users will need to ignore a code block. This can happen by adding after the language identifier the `repl!`

Users can include only the next block in the same language by adding after the language identifier the `repl+`

```js repl+
// Try to edit this comment
hello(); /*= */

```

```js
function hello() {
  return 'Hello World!';
}
```

The following code block will be ignored

```js repl!
throw new Error('An error!')
```

```js
function hello2() {
  return 'Hello World2!';
}
```

The settings that we have used `repl-`,  `repl--`, `repl+`,  `repl++` and `repl!` are added besides the language identifier, the last setting that can be added besides language identifier is the `repl*` that is used in order to evaluate all the code blocks in the markdown file. If there are more than one language inside the markdown file the language that is selected is depending from the code block that users are editing.

Depending on the case maybe it is not convenient to change this every time per code block, so users can add the following comment `<!-- repl* -->` at the first line of the markdown file.

### Examples in TypeScript
If TypeScript is not installed in the workspace, the extension prompts to install a pinned version (configurable), downloads it on consent, and caches it. You can change or pin the version in settings to avoid unexpected upgrades.
```typescript
// Try to edit this comment
function classDecorator<T extends { new (...args: any[]): {} }>(
  constructor: T
) {
  return class extends constructor {
    newProperty = "new property";
    hello = "override";
  };
}

@classDecorator
class Greeter {
  property = "property";
  hello: string;
  constructor(m: string) {
    this.hello = m;
  }
}

console.log(new Greeter("world"));
```

By using the `repl+` identifier the below code block has access to the following block and the function `enumerable`

```ts repl+
// Try to edit this comment
class Greeter {
  greeting: string;
  constructor(message: string) {
    this.greeting = message;
  }

  @enumerable(false)
  greet() {
    return "Hello, " + this.greeting;
  }
}
```

```ts
function enumerable(value: boolean) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    descriptor.enumerable = value;
  };
}
```

### Examples in CoffeeScript
 If CoffeeScript is not present, the extension prompts to install a pinned version and caches it. (Avoid auto-installing “latest” without consent.)
```coffee
fibonacci = ->
  [previous, current] = [1, 1]
  loop
    [previous, current] = [current, previous + current]
    yield current
  return

getFibonacciNumbers = (length) ->
  results = [1]
  for n from fibonacci()
    results.push n
    break if results.length is length
  results
```

By using the `repl-` identifier the below code block has access to the previous block and the function `getFibonacciNumbers`

```coffee repl-
# Try to edit this comment
console.log(getFibonacciNumbers(4))
```



### Examples in Node.js

```javascript
// Try to edit this comment
const EventEmitter = require('events');

class MyEmitter extends EventEmitter {}

const myEmitter = new MyEmitter();

myEmitter.on('event', () => {
  console.log('an event occurred!');
});

myEmitter.emit('event');
myEmitter.emit('event');
```

By using the `repl-` identifier the below code block has access to the previous block and the class `MyEmitter`

```js repl-
// Try to edit this comment
const myEmitter2 = new MyEmitter();

myEmitter2.on('event', function(a, b) {
  console.log(a, b, this, this === myEmitter);
});

myEmitter2.emit('event', 'a', 'b');
```


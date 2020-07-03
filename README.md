# PunyJS.cmdArgs

A simple module for parsing command line arguments in NodeJS.

This module returns a simple worker function that takes an argv array and returns a ``CmdArgs`` object, representing the arguments.

###### Usage

```javascript
var cmdArgs = require("punyjs-cmdargs")(process.argv);
```

###### Command Line Parts
```
node cli.js listen --config secure,port:3000 -fvt --serve -g
```
|node|script|command|named-option|flag array|named-option|flag|
|----|------|-------|------------|----------|------------|----|
|node|cli.js|listen|--config secure,port:3000|-fvt|--serve|-g|

* **command**: The first argument after the script path, before any named-options or flags.
* **named-option**: Any argument that is prefixed with a double dash ("--"); can be followed by an array of value and/or name:value members.
* **flag array**: Any argument that is prefixed with a single dash ("-"); each character is an individual flag.

###### Example

```
node cli.js listen --config secure,port:3000 -fvt --serve
```

* `listen`: The Command
* `--config`: A *named-option* with the value `secure,port:3000`
* `-fvt`: Flags f, v, and t
* `--serve`: A *named-option* without a value

```json
{
    "_executable": "node"
    , "_script": "cli.js"
    , "command": "listen"
    , "oridnals": ["config","serve"]
    , "flags": ["f","v","t"]
    , "config": [
        "secure"
        , {
            "name": "port"
            , "value": "3000"
        }
    ]
    , "serve": null
}
```
###### Static Members
| Member    |Description|
|-----------|-----------|
|_executable|Always ``node`` (``argv[0]``).
|_script    |The path to the JavaScript file, i.e. the argument following <br>`node` in the command line (``argv[1]``).
|command    |The first option following the path as long as it's<br>not a *named-option* or flag (Default null).
|flags      |An array of flags, in the order they appeared in (Default<br>empty array)
|ordinals   |An array of *named-option names*, in the order they appeared<br>in the command line arguments.
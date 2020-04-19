/**
* Processes the command line arguments and creates an instance of {iCommandLineArguments}
*
* 1. Anything prefixed with a singe hyphen will be treated as a single character option/flag. If there are multiple characters then each will be an option. e.g. "-tpf" will be parsed as flags: [ "t", "p", "f"]
* 2. Anything prefixed with double hyphens will be treated as a named option with the possibility of a following option value. e.g. "--path ./mypath" will be parsed as "path": "./mypath"
* 3. Anything else will be treated as an option value for the preceeding named option unless there isn't a value for the variable last, in which case it's dropped.

* Named option values can be a single value, a list of values (comma seperated) or one or more name:value pairs (comma seperated), or a combination of the two e.g. name1:value1,name2,name3:value3. Do not include any spaces as that would cause the node process.argv to treat them as seperate command line entries. If spaces are required, wrap the entire option value set in double qoutes, e.g. "name1:value with space,name2". Since commas and colons are reserved, literal values must be escaped using a double backslash, e.g. name1:value\\,1
*
* An "ordinal" property will be added to annotate the order in which the named value arguments appeared in the command line
*
* @factory
*   @dependency {array} processArgs ["+process.argv"]
*   @dependency {object} regEx [":TruJS.core.utils._RegEx",[]]
* @interface iCommandLineArguments
*   @property {string} _executable
*   @property {string} _script
*   @property {string} command
*   @property {array} commands
*   @property {array} flags
*   @property {object} arguments
*   @property {array} ordinals
*/
function _CmdArgs(
    args
    , regEx
) {

    var NAME_VALUE_PATT = /((?:[\\][,]|[\\][:]|[^,:])+)(?:[:]((?:[\\][,]|[\\][:]|[^,:])+))?/g
    , ESCP_RES_PATT = /\\([,:])/g
    , PATH_PATT = /^(?:[A-z]:)?(?:[\/\\][^\/\\]+)+(?:[\/\\])?$/
    , cmdArgs = {
        "arguments": {}
        , "flags": []
        , "ordinals": []
    }
    , literalMap = {
        "true": true
        , "false": false
        , "undefined": undefined
        , "null": null
    }
    , last
    , commands = [];

    //loop through each argument
    args
    .forEach(function forEachArg(entry, indx) {
        //skip the first 2 as those are the executable and script
        if (indx > 1) {
            if (indx === 2 && entry.indexOf('-') === -1) {
                cmdArgs.command = entry;
                commands.push(entry);
            }
            else {
                last = processEntry(cmdArgs, entry, last);
            }
        }
    });

    /**
    * @worker
    */
    return Object.create(null, {
        "_executable": {
            "enumerable": true
            , "value":  args[0]
        }
        , "_script": {
            "enumerable": true
            , "value":  args[1]
        }
        , "command": {
            "enumerable": true
            , "value": cmdArgs.command
        }
        , "commands": {
            "enumerable": true
            , "value": commands
        }
        , "flags": {
            "enumerable": true
            , "value": cmdArgs.flags
        }
        , "arguments": {
            "enumerable": true
            , "value": cmdArgs.arguments
        }
        , "ordinals": {
            "enumerable": true
            , "value": cmdArgs.ordinals
        }
    });

    /**
    * Process the command line argument
    * @function
    */
    function processEntry(cmdArgs, entry, last) {
        //double hyphen
        if (entry.indexOf('--') === 0) {
            last = entry.substring(2);
            cmdArgs.arguments[last] = null;
            cmdArgs.ordinals.push(last);
        }
        //single hyphen
        else if (entry.indexOf('-') === 0) {
            last = null;
            parseFlags(cmdArgs, entry);
        }
        //no hyphen
        else {
            //if the previous token was a double hyphen
            if (!!last) {
                cmdArgs.arguments[last] = parseNameValue(entry);
                last = null;
            }
            //add this to the commands
            else {
                commands.push(entry);
            }
        }

        return last;
    }
    /**
    * Parses a flag entry, adding the flag characters to the flags array
    * @function
    * @private
    */
    function parseFlags(cmdArgs, value) {
        for(var i = 1, l = value.length; i < l; i++) {
            cmdArgs.flags.push(value[i]);
        }
    }
    /**
    * Parses the named option value, using the name:value notation with comma
    * seperation for multiple values
    * @function
    * @private
    * @param {string} value The option name value to be parsed
    */
    function parseNameValue(value) {
        //see if this is just a value (no unescaped colons or commas)
        if (
            value.replace("\\:", "").indexOf(":") === -1
            && value.replace("\\,", "").indexOf(",") === -1
        ) {
            value = value.replace(ESCP_RES_PATT, "$1");
            if (Object.keys(literalMap).indexOf(value) !== -1) {
                value = literalMap[value];
            }
            return value;
        }
        //see if this is a path (in-case the command line makes / = c:/)
        if (PATH_PATT.test(value)) {
            return value;
        }

        var optionValues = {};
        //use regex to extract the name:value pairs
        regExpHelper.getMatches(NAME_VALUE_PATT, value)
        .forEach(function forEachMatch(match) {
            var val = !!match[2]
                && match[2].replace(ESCP_RES_PATT, "$1")
                || null;
            optionValues[match[1]] = val;
        });

        return optionValues;
    }
}
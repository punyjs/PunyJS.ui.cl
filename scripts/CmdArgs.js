/**[@naming({ "skip": true })]*/
/**
* Processes the command line arguments using the unix and GNU standards
* 1. Anything prefixed with a singe hyphen will be treated as a single
*   character option/flag. If there are multiple characters then each will be an
*   option. e.g. "-tpf" will be parsed as flags: [ "t", "p", "f"]
* 2. Anything prefixed with double hyphens will be treated as a named option
*   with the possibility of a following option value. e.g.
*   "--path ./mypath" will be parsed as "path": "./mypath"
* 3. Anything else will be treated as an option value for the preceeding named
*   option unless there isn't a value for the variable last, in which case it's
*   dropped.
*
* Named option values can be a single value, a list of values (comma seperated)
* or one or more name:value pairs (comma seperated), or a combination of the two
* e.g. name1:value1,name2,name3:value3. Do not include any spaces as that would
* cause the node process.argv to treat them as seperate command line entries.
* If spaces are required, wrap the entire option value set in double qoutes,
* e.g. "name1:value with space,name2". Since commas and colons are reserved,
* literal values must be escaped using a double backslash, e.g. name1:value\\,1
*
* An "ordinal" property will be added to denote in which order the named values
* were in the command line
*
* @module
*/
var NAME_VALUE_PATT = /((?:[\\][,]|[\\][:]|[^,:])+)(?:[:]((?:[\\][,]|[\\][:]|[^,:])+))?/g
, ESCP_RES_PATT = /\\([,:])/g
;

/**
* Process the command line argument
* @function
*/
function processEntry(cmdArgs, entry, last) {
    //double hyphen
    if (entry.indexOf('--') === 0) {
        last = entry.substring(2);
        cmdArgs[last] = null;
        cmdArgs.ordinals.push(last);
    }
    //single hyphen
    else if (entry.indexOf('-') === 0) {
        last = null;
        parseFlags(cmdArgs, entry);
    }
    //no hyphen
    else {
        if (!!last) {
            cmdArgs[last] = parseNameValue(entry);
            last = null;
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
    //see if this is just a value
    if (value.replace("\\:", "").indexOf(":") === -1 && value.replace("\\,", "").indexOf(",") === -1) {
        return value.replace(ESCP_RES_PATT, "$1");
    }

    var optionValues = [];
    //use regex to extract the name:value pairs
    TruJS._RegEx().getMatches(NAME_VALUE_PATT, value)
    .forEach(function forEachMatch(match) {
        var val = !!match[2] && match[2].replace(ESCP_RES_PATT, "$1") || null;
        //if there is a value then make this a name value pair
        if (val !== null) {
            optionValues.push({
                "name": match[1]
                , "value": val
            });
        }
        else {
            optionValues.push(match[1]);
        }
    });

    return optionValues;
}

/**
* Processes the argv array and returns a formatted CmdArgs object
* @function
* @param {array} argv The argv array from process
*/
function CmdArgs(argv) {
    var last //a placeholder for the last option
    , cmdArgs = { //a collection for the argument results
        "_executable": argv[0]
        , "_script": argv[1]
        , "command": null
        , "flags": []
        , "ordinals": []
    };

    //loop through each argument
    argv.forEach(function forEachArg(entry, indx) {
        //skip the first 2 as those are the executable and script
        if (indx > 1) {
            if (indx === 2 && entry.indexOf('-') === -1) {
                cmdArgs.command = entry;
            }
            else {
                last = processEntry(cmdArgs, entry, last);
            }
        }
    });

    return cmdArgs;
}
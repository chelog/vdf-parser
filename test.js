const VDF = require('./main');

let anyTestFailed = false;
function perform_test(source_string, test_expect, options, test_id, expect_failure = false) {
    try {
        let test_result = VDF.parse(source_string, options);

        if (JSON.stringify(test_result) === JSON.stringify(test_expect)) {
            //console.log("Test passed");
            if (expect_failure) {
                console.log(test_result);
                console.error("==========================================\nTest failed (expected an error): "+test_id+"\n==========================================");
            }
        } else {
            if (expect_failure) return;
            anyTestFailed = true;
            console.log(test_result);
            console.error("==========================================\nTest failed (mismatch): "+test_id+"\n==========================================");
        }

        try {
            // test if we can restringify without an error at all
            VDF.stringify(test_result);
        }
        catch (e) {
            if (expect_failure) return;
            anyTestFailed = true;
            console.log(e);
            console.error("==========================================\nTest failed (restringify): "+test_id+"\n==========================================");
        }

        return test_result;

    } catch (e) {
        if (expect_failure) return;
        anyTestFailed = true;
        console.log(e);
        console.error("==========================================\nTest failed (exception): "+test_id+"\n==========================================");
    }
}

function perform_stringify_test(source_object, test_expect, options, test_id) {
    try {
        let test_result = VDF.stringify(source_object, options);

        if (test_result && test_result.trim() === test_expect.trim()) {
            //console.log("Test passed");
        } else {
            anyTestFailed = true;
            console.log(test_result);
            console.error("==========================================\nTest failed (mismatch): "+test_id+"\n==========================================");
        }
    } catch (e) {
        anyTestFailed = true;
        console.log(e);
        console.error("==========================================\nTest failed (exception): "+test_id+"\n==========================================");
    }
}

let test, test_expect;

// main test

test = `
"Inline objects and arrayifying"//{}
{//{}
	"0"		{ "label" "#SFUI_CashColon"	}
	"1"		{ "label" "#SFUI_WinMatchColon"			"value" "#SFUI_Rounds" }
	"2"		{ "label" "#SFUI_TimePerRoundColon"		"value" "2 #SFUI_Minutes" }
	"2"		{ "label" "#SFUI_TimePerRoundColon"		"value" "2 #SFUI_Minutes" }
	"3" "value before object"
	"3"		{ "label" "#SFUI_BuyTimeColon"			"value" "45 #SFUI_Seconds" }
	"4"		{ "label" "#SFUI_SpectateColon"			"value" "#SFUI_SpectateTeamOnly" }
	"4"		{ "label" "#SFUI_SpectateColon"			"value" "#SFUI_SpectateTeamOnly" }
	"4" "value after object"
	"5"		{ "label" "#SFUI_BotsColon_1"				"value" "#SFUI_BotDifficulty3_1" // random comment, don't mind me
	"label" "#SFUI_BotsColon_2"				"value" "#SFUI_BotDifficulty3_2" }
	"6" 	{ "label" "#SFUI_WinMatchColon"		}// ignore:	"value" "#SFUI_Rounds" }
	"7" 	{ "label" "#SFUI_WinMatchColon"//}
                                               "more" "here"}
	// Syntax error: "8" 	{ "label" "#SFUI_WinMatchColon"			"value" } // ignore: "#SFUI_Rounds" }
} empty{}empty2{empty{}} empty3{} empty3{}
no_quotes_tests { // dat no newline + a comment!
	0 "-12.34"
	0 -1234
	0 12.34
	0 -12.34
	test1 1
	test2 val2 test3 true test3 false
	test4 ""
    test5{}
    //test6 a{} // illegal ({} cannot be used inside of unquoted values), would cause an uncaught error
    "no""space"
	//no_value // this would fail, but is probably malformed anyways, not handling this case
}
arrayifying {
    string_then_obj "hi"
    string_then_obj { "obj_key" "obj_val" }
    obj_then_string { "obj_key" "obj_val" }
    obj_then_string "hi"
}
whitespacing_test   
  // a comment in the middle, don't mind me

    { 

    }
misc//{}
{//{}
    "EscapedQuotes" "aaa/////\\\\\\nooo\\"{{uuu\\"\\"{{\\"hhh"
	// with conditional to ignore
	"Menu_Dlg_Leaderboards_Lost_Connection"         "You must be connected to Xbox LIVE to view Leaderboards. Please check your connection and try again." [$X360]
	"SFUI_GameModeProgressDisclaimer"         "No stats tracking." [$WIN32||$X360]
	"SFUI_SinglePlayer_Invite_On"          ""      [!$PS3]
	"SFUI_Upsell_Nav"        "\${west} Unlock Full Game     \${confirm} Quit     \${cancel} Back to Game" [!$WIN32&&!$OSX]
	"Cstrike_TitlesTXT_TRAINING6"                                                            "Defuse the bomb by aiming at bomb and holding \${use}."
    "bool_test_ok1"    True
    "bool_test_ok2" "true"
    "bool_test_not_ok1" "AA_TRuE_BB"
    "bool_test_not_ok2" notTRuE
}
`;

test_expect = {
    'Inline objects and arrayifying': {
        '0': { label: '#SFUI_CashColon' },
        '1': { label: '#SFUI_WinMatchColon', value: '#SFUI_Rounds' },
        '2': [
            { label: '#SFUI_TimePerRoundColon', value: '2 #SFUI_Minutes' },
            { label: '#SFUI_TimePerRoundColon', value: '2 #SFUI_Minutes' }
        ],
        '3': [
            'value before object',
            { label: '#SFUI_BuyTimeColon', value: '45 #SFUI_Seconds' }
        ],
        '4': [
            { label: '#SFUI_SpectateColon', value: '#SFUI_SpectateTeamOnly' },
            { label: '#SFUI_SpectateColon', value: '#SFUI_SpectateTeamOnly' },
            'value after object'
        ],
        '5': {
            label: [ '#SFUI_BotsColon_1', '#SFUI_BotsColon_2' ],
            value: [ '#SFUI_BotDifficulty3_1', '#SFUI_BotDifficulty3_2' ]
        },
        '6': { label: '#SFUI_WinMatchColon' },
        '7': { label: '#SFUI_WinMatchColon', more: 'here' }
    },
    empty: {},
    empty2: {empty: {}},
    empty3: [{}, {}],
    no_quotes_tests: {
        '0': [ -12.34, -1234, 12.34, -12.34 ],
        test1: 1,
        test2: 'val2',
        test3: [ true, false ],
        test4: '',
        test5: {},
        no: 'space'
    },
    arrayifying: {
        string_then_obj: ['hi', { 'obj_key': 'obj_val' }],
        obj_then_string: [{ 'obj_key': 'obj_val' }, 'hi']
    },
    whitespacing_test: {},
    misc: {
        EscapedQuotes: 'aaa/////\\\\\\nooo\\"{{uuu\\"\\"{{\\"hhh',
        Menu_Dlg_Leaderboards_Lost_Connection: 'You must be connected to Xbox LIVE to view Leaderboards. Please check your connection and try again.',
        SFUI_GameModeProgressDisclaimer: 'No stats tracking.',
        SFUI_SinglePlayer_Invite_On: '',
        SFUI_Upsell_Nav: '${west} Unlock Full Game     ${confirm} Quit     ${cancel} Back to Game',
        Cstrike_TitlesTXT_TRAINING6: 'Defuse the bomb by aiming at bomb and holding ${use}.',
        bool_test_ok1: true,
        bool_test_ok2: true,
        bool_test_not_ok1: 'AA_TRuE_BB',
        bool_test_not_ok2: 'notTRuE'
    }
};

perform_test(test, test_expect, {}, "main");

// arrayify tests

test = `
regular_values {
    key val1 key val2
}
array_values {
    key { test1 aaa }
    key { test1 bbb } // without "arrayify" this will patch the previous value of "test1" under "key"
    key { test2 bbb }
}
`;

test_expect = {
    regular_values: { key: ['val1', 'val2'] },
    array_values: { key: [ // array of three objects
        { test1: 'aaa' },
        { test1: 'bbb' },
        { test2: 'bbb' },
    ] }
};
perform_test(test, test_expect, { arrayify: true }, "arrayify:true");
perform_test(test, test_expect, undefined, "arrayify:true (default)");

test_expect = {
    regular_values: { key: 'val2' },
    array_values: { key:
        { test1: 'bbb', test2: 'bbb' } // notice it's one object now, not an array of objects
    }
};
perform_test(test, test_expect, { arrayify: false }, "arrayify:false");

// types tests

test = `
0 "-12.34"
0 -1234
0 12.34
0 -12.34
test1 1
test2 val2 test3 true test3 false
test4 True test5 TRue test6 atrue test7 trueb
`;

test_expect = {
    '0': [ -12.34, -1234, 12.34, -12.34 ],
    test1: 1,
    test2: 'val2',
    test3: [ true, false ],
    test4: true,
    test5: true,
    test6: 'atrue',
    test7: 'trueb'
};
perform_test(test, test_expect, { types: true }, "types:true");
perform_test(test, test_expect, true, "types:true (legacy)");
perform_test(test, test_expect, undefined, "types:true (default)");

test_expect = {
    '0': [ '-12.34', '-1234', '12.34', '-12.34' ],
    test1: '1',
    test2: 'val2',
    test3: [ 'true', 'false' ],
    test4: 'True',
    test5: 'TRue',
    test6: 'atrue',
    test7: 'trueb'
};
perform_test(test, test_expect, { types: false }, "types:false");
perform_test(test, test_expect, false, "types:false (legacy)");

// allowEmptyUnquotedValues

test = `
test_empty
non_empty "a"

test_empty_string "test1"
test_empty_string
a
"a" "b"
test_empty_obj { "tk" "tv" }
test_empty_obj

test_empty_arr_string "test1"
test_empty_arr_string "test1"
test_empty_arr_string "test2"
test_empty_arr_string
//"b" "c"
//test_empty_arr_obj { "tk" "tv" }
//test_empty_arr_obj { "tk" "tv" }
//test_empty_arr_obj
`;

test_expect = {
    test_empty: null,
    test_empty_string: ['test1', null],
    test_empty_obj: [{tk: 'tv'}, null],
    test_empty_arr_string: ['test1', 'test1', null],
    test_empty_arr_obj: [{tk: 'tv'}, {tk: 'tv'}, null]
};

perform_test(test, test_expect, { allowEmptyUnquotedValues: false }, "allowEmptyUnquotedValues:false (except fail)", true);
console.log('=');
console.log("output:", perform_test(test, test_expect, { allowEmptyUnquotedValues: true }, "allowEmptyUnquotedValues:true"));

//
// stringify de-arrayify
//

test = {
    regular_values: { key: ['val1', 'val2', -12.34, false, true] },
    array_values: { key: [ // array of three objects
        { test1: 'aaa' },
        { test1: 'bbb' },
        { test2: 'bbb' },
    ] },
    b: [{}],
};

test_expect = `
"regular_values"
{
"key" "val1"
"key" "val2"
"key" "-12.34"
"key" "false"
"key" "true"
}
"array_values"
{
"key"
{
"test1" "aaa"
}
"key"
{
"test1" "bbb"
}
"key"
{
"test2" "bbb"
}
}
"b"
{
}
`;
perform_stringify_test(test, test_expect, {}, "stringify => de-arrayify");

// stringify pretty and indent tests

test = {
    a: 'b',
    b: {
        a: {},
        b: [{}],
        b2: [{}, {}],
        c: 'a',
        d: {
            a: 'a',
            b: 'b'
        },
        e: ['a', 'b'] // we test whether we can dearrayify
    }
};

test_expect = `
"a" "b"
"b"
{
"a"
{
}
"b"
{
}
"b2"
{
}
"b2"
{
}
"c" "a"
"d"
{
"a" "a"
"b" "b"
}
"e" "a"
"e" "b"
}
`;
perform_stringify_test(test, test_expect, { pretty: false }, "stringify => pretty:false");
perform_stringify_test(test, test_expect, false, "stringify => pretty:false (legacy)");
perform_stringify_test(test, test_expect, undefined, "stringify => pretty:false (default)");

test_expect = `
"a" "b"
"b"
{
    "a"
    {
    }
    "b"
    {
    }
    "b2"
    {
    }
    "b2"
    {
    }
    "c" "a"
    "d"
    {
        "a" "a"
        "b" "b"
    }
    "e" "a"
    "e" "b"
}
`;
perform_stringify_test(test, test_expect, { pretty: true, indent: "    " }, "stringify => pretty:true, indent:<4 spaces>");
perform_stringify_test(test, test_expect.replace(/    /g, "\t"), true, "stringify => pretty:true (legacy)");

// END

if (!anyTestFailed)
    console.log("All tests passed.");
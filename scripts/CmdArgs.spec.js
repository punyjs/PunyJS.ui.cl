/**[@test({ "title": "TruJS.cmdArgs.CmdArg: simple options & named options"})]*/
function testCmdArgs1(arrange, act, assert, module) {
  var argv, res;

  arrange(function () {
    argv = [
      "executable"
      , "script"
      , "compile"
      , "--named1"
      , "value1"
      , "-f"
      , "fragment"
      , "--named2"
      , "value2"
      , "fragment"
      , "-tpq"
    ];
  });

  act(function () {
    res = module(argv);
  });

  assert(function (test) {
    test("res._executable should be")
      .value(res, "_executable")
      .equals(argv[0]);

    test("res._script should be")
      .value(res, "_script")
      .equals(argv[1]);

    test("res.command should be")
      .value(res, "command")
      .equals(argv[2]);

    test("res.options should have 4 members")
      .value(res, "options")
      .hasMemberCountOf(4);

    test("res.options should be")
      .value(res, "options")
      .toString()
      .equals("f,t,p,q");

    test("res.named1 should be")
      .value(res, "named1")
      .equals("value1");

    test("res.named2 should be")
      .value(res, "named2")
      .equals("value2");
  });
}

/**[@test({ "title": "TruJS.cmdArgs.CmdArg: multiple same options"})]*/
function testCmdArgs2(arrange, act, assert, module) {
  var argv, res;

  arrange(function () {
    argv = [
      "executable"
      , "script"
      , "-vvv"
    ];
  });

  act(function () {
    res = module(argv);
  });

  assert(function (test) {
    test("res.options should have 3 members")
      .value(res, "options")
      .hasMemberCountOf(3);

    test("res.command should be null")
      .value(res, "command")
      .isNull();

  });
}

/**[@test({ "title": "TruJS.cmdArgs.CmdArg: complex named options"})]*/
function testCmdArgs3(arrange, act, assert, module) {
  var argv, res;

  arrange(function () {
    argv = [
      "executable"
      , "script"
      , "compile"
      , "--named"
      , "name1,name2:value2,name3:val1\\,val2"
    ];
  });

  act(function () {
    res = module(argv);
  });

  assert(function (test) {
    test("res.named should have 3 members")
    .value(res, "named")
    .hasMemberCountOf(3);

    test("res.named[0] should be name1")
    .value(res, "named[0]")
    .equals("name1");

    test("res.command should be")
      .value(res, "command")
      .equals(argv[2]);

    test("res.named[1] should be")
    .value(res, "named[1]")
    .stringify()
    .equals("{\"name\":\"name2\",\"value\":\"value2\"}");

    test("res.named[2] should be")
      .value(res, "named[2]")
      .stringify()
      .equals("{\"name\":\"name3\",\"value\":\"val1,val2\"}");
  });
}

/**[@test({ "title": "TruJS.cmdArgs.CmdArg: named value with reserved chars"})]*/
function testCmdArgs4(arrange, act, assert, module) {
  var argv, res;

  arrange(function () {
    argv = [
      "executable"
      , "script"
      , "--named"
      , "val1\\,val2"
    ];
  });

  act(function () {
    res = module(argv);
  });

  assert(function (test) {
    test("res.named should be")
      .value(res, "named")
      .equals("val1,val2");

    test("res.command should be null")
      .value(res, "command")
      .isNull();

  });
}
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var yargs_1 = require("yargs");
var fs = require("fs");
var argv = (0, yargs_1.default)(process.argv.slice(2))
    .usage("--help | --version | --reverse <key> | --silent")
    .option("o", {
    describe: "Archive file, if not specified it will be stored in a default one",
    type: "string",
})
    .option("X", {
    describe: "Type of request, if not specified GET will be used",
    type: "string",
})
    .help()
    .version()
    .alias("help", "h").argv;
var initArchive = function () {
    var archivePath = "archive.txt";
    if (argv.o)
        archivePath = argv.o;
    if (!fs.existsSync(archivePath)) {
        fs.writeFileSync("archives/" + archivePath, "");
    }
};
var initRequest = function () {
    var requestType = "GET";
    if (argv.X)
        requestType = argv.X;
};
var testVulnerabilite = function (urls) {
    urls.forEach(function (url) {
        console.log(url);
    });
};
var myscript = function () {
    initArchive();
    initRequest();
    var urls = argv._;
    console.log(urls);
    testVulnerabilite(urls);
};
myscript();

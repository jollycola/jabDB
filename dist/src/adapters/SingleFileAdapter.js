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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Adapter_1 = __importDefault(require("./Adapter"));
const fs_1 = __importDefault(require("fs"));
const util_1 = __importDefault(require("util"));
const readFile = util_1.default.promisify(fs_1.default.readFile);
class SingleFileAdapter extends Adapter_1.default {
    constructor(source) {
        super();
        this.source = source;
        this.checkSource().catch((reason) => {
            throw reason;
        });
    }
    checkSource() {
        return __awaiter(this, void 0, void 0, function* () {
            let value = false;
            if (fs_1.default.existsSync(this.source)) {
                yield fs_1.default.stat(this.source, (err, stats) => {
                    if (err) {
                        throw err;
                    }
                    if (!stats.isFile()) {
                        value = false;
                        throw Error("Source: " + this.source + " is not a file!");
                    }
                    value = true;
                });
            }
            else {
                value = false;
                throw Error("Source: " + this.source + " does not exist!");
            }
            return value;
        });
    }
    readSource() {
        return __awaiter(this, void 0, void 0, function* () {
            return JSON.parse((yield readFile(this.source)).toString());
        });
    }
    readMeta() {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.readSource();
            let meta = data.meta;
            return meta;
        });
    }
    readTable(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.readSource();
            if (data.tables != undefined) {
                const _tables = data.tables;
                const tables = this.plainToJabTables(_tables);
                return tables.get(id);
            }
            else {
                throw new Error("[MalformedSourceFileError]: Object missing a 'tables' field");
            }
        });
    }
    write() {
        throw new Error("Method not implemented.");
    }
}
exports.default = SingleFileAdapter;
//# sourceMappingURL=SingleFileAdapter.js.map
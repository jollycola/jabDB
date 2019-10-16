import chai, { assert, expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import SingleFileAdapter from "../src/adapters/SingleFileAdapter";
import JabTable from "../src/JabTable";
import JabEntry from "../src/JabEntry";
import { IOError } from "../src/errors";
import JabDB, { JabDBMeta } from "../src/JabDB";
import Adapter from "../src/adapters/Adapter";
import fs from "fs";

chai.use(chaiAsPromised);

const WRITABLE_PATH = "data/test/writable.json";
const PREFILLED_PATH = "data/test/prefilled.json";

describe("SingleFileAdapter", () => {
    let adapter: SingleFileAdapter;

    beforeEach(() => {
        adapter = new SingleFileAdapter("data/test/prefilled.json");
    })

    it("adapter_badsource_throws", async () => {
        adapter = new SingleFileAdapter("_nonexisting_file_.json");

        await expect(adapter.readTable<TestClass>("test")).to.be.rejectedWith(IOError);
    })

    it("adapter_readMeta_defined", async () => {
        const meta = await adapter.readMeta();
        assert.isDefined(meta);
    })

    it("adapter_readMeta_type", async () => {
        const meta = await adapter.readMeta();
        assert.instanceOf(meta, JabDBMeta);
    })

    it("adapter_readTable_defined", async () => {
        const table = await adapter.readTable<TestClass>("test_table");
        assert.isDefined(table);
    })

    it("adapter_readTable_entry_defined", async () => {
        const table = await adapter.readTable<TestClass>("test_table");
        const entry = table.get("1");

        assert.isDefined(entry);
    })

    it("adapter_readTable_entry_value", async () => {
        const table = await adapter.readTable<TestClass>("test_table");
        const entry = table.get("1");

        assert.equal(entry.number, 10);
    })

    it("adapter_writeMeta", async () => {
        adapter = new SingleFileAdapter(WRITABLE_PATH);
        await adapter.connect();
        
        const meta = new JabDBMeta(true, 1050);
        await adapter.writeMeta(meta);
        
        const data = await adapter.readMeta();
        expect(data.doCaching).to.equal(true);
        expect(data.cacheLifespan).to.equal(1050);

        fs.unlinkSync(WRITABLE_PATH);
    })

    it("adapter_writeMeta_tablesNotNull", async () => {
        adapter = new SingleFileAdapter("./data/test/writable.json");

        const jsonPrefilled = fs.readFileSync("./data/test/prefilled.json").toString();
        fs.writeFileSync("./data/test/writable.json", jsonPrefilled, { flag: "w" });
        
        const meta = new JabDBMeta(true, 1050);
        await adapter.writeMeta(meta);
        
        const table = await adapter.readTable("test_table");
        assert.isDefined(table);

        fs.unlinkSync(WRITABLE_PATH);
    })

    it("db_getTable", async () => {
        const db = new JabDB(adapter);

        const table = await db.getTable("test_table");

        assert.isDefined(table);
        assert.instanceOf(table, JabTable);
    })

    it("db_getTable_error", async () => {
        const db = new JabDB(adapter);

        expect(db.getTable("_nonexisting_table_")).to.be.rejectedWith(Error);
    });

});

xdescribe("JabDB", () => {

    let db: JabDB;

    beforeEach(() => {
        db = new JabDB(new TestingAdapter());
    })

    it("getTable_defined", () => {
        const table = db.getTable("test1");
        assert.isDefined(table);
    })

    it("createTable_alreadyExists", async () => {
        const table = await db.createTable("test2");
        assert.isDefined(table);
    });

})


describe("JabTable", () => {

    let table: JabTable<any>;
    let testItem: TestClass;
    let entry: JabEntry<any>;


    beforeEach(() => {
        const map = new Map<string, JabEntry<any>>();
        testItem = new TestClass(1, "testitem");
        entry = new JabEntry("1", testItem);

        map.set(entry.getId(), entry);

        table = new JabTable("test_JabTable", map);
    })

    it("get", () => {
        let obj = table.get(entry.getId());
        assert.equal(obj, testItem);
    })

    it("find", () => {
        let obj = table.find(v => v.string == testItem.string);
        assert.equal(obj, testItem);
    })

});

class TestClass {
    number: number;
    string: string;

    constructor(number: number = -1, string: string = "lorem") {
        this.number = number;
        this.string = string;
    }
}

class TestingAdapter extends Adapter {
    connect(): Promise<any> {
        throw new Error("Method not implemented.");
    }

    public tables = new Map<string, JabTable<any>>();
    public meta = new JabDBMeta(false);

    constructor() {
        super();
        this.tables.set("test1", new JabTable("test1", new Map()));
    }

    async readMeta(): Promise<JabDBMeta> {
        return this.meta;
    }

    async readTable(id: string): Promise<JabTable<any>> {
        return this.tables.get(id);
    }

    writeMeta(meta: JabDBMeta): Promise<any> {
        this.meta = meta;
        return;
    }
    writeTable<T>(table: JabTable<T>): Promise<any> {
        throw new Error("Method not implemented.");
    }

    write(): void {
        throw new Error("Method not implemented.");
    }


}
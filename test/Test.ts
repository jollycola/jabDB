import chai, { assert, expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import SingleFileAdapter from "../src/adapters/SingleFileAdapter";
import JabTable from "../src/JabTable";
import JabEntry from "../src/JabEntry";
import { IOError } from "../src/errors";
import JabDB, { JabDBMeta } from "../src/JabDB";
import Adapter from "../src/adapters/Adapter";
import fs from "fs";
import _ from "lodash";

chai.use(chaiAsPromised);

const WRITABLE_PATH = "data/test/writable.json";
const PREFILLED_PATH = "data/test/prefilled.json";

describe("SingleFileAdapter", () => {
    let adapter: SingleFileAdapter;

    beforeEach(() => {
        adapter = new SingleFileAdapter(PREFILLED_PATH);
    })

    xit("test", () => {
        const map = new Map<string, JabTable<any>>();
        _.set(map, "test_table", new JabTable<any>("test_table", new Map<string, JabEntry<any>>()))
        _.set(map, "test_table2", new JabTable<any>("test_table2", new Map<string, JabEntry<any>>()))

        console.log(JSON.stringify(map));
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

    it("adapter_writeTable", async () => {
        adapter = new SingleFileAdapter(WRITABLE_PATH);
        await adapter.connect();

        const table = new JabTable<any>("writetable_test", new Map<string, JabEntry<any>>());
        await adapter.writeTable(table);

        expect(await adapter.readTable(table.name)).to.deep.equal(table);

        fs.unlinkSync(WRITABLE_PATH);
    })

    it("adapter_writeTable_notempty", async () => {
        adapter = new SingleFileAdapter(WRITABLE_PATH);
        const jsonPrefilled = fs.readFileSync(PREFILLED_PATH).toString();
        fs.writeFileSync(WRITABLE_PATH, jsonPrefilled, { flag: "w" });


        const readTable = await adapter.readTable("test_table");

        const testItem = new TestClass(100, "test_string");
        readTable.entries.set("2", new JabEntry("2", testItem));

        await adapter.writeTable(readTable);

        const newTable = await adapter.readTable("test_table")

        // expect(newTable.entries.size).to.equal(2);

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

    xit("getTable_cached", async () => {
        // TODO: WRITE A NEW TEST, TESTING THE CACHING
        db = new JabDB(new SingleFileAdapter(WRITABLE_PATH), { doCaching: true, cacheLifespan: 100000 });
        db.connect();

        const table = await db.createTable("cacheTest");

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

        _.set(map, entry.getId(), entry);

        table = new JabTable("test_JabTable", map);
    })

    it("get", () => {
        const obj = table.get(entry.getId());
        assert.equal(obj, testItem);
    })

    it("get_undefined", () => {
        assert.isUndefined(table.get("__notexisting__"));
    })

    it("find", () => {
        const obj = table.findFirst(v => v.string == testItem.string);
        assert.equal(obj, testItem);
    })
    
    it("find_undefined", () => {
        assert.isUndefined(table.findFirst(v=> v.string == "__notexisting__"))
    })

    it("create", () => {
        const obj = new TestClass(101);
        assert.isUndefined(table.get("test_create"));
        table.create(obj, "test_create");
        assert.isDefined(table.get("test_create"));
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
import chai, { assert, expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import { SingleFileAdapter } from "../src/adapters"
import _ from "lodash";
import { JabDBError, JabTableError, JabTableAlreadyExistsError } from "../src/errors";
import { Entry, Table } from "../src/model";
import { before, Test } from "mocha";
import JabTable from "../src/JabTable";
import fs, { existsSync } from "fs";
import JabDB from "../src/JabDB";

chai.use(chaiAsPromised);

const WRITABLE_PATH = 'data/test/writable.json';
const PREFILLED_PATH = 'data/test/prefilled.json';


function deleteWritableFile() {
    fs.unlinkSync(WRITABLE_PATH);
}


describe("SingleFileAdapter", () => {
    let adapter: SingleFileAdapter;

    let entry1: Entry;
    let entry2: Entry;

    context("# Reading", () => {

        beforeEach(() => {
            adapter = new SingleFileAdapter(PREFILLED_PATH, true);
            adapter.connect();
        })

        before(() => {
            entry1 = { id: "1", value: new TestClass(1) };
            entry2 = { id: "2", value: new TestClass(2) };
        })

        it("connect", function () {
            expect(adapter.connect()).to.eventually.not.be.rejectedWith(Error);
        })

        it("getTable_defined", async () => {
            assert.isDefined(await adapter.getTable("test_table"))
        })

        it("getTable_not_found", () => {
            expect(adapter.getTable("__notexisting__")).to.eventually.be.rejectedWith(JabDBError);
        })

        it("getTable_entries", async () => {
            const entries = (await adapter.getTable("test_table")).entries;

            expect(entries.size).to.not.eq(0);
        })


    })

    context("# Writing", () => {

        let prefilledWritableAdapter: SingleFileAdapter;

        beforeEach(async () => {
            adapter = new SingleFileAdapter(WRITABLE_PATH)
            await adapter.connect()
        })

        afterEach(() => {
            deleteWritableFile();
        })


        it("saveTable", async () => {
            const table = new Table("table1")
            await adapter.saveTable(table);

            const receivedTable = await adapter.getTable(table.name);

            expect(receivedTable).to.deep.eq(table);
        })

        it("saveTable_withEntry", async () => {
            const table = new Table("table1")
            _.set(table.entries, "1", new Entry("1", new TestClass(1)))
            await adapter.saveTable(table);

            const receivedTable = await adapter.getTable(table.name);

            expect(receivedTable).to.deep.eq(table);
        })


        it("removeTable", async () => {
            adapter = new SingleFileAdapter(WRITABLE_PATH)
            const jsonPrefilled = fs.readFileSync(PREFILLED_PATH).toString();
            fs.writeFileSync(WRITABLE_PATH, jsonPrefilled, { flag: "w" });

            assert.isDefined(await adapter.getTable("test_table2"));

            await adapter.deleteTable("test_table2");

            await expect(adapter.getTable("test_table2")).to.eventually.be.rejectedWith(JabDBError);
        })

        //TODO? More deleteTable tests?


    })





})


describe("JabTable", () => {
    let table: JabTable;

    context("# Reading", () => {
        before(() => {
            const adapter = new SingleFileAdapter(PREFILLED_PATH)
            adapter.connect();

            table = new JabTable("test_table", adapter);
        })


        it("get", async () => {
            assert.isDefined(await table.get("1"))
        })

        it("get_not_found", () => {
            expect(table.get("__not_found__")).to.eventually.be.rejectedWith(JabTableError)
        })

        it("findFirst", async () => {
            assert.isDefined(await table.findFirst<TestClass>((v) => v.string == "lorem"));
        })

        it("findFirst_not_found", async () => {
            expect(table.findFirst<TestClass>((v) => v.string == "__not_found__"))
                .to.eventually.be.rejectedWith(JabTableError)
        })

        it("findAll_defined", async () => {
            assert.isDefined(await table.findAll(v => v.string == "lorem"));
        })

        it("findAll_none", async () => {
            expect((await table.findAll(v => v.string == "__notexisting__")).length).to.equal(0);
        })

        it("findAll_length", async () => {
            expect((await table.findAll(v => v.string == "lorem")).length).to.equal(1);
        })

        it("findAll_two", async () => {
            const expected = [new TestClass(2, "ipsum"), new TestClass(2, "ipsum")]

            const found = await table.findAll(v => v.string == "ipsum");

            expect(found).to.deep.eq(expected);
        })

    })

    context("# Writing", () => {

        beforeEach(() => {
            const adapter = new SingleFileAdapter(WRITABLE_PATH)
            const jsonPrefilled = fs.readFileSync(PREFILLED_PATH).toString();
            fs.writeFileSync(WRITABLE_PATH, jsonPrefilled, { flag: "w" });

            table = new JabTable("test_table", adapter);
        })

        afterEach(() => {
            deleteWritableFile();
        })


        it("create", async () => {
            const id = await table.createEntry(new TestClass(5, "lorem ipsum"));

            assert.isDefined(await table.get(id))
        })

        it("create_generated_id", async () => {
            const id = await table.createEntry(new TestClass(5, "lorem ipsum"));

            assert.isDefined(await table.get(id))
        })

        it("create_generated_id_increments", async () => {
            const id = await table.createEntry(new TestClass(5, "lorem ipsum"));
            const id2 = await table.createEntry(new TestClass(5, "lorem ipsum"));

            expect(Number.parseInt(id)).to.be.lessThan(Number.parseInt(id2))
        })

        it("create_id_exists", async () => {
            const id = await table.createEntry(new TestClass(5, "lorem ipsum"), "3");

            expect(Number.parseInt(id)).to.be.greaterThan(Number.parseInt("3"))
        })

        it("put", async () => {
            const expected = new TestClass(1, "lorem ipsum");
            const id = "put_test";
            await table.put(id, expected);

            const received = await table.get(id);

            expect(received).to.exist
                .and.deep.equal(expected);
        })

        it("put_override", async () => {

            const notExpected = new TestClass(-5, "not expected");
            const expected = new TestClass(1, "lorem ipsum");
            const id = await table.createEntry(notExpected);

            console.log("ID: " + id)

            await table.put(id, expected);

            const received = await table.get(id);

            expect(received).to.exist
                .and.to.deep.equal(expected)
                .and.not.deep.equal(notExpected);

        })

        it("patch", async () => {
            const old = { "number": 1, "string": "lorem" };
            const expected = { "number": 5, "string": "patch" };

            await table.patch("1", { "number": 5 }, { "string": "patch" });

            expect(await table.get("1")).to.deep.equal(expected);
        })

        // TODO patch and patchWith tests

    })

})


describe("JabDB", () => {

    let database: JabDB;

    context("# Reading", () => {

        before(async () => {
            const adapter = new SingleFileAdapter(PREFILLED_PATH);
            database = new JabDB(adapter);
            await database.connect()
        })

        it("getTable", async () => {
            assert.isDefined(await database.getTable("test_table"))
        })

        it("getTable_not_found", async () => {
            expect(database.getTable("__not_found__")).to.eventually.be.rejectedWith(JabDBError);
        })
    })

    context("# Writing", () => {

        beforeEach(() => {
            const adapter = new SingleFileAdapter(WRITABLE_PATH)
            const jsonPrefilled = fs.readFileSync(PREFILLED_PATH).toString();
            fs.writeFileSync(WRITABLE_PATH, jsonPrefilled, { flag: "w" });

            database = new JabDB(adapter);
        })

        afterEach(() => {
            deleteWritableFile();
        })

        it("createTable", async () => {
            await database.createTable("new_table");
            assert.isDefined(await database.getTable("new_table"));
        })

        it("createTable_already_exists", async () => {
            await expect(database.createTable("test_table", false)).to.eventually.be.rejectedWith(JabTableAlreadyExistsError);
        })

        it("createTable_already_exists_returnOld", async () => {
            assert.isDefined(await database.createTable("test_table"));
        })

        it("createTable_already_exists_returnOld", async () => {
            assert.isDefined(await database.createTable("test_table"));
        })

    })
})


describe("Guide Tests", () => {

    let adapter: SingleFileAdapter;
    let db: JabDB;

    beforeEach(async () => {

        adapter = new SingleFileAdapter(WRITABLE_PATH);
        db = new JabDB(adapter);

        await db.connect()

    })

    afterEach(() => {
        deleteWritableFile();
    })


    it("Creating database", async () => {
        const adapter = new SingleFileAdapter(WRITABLE_PATH);
        const db = new JabDB(adapter);

        await db.connect()

        expect(existsSync(WRITABLE_PATH)).to.eq(true);
    })

    it("Creating table", async () => {
        const users = await db.createTable("users");

        expect(users).to.exist
            .and.be.instanceof(JabTable);
    })

    it("Getting table", async () => {
        await db.createTable("users");

        const users = await db.getTable("users")

        expect(users).to.exist
            .and.be.instanceof(JabTable);
    })

    it("Creating and getting entry", async () => {
        const users = await db.createTable("users");
        const expected = { name: "John Stone", age: 30 }

        const id = await users.createEntry(expected);

        const received = await users.get(id);

        expect(received).to.deep.equal(expected);

    })

    it("Creating entry ids", async () => {
        const users = await db.createTable("users");
        const expected = { name: "John Stone", age: 30 }
        const customID = "johnstone";

        const id1 = await users.createEntry(expected);
        const id2 = await users.createEntry(expected, customID);
        const id3 = await users.createEntry(expected, customID);


        expect(id1).to.equal("0");
        expect(id2).to.equal("johnstone");
        expect(id3).to.equal("1");
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

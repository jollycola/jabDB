import { assert } from "chai";
import SingleFileAdapter from "../src/adapters/SingleFileAdapter";
import JabTable from "../src/JabTable";
import JabEntry from "../src/JabEntry";


describe("SingleFileAdapter", ()=> {
    let adapter: SingleFileAdapter;

    beforeEach(()=>{
        adapter = new SingleFileAdapter("source.json");
    })
    
    xit("file not existing", ()=> {
        assert.throws(async ()=> await new SingleFileAdapter("_nonexisting_file_.json"));
    })

    it("readMeta", () => {
        adapter.readMeta();
    })

    it("readTable_type", async () => {
        const table = await adapter.readTable<test>("test_table");
        assert.typeOf(table, "object");

        console.log(table);
        
    });

    it("readTable", async ()=>{       
        const table = await adapter.readTable<test>("test_table");

        console.log(table instanceof JabTable);

        table.find((v) => v.getValue().getValue().number == 10);
    })


});

class test {
    number: number;
    streng: string;
}

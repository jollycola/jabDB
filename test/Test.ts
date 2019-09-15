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


    it("readTable", async ()=>{       
        const table = await adapter.readTable<test>("test_table");

        console.log(table);
    })


});

class test {
    number: number;
    streng: string;
}

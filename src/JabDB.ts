import Adapter from "./adapters/Adapter";
import JabTable from "./JabTable";

export default class JabDB {
    private adapter: Adapter;

    private meta: JabDBMeta;
    private tables: Map<string, JabTable<any>>;
    
    constructor(adapter: Adapter){
        this.adapter = adapter;
    }


}

export class JabDBMeta {
    amountOfTables: number;
}
import JabTable from "../JabTable";
import { JabDBMeta } from "../JabDB";

export default interface Adapter {

    readMeta(): Promise<JabDBMeta>;
    readTable(id: string): Promise<JabTable<any>>;
    write(): void;

}
export default class JabEntry {
    private id: string;
    private value: any;

    constructor(id: string, value: any){
        this.id = id;
        this.value = value;
    }
    
    getValue() {
        return this.value;
    }

    getId() {
        return this.id;
    }

}
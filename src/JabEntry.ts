export default class JabEntry<T> {
    private id: string;
    private value: T;

    constructor(id: string, value: T){
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
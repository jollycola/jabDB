export default class JabEntry<T> {
    private id: string;
    private value: T;
    

    getValue() {
        return this.value;
    }

    getId() {
        return this.id;
    }

}
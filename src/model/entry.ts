export class Entry {
    id: string;
    value: any;

    constructor(id: string, value: any) {
        this.id = id;
        this.value = value;
    }

    public static isEntry(object: any): object is Entry {

        return (
            'name' in object && typeof object.name == "string" &&
            'entries' in object && typeof object.value == "object")

    }
}
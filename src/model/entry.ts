export class Entry {
    id: string;
    value: any;

    constructor(id: string, value: any) {
        this.id = id;
        this.value = value;
    }

    public static isEntry(object: any): object is Entry {
        return (
            'id' in object && typeof object.id === 'string' &&
            'value' in object && typeof object.value === 'object')

    }
}
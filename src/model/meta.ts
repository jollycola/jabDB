/**
 * @hidden
 */
export class Meta {

    public static isMeta(object: any): object is Meta {
        return (Object.keys(object).length == 0);
    }


}
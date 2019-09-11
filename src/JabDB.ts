import _ from "lodash";
import Adapter from "./adapters/Adapter";

export default class JabDB <T> {
    
    private adapter: Adapter;
    
    constructor(adapter: Adapter){
        this.adapter = adapter;
    }


    public get(): T {

        this.adapter

    }

}
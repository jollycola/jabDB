export class MalformedSourceFileError extends Error { }
export class IOError extends Error { }
export class JabTableError extends Error { }
export class JabDBError extends Error { }
export class JabTableNotFoundError extends JabDBError {
    id: string;

    constructor(id: string) {
        super("No table with id '" + id + "' found!")
    }
}
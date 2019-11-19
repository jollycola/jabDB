/**
 * Thrown when a source file is malformed
 * @category JabError
 * @extends {Error}
 */
export class MalformedSourceFileError extends Error { }

/**
 * Thrown when an IO error has happened
 * @category JabError
 * @extends {Error}
 */
export class IOError extends Error { }

/**
 * Thrown when an error has happened in a JabTable
 * @category JabError
 * @extends {Error}
 */
export class JabTableError extends Error { }

/**
 * Thrown when an error has happened in a JabDB
 * @category JabError
 * @extends {Error}
 */
export class JabDBError extends Error { }

/**
 * Thrown when the table searched for was not found
 * @category JabError
 * @extends {JabDBError}
 */
export class JabTableNotFoundError extends JabDBError {
    /**
     * The id of the table that was not found
     * @type {string}
     */
    id: string;

    constructor(id: string) {
        super("No table with id '" + id + "' found!");
    }
}

export class JabTableAlreadyExistsError extends JabDBError {
    /**
     * The id of the table that was not found
     * @type {string}
     */
    id: string;

    constructor(id: string) {
        super("A table with id '" + id + "' already exists!!");
    }
}
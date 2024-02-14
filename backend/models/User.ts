export class User {
    constructor(public id: string, public username: string, public password: string) {}
}

export class UserCreate {
    constructor(public username: string, public password: string) {}
}
 
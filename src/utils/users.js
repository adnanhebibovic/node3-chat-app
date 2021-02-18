class User {
    constructor() {
        this.users = []
    }

    add(user) {
        const found = this.users.find(u => u.user === user)
        if (!found) {
            this.users.push({ user })
        }
        return this.users
    }

    remove(user) {
        return this.users.filter(u => u.user !== user)
    }
}

module.exports = User
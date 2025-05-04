class MemoryStore {
    constructor() {
        this.users = new Map();
    }

    async findOne(query) {
        if (query.email) {
            return Array.from(this.users.values()).find(user => user.email === query.email);
        }
        if (query.verificationToken) {
            return Array.from(this.users.values()).find(user => 
                user.verificationToken === query.verificationToken && 
                user.verificationTokenExpires > Date.now()
            );
        }
        if (query.resetPasswordToken) {
            return Array.from(this.users.values()).find(user => 
                user.resetPasswordToken === query.resetPasswordToken && 
                user.resetPasswordExpires > Date.now()
            );
        }
        return null;
    }

    async findById(id) {
        return this.users.get(id);
    }

    async save(user) {
        if (!user._id) {
            user._id = Math.random().toString(36).substr(2, 9);
        }
        this.users.set(user._id, user);
        return user;
    }
}

module.exports = new MemoryStore();
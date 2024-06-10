module.exports = {
    name: Events.GuildMemberAdd,
    
    /**
     * Executes the GuildMemberAdd event.
     * @param {GuildMember} member - The member who joined the guild.
     * @returns {Promise<void>}
     */
    async execute(member) {
        const dbPath = path.join(__dirname, '../Database/Databases/config/autorole.db');
        const db = new Helper(dbPath);

        await db.run(`
            CREATE TABLE IF NOT EXISTS autorole (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                server_id TEXT NOT NULL,
                enabled BOOLEAN NOT NULL,
                autorole_id TEXT NOT NULL
            );
        `).catch(error => {
            console.error(`Error creating table: ${error.message}`);
        });

        const query = `SELECT autorole_id FROM autorole WHERE server_id = ? AND enabled = ?`;
        const params = [member.guild.id, true];
        const result = await db.get(query, params).catch(error => {
            console.error(`Error fetching autorole data: ${error.message}`);
        });

        if (result?.data?.autorole_id) {
            const roleId = result.data.autorole_id;
            const role = member.guild.roles.cache.get(roleId);
        
            if (role) {
                member.roles.add(role)
                    .catch(error => {
                        console.error(`Failed to assign role to ${member.user.tag}: ${error}`);
                    });
            } else {
                console.error(`Role with ID ${roleId} not found.`);
            }
        } else {
            await db.close().catch(error => {
                console.error(`Error closing database: ${error.message}`);
            });
            return;
        }

        await db.close().catch(error => {
            console.error(`Error closing database: ${error.message}`);
        });
    },
};

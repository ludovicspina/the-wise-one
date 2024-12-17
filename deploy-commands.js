const { REST, Routes } = require('discord.js');
const { clientId, guildId, token } = require('./config.json');
const fs = require('node:fs');
const path = require('node:path');

const commands = [];
// Récupérer tous les dossiers de commandes du répertoire features
const foldersPath = path.join(__dirname, 'features');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    // Récupérer tous les fichiers de commandes du répertoire features
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON());
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

// Préparer une instance du module REST
const rest = new REST().setToken(token);

// Déployer les commandes dans le serveur spécifique
(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        // Le put est utilisé pour rafraîchir toutes les commandes d'application du serveur
        const data = await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands },
        );

        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        console.error(error);
    }
})();

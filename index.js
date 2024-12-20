const fs = require('node:fs');
const path = require('node:path');
const {Client, Events, GatewayIntentBits, Collection, AttachmentBuilder} = require('discord.js');
const sequelize = require('./database/database');
const foldersPath = path.join(__dirname, 'features');
const commandFolders = fs.readdirSync(foldersPath);
const DeiUtilisateur = require('./database/models/dei_utilisateurs.js');
const DeiRoyaume = require('./database/models/dei_royaumes');
const DeiVille = require('./database/models/dei_villes');
const DeiEmplacement = require('./database/models/dei_emplacements');
const DeiTransaction = require('./database/models/dei_transactions');

require("dotenv").config();

// Intents
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,  // Si vous voulez traiter le contenu des messages
        GatewayIntentBits.GuildMembers  // Si vous avez besoin d'accéder aux membres
    ],

});

// Relations
DeiUtilisateur.hasMany(DeiRoyaume, { foreignKey: 'utilisateur_id' });
DeiRoyaume.belongsTo(DeiUtilisateur, { foreignKey: 'utilisateur_id' });

DeiRoyaume.hasMany(DeiVille, { foreignKey: 'royaume_id' });
DeiVille.belongsTo(DeiRoyaume, { foreignKey: 'royaume_id' });

DeiVille.hasMany(DeiEmplacement, { foreignKey: 'ville_id' });
DeiEmplacement.belongsTo(DeiVille, { foreignKey: 'ville_id' });

DeiUtilisateur.hasMany(DeiTransaction, { foreignKey: 'utilisateur_id' });
DeiTransaction.belongsTo(DeiUtilisateur, { foreignKey: 'utilisateur_id' });

module.exports = {
    DeiUtilisateur,
    DeiRoyaume,
    DeiVille,
    DeiEmplacement,
    DeiTransaction,
};


// Syncro DB
sequelize.sync().then(() => {
    console.log('Base de données synchronisée');
}).catch(err => {
    console.error('Erreur lors de la synchronisation de la base de données :', err);
});

// Initialisation des commandes
client.commands = new Collection();
for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        // Set a new item in the Collection with the key as the command name and the value as the exported module
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

// Vérification des interactions
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'Une erreur est survenue lors de l\'exécution de cette commande.', ephemeral: true });
        } else {
            await interaction.reply({ content: 'Une erreur est survenue lors de l\'exécution de cette commande.', ephemeral: true });
        }
    }
});


// Initialisation en DB des serveurs
client.on('guildCreate', async (guild) => {
    // Vérifie si la guild existe déjà dans la base de données
    const existingGuild = await Guild.findOne({ where: { id: guild.id } });

    if (!existingGuild) {
        // Si la guild n'existe pas, on la crée
        await Guild.create({
            id: guild.id,
            name: guild.name,
        });

        // Initialiser les commandes avec un statut activé par défaut
        const commands = client.commands.map(command => ({
            guildId: guild.id,
            commandName: command.data.name,
            enabled: true,  // Toutes les commandes activées par défaut
        }));

        await CommandSettings.bulkCreate(commands);
    }
});



client.on('messageCreate', async (message) => {
    // Empêche le bot de répondre à ses propres messages
    if (message.author.bot) return;

    // Vérifie si le message mentionne le bot
    if (message.mentions.has(client.user)) {
        // Crée une pièce jointe avec le GIF local
        const gifPath = path.join(__dirname, 'images/ooze.gif'); // Remplacez 'monGif.gif' par le nom de votre fichier
        const attachment = new AttachmentBuilder(gifPath);

        await message.reply({ files: [attachment] });
    }
});


// Ready up
client.once(Events.ClientReady, readyClient => {
    console.log(`Up as ${readyClient.user.tag}`);
});

client.login(process.env.DISCORD_TOKEN);
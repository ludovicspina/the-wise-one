const { SlashCommandBuilder } = require('discord.js');
const DeiUtilisateur = require('../../database/models/dei_utilisateurs');
const DeiRoyaume = require('../../database/models/dei_royaumes');
const DeiVille = require('../../database/models/dei_villes');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('royaume')
        .setDescription('Gérez votre royaume')
        .addSubcommand(subcommand =>
            subcommand
                .setName('create')
                .setDescription('Créez un nouveau royaume')
                .addStringOption(option =>
                    option.setName('nom')
                        .setDescription('Le nom de votre royaume')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('capitale')
                        .setDescription('Le nom de la ville qui sera votre capitale')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('edit')
                .setDescription('Modifiez le nom de votre royaume')
                .addStringOption(option =>
                    option.setName('nom')
                        .setDescription('Le nouveau nom de votre royaume')
                        .setRequired(true))),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const userId = interaction.user.id;
        const username = interaction.user.username;

        try {
            // Récupère ou crée l'utilisateur
            let utilisateur = await DeiUtilisateur.findOne({ where: { id: userId } });

            if (!utilisateur) {
                utilisateur = await DeiUtilisateur.create({ id: userId, nom_rp: username, pieces_or: 100000, nourriture: 1000, pierre: 1000, bois: 1000 });
            }

            if (subcommand === 'create') {
                const nomRoyaume = interaction.options.getString('nom');
                const nomCapitale = interaction.options.getString('capitale');

                // Vérifie si l'utilisateur a déjà un royaume
                const royaumeExiste = await DeiRoyaume.findOne({ where: { utilisateur_id: userId } });

                if (royaumeExiste) {
                    return interaction.reply({ content: 'Vous avez déjà un royaume.', ephemeral: true });
                }

                // Crée le royaume
                const nouveauRoyaume = await DeiRoyaume.create({
                    utilisateur_id: userId,
                    nom_royaume: nomRoyaume,
                });

                // Crée la ville en tant que capitale
                await DeiVille.create({
                    royaume_id: nouveauRoyaume.id,
                    nom_ville: nomCapitale,
                    capitale: true,
                    revenu_quotidien: 1000,
                });

                return interaction.reply({ content: `Le royaume "${nomRoyaume}" avec la capitale "${nomCapitale}" a été créé avec succès !`, ephemeral: true });

            }
            else if (subcommand === 'edit') {
                const nouveauNom = interaction.options.getString('nom');

                // Vérifie si l'utilisateur possède un royaume
                const royaume = await DeiRoyaume.findOne({ where: { utilisateur_id: userId } });

                if (!royaume) {
                    return interaction.reply({ content: 'Vous ne possédez pas de royaume à modifier.', ephemeral: true });
                }

                // Met à jour le nom du royaume
                royaume.nom_royaume = nouveauNom;
                await royaume.save();

                return interaction.reply({ content: `Le nom de votre royaume a été modifié en "${nouveauNom}".`, ephemeral: true });
            }

        } catch (error) {
            console.error(error);
            return interaction.reply({ content: 'Une erreur est survenue lors de l\'exécution de la commande.', ephemeral: true });
        }
    },
};

const { SlashCommandBuilder, StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');
const DeiUtilisateur = require('../../database/models/dei_utilisateurs');
const DeiRoyaume = require('../../database/models/dei_royaumes');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('royaume')
        .setDescription('Crée ou édite un royaume')
        .addStringOption(option =>
            option.setName('action')
                .setDescription('Choisir une action')
                .setRequired(true)
                .addChoices(
                    { name: 'Créer un royaume', value: 'create' },
                    { name: 'Éditer le royaume', value: 'edit' }
                ))
        .addStringOption(option =>
            option.setName('nom')
                .setDescription('Le nom du royaume')
                .setRequired(true)
        ),

    async execute(interaction) {
        const action = interaction.options.getString('action');
        const nom = interaction.options.getString('nom');
        const userId = interaction.user.id;

        try {
            // Vérifie si l'utilisateur existe dans la base de données
            let utilisateur = await DeiUtilisateur.findOne({ where: { id: userId } });

            if (!utilisateur) {
                // Créer l'utilisateur s'il n'existe pas encore
                utilisateur = await DeiUtilisateur.create({ id: userId, nom_rp: interaction.user.username });
            }

            if (action === 'create') {
                // Vérifie si l'utilisateur possède déjà un royaume
                const existingRoyaume = await DeiRoyaume.findOne({ where: { utilisateur_id: userId } });

                if (existingRoyaume) {
                    return interaction.reply({ content: 'Vous possédez déjà un royaume.', ephemeral: true });
                }

                // Crée un nouveau royaume
                await DeiRoyaume.create({
                    utilisateur_id: userId,
                    nom_royaume: nom,
                });

                return interaction.reply({ content: `Votre royaume "${nom}" a été créé avec succès!`, ephemeral: true });

            } else if (action === 'edit') {
                // Vérifie si l'utilisateur possède un royaume
                const existingRoyaume = await DeiRoyaume.findOne({ where: { utilisateur_id: userId } });

                if (!existingRoyaume) {
                    return interaction.reply({ content: 'Vous ne possédez pas de royaume à éditer.', ephemeral: true });
                }

                // Met à jour le nom du royaume
                existingRoyaume.nom_royaume = nom;
                await existingRoyaume.save();

                return interaction.reply({ content: `Votre royaume a été renommé en "${nom}".`, ephemeral: true });
            }
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: 'Une erreur est survenue.', ephemeral: true });
        }
    },
};

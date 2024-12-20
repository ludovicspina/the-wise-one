const { SlashCommandBuilder } = require('discord.js');
const DeiUtilisateur = require('../../database/models/dei_utilisateurs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ressources')
        .setDescription('Consultez vos ressources actuelles'),

    async execute(interaction) {
        const userId = interaction.user.id;
        const username = interaction.user.username;

        try {
            // Récupère ou crée l'utilisateur
            let utilisateur = await DeiUtilisateur.findOne({ where: { id: userId } });

            if (!utilisateur) {
                utilisateur = await DeiUtilisateur.create({ id: userId, nom_rp: username });
            }

            const { bois, nourriture, pierre, pieces_or } = utilisateur;

            return interaction.reply({
                content: `Vos ressources actuelles :\n\n<:gs_coin:1319679652481994752> **Pièces d'or** : ${pieces_or}\n<:gs_stick:1319679605417840700> **Bois** : ${bois}\n<:gs_bread:1319679637395079188> **Nourriture** : ${nourriture}\n<:gs_rock:1319679707079245906> **Pierre** : ${pierre}`,
                ephemeral: true,
            });

        } catch (error) {
            console.error(error);
            return interaction.reply({ content: 'Une erreur est survenue lors de la consultation de vos ressources.', ephemeral: true });
        }
    },
};

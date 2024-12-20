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
                content: `Vos ressources actuelles :\n\n💰 **Pièces d'or** : ${pieces_or}\n🪵 **Bois** : ${bois}\n🍖 **Nourriture** : ${nourriture}\n🪨 **Pierre** : ${pierre}`,
                ephemeral: true,
            });

        } catch (error) {
            console.error(error);
            return interaction.reply({ content: 'Une erreur est survenue lors de la consultation de vos ressources.', ephemeral: true });
        }
    },
};

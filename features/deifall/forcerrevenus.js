const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { updateDailyIncome } = require('../../tasks/dailyIncome');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('forcerrevenus')
        .setDescription('Force l\'exécution de la mise à jour des revenus et ressources')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), // Restriction aux administrateurs

    async execute(interaction) {
        // Vérifie si l'utilisateur est administrateur
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ content: 'Vous n\'avez pas la permission d\'utiliser cette commande.', ephemeral: true });
        }

        try {
            await interaction.reply({ content: 'Mise à jour des revenus et ressources en cours...', ephemeral: true });
            await updateDailyIncome();
            await interaction.followUp({ content: 'Mise à jour des revenus et ressources terminée avec succès.', ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.followUp({ content: 'Une erreur est survenue lors de la mise à jour des revenus et ressources.', ephemeral: true });
        }
    },
};

const { SlashCommandBuilder, PermissionsBitField} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('loot')
        .setDescription("Prépare le loot pour la distribution."),
    async execute(interaction) {
        try {
            // Vérification des permissions d'administrateur
            const { PermissionsBitField } = require('discord.js');

            if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                return interaction.reply({ content: 'Seuls les administrateurs peuvent utiliser cette commande.', ephemeral: true });
            }

            // Informer l'utilisateur de fournir les pièces jointes après la commande
            await interaction.reply({
                content: "Envoyez les images du loot en pièces jointes dans ce salon.",
                ephemeral: true,
            });

            // Filtrer les messages avec des pièces jointes de l'utilisateur qui a exécuté la commande
            const filter = msg => msg.author.id === interaction.user.id && msg.attachments.size > 0;

            // Collecteur de messages (temps limite : 30 secondes)
            const collector = interaction.channel.createMessageCollector({ filter, time: 30000 });

            collector.on('collect', async (message) => {
                for (const attachment of message.attachments.values()) {
                    // Envoyer chaque image avec des réactions
                    const sentMessage = await interaction.channel.send({
                        files: [{ attachment: attachment.url }],
                    });

                    // Réactions aux messages envoyés
                    const sword = '1296498004852740198'; // ID de l'émoji personnalisé "épée"
                    const book = '1296498033311350925'; // ID de l'émoji personnalisé "livre"

                    await sentMessage.react(sword);
                    await sentMessage.react(book);
                }

                // Supprimer le message de l'utilisateur après traitement
                await message.delete().catch(err => console.error(`Impossible de supprimer le message : ${err}`));
            });

            collector.on('end', () => {
                interaction.followUp({
                    content: "Traitement des images terminé. Les messages ont été supprimés.",
                    ephemeral: true,
                });
            });

        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: 'Une erreur est survenue lors du traitement des pièces jointes.',
                ephemeral: true,
            });
        }
    },
};

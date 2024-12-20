const { SlashCommandBuilder } = require('discord.js');
const DeiUtilisateur = require('../../database/models/dei_utilisateurs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ressources')
        .setDescription('Consultez vos ressources ou donnez des ressources à un autre utilisateur')
        .addSubcommand(subcommand =>
            subcommand
                .setName('consulter')
                .setDescription('Consultez vos ressources actuelles')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('donner')
                .setDescription('Donner des ressources à un autre utilisateur')
                .addUserOption(option =>
                    option.setName('destinataire')
                        .setDescription('L’utilisateur à qui vous souhaitez donner des ressources')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('type')
                        .setDescription('Le type de ressource à donner')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Pièces d\'or', value: 'pieces_or' },
                            { name: 'Bois', value: 'bois' },
                            { name: 'Pierre', value: 'pierre' },
                            { name: 'Nourriture', value: 'nourriture' }
                        )
                )
                .addIntegerOption(option =>
                    option.setName('montant')
                        .setDescription('Le montant de ressources à donner')
                        .setRequired(true)
                )
        ),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const userId = interaction.user.id;
        const username = interaction.user.username;

        try {
            // Récupère ou crée l'utilisateur
            let utilisateur = await DeiUtilisateur.findOne({ where: { id: userId } });

            if (!utilisateur) {
                utilisateur = await DeiUtilisateur.create({ id: userId, nom_rp: username });
            }

            if (subcommand === 'consulter') {
                // Affiche les ressources de l'utilisateur
                const { bois, nourriture, pierre, pieces_or } = utilisateur;

                return interaction.reply({
                    content: `Vos ressources actuelles :\n\n<:gs_coin:1319679652481994752> **Pièces d'or** : ${pieces_or}\n<:gs_stick:1319679605417840700> **Bois** : ${bois}\n<:gs_bread:1319679637395079188> **Nourriture** : ${nourriture}\n<:gs_rock:1319679707079245906> **Pierre** : ${pierre}`,
                    ephemeral: true,
                });
            }

            if (subcommand === 'donner') {
                const destinataire = interaction.options.getUser('destinataire');
                const typeRessource = interaction.options.getString('type');
                const montant = interaction.options.getInteger('montant');

                if (montant <= 0) {
                    return interaction.reply({ content: 'Le montant doit être supérieur à zéro.', ephemeral: true });
                }

                // Récupère ou crée le destinataire
                let utilisateurDestinataire = await DeiUtilisateur.findOne({ where: { id: destinataire.id } });

                if (!utilisateurDestinataire) {
                    utilisateurDestinataire = await DeiUtilisateur.create({ id: destinataire.id, nom_rp: destinataire.username });
                }

                // Vérifie si l'utilisateur a assez de ressources
                if (utilisateur[typeRessource] < montant) {
                    return interaction.reply({ content: `Vous n'avez pas assez de ${typeRessource} pour effectuer ce don.`, ephemeral: true });
                }

                // Effectue le transfert de ressources
                utilisateur[typeRessource] -= montant;
                utilisateurDestinataire[typeRessource] += montant;

                await utilisateur.save();
                await utilisateurDestinataire.save();

                // Confirmation du don
                return interaction.reply({
                    content: `Vous avez donné ${montant} ${typeRessource} à ${destinataire.username}.`,
                    ephemeral: true,
                });
            }

        } catch (error) {
            console.error(error);
            return interaction.reply({ content: 'Une erreur est survenue lors de l\'exécution de la commande.', ephemeral: true });
        }
    },
};

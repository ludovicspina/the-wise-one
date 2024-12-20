const { SlashCommandBuilder } = require('discord.js');
const DeiUtilisateur = require('../../database/models/dei_utilisateurs');
const DeiTransaction = require('../../database/models/dei_transactions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('piece')
        .setDescription('Consultez votre solde ou donnez des pièces à un autre membre')
        .addSubcommand(subcommand =>
            subcommand
                .setName('solde')
                .setDescription('Consultez votre solde de pièces d\'or'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('donner')
                .setDescription('Donnez des pièces d\'or à un autre membre')
                .addUserOption(option =>
                    option.setName('membre')
                        .setDescription('Le membre à qui donner des pièces')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('montant')
                        .setDescription('Le montant de pièces à donner')
                        .setRequired(true))),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const userId = interaction.user.id;
        const username = interaction.user.username;

        try {
            // Récupère ou crée l'utilisateur actuel
            let utilisateur = await DeiUtilisateur.findOne({ where: { id: userId } });
            if (!utilisateur) {
                utilisateur = await DeiUtilisateur.create({ id: userId, nom_rp: username });
            }

            if (subcommand === 'solde') {
                // Affiche le solde de l'utilisateur
                return interaction.reply({ content: `Vous avez actuellement ${utilisateur.pieces_or} pièces d'or.`, ephemeral: true });

            } else if (subcommand === 'donner') {
                const destinataire = interaction.options.getUser('membre');
                const montant = interaction.options.getInteger('montant');

                // Vérifie que le montant est positif
                if (montant <= 0) {
                    return interaction.reply({ content: 'Le montant doit être supérieur à 0.', ephemeral: true });
                }

                // Vérifie que l'utilisateur a assez de pièces
                if (utilisateur.pieces_or < montant) {
                    return interaction.reply({ content: 'Vous n\'avez pas assez de pièces d\'or pour effectuer cette transaction.', ephemeral: true });
                }

                // Récupère ou crée le destinataire
                let utilisateurDestinataire = await DeiUtilisateur.findOne({ where: { id: destinataire.id } });
                if (!utilisateurDestinataire) {
                    utilisateurDestinataire = await DeiUtilisateur.create({ id: destinataire.id, nom_rp: destinataire.username });
                }

                // Effectue la transaction
                utilisateur.pieces_or -= montant;
                utilisateurDestinataire.pieces_or += montant;

                await utilisateur.save();
                await utilisateurDestinataire.save();

                // Enregistre la transaction pour l'expéditeur
                await DeiTransaction.create({
                    utilisateur_id: userId,
                    type_transaction: 'piece_transfer_out',
                    montant: -montant,
                    description: `Transfert de ${montant} pièces d'or à ${destinataire.username}`,
                });

                // Enregistre la transaction pour le destinataire
                await DeiTransaction.create({
                    utilisateur_id: destinataire.id,
                    type_transaction: 'piece_transfer_in',
                    montant: montant,
                    description: `Réception de ${montant} pièces d'or de ${username}`,
                });

                return interaction.reply({ content: `Vous avez donné ${montant} pièces d'or à ${destinataire.username}.`, ephemeral: true });
            }

        } catch (error) {
            console.error(error);
            return interaction.reply({ content: 'Une erreur est survenue lors de l\'exécution de la commande.', ephemeral: true });
        }
    },
};

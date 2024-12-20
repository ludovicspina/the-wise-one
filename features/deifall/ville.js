const { SlashCommandBuilder } = require('discord.js');
const DeiUtilisateur = require('../../database/models/dei_utilisateurs');
const DeiRoyaume = require('../../database/models/dei_royaumes');
const DeiVille = require('../../database/models/dei_villes');
const DeiTransaction = require('../../database/models/dei_transactions'); // Import du modèle des transactions

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ville')
        .setDescription('Créer, éditer ou supprimer une ville')
        .addStringOption(option =>
            option.setName('action')
                .setDescription('Choisir une action')
                .setRequired(true)
                .addChoices(
                    { name: 'Créer une ville', value: 'create' },
                    { name: 'Éditer une ville', value: 'edit' },
                    { name: 'Supprimer une ville', value: 'delete' }
                ))
        .addStringOption(option =>
            option.setName('nom')
                .setDescription('Le nom de la ville')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('nom_ville')
                .setDescription('Le nom de la ville existante pour éditer ou supprimer')
                .setRequired(false)
        ),

    async execute(interaction) {
        const action = interaction.options.getString('action');
        const nomVille = interaction.options.getString('nom');
        const nomVilleExistant = interaction.options.getString('nom_ville');
        const userId = interaction.user.id;

        try {
            // Vérifie si l'utilisateur existe
            const utilisateur = await DeiUtilisateur.findOne({ where: { id: userId } });

            if (!utilisateur) {
                return interaction.reply({ content: 'Vous devez être enregistré pour utiliser cette commande.', ephemeral: true });
            }

            // Vérifie si l'utilisateur possède un royaume
            const royaume = await DeiRoyaume.findOne({ where: { utilisateur_id: userId } });

            if (!royaume) {
                return interaction.reply({ content: 'Vous devez posséder un royaume pour gérer des villes.', ephemeral: true });
            }

            if (action === 'create') {
                // Vérifie si l'utilisateur a assez de pièces d'or
                const coutCreation = 10000;
                if (utilisateur.pieces_or < coutCreation) {
                    return interaction.reply({ content: 'Vous n\'avez pas assez de pièces d\'or pour créer une ville. (Coût: 10000 pièces d\'or)', ephemeral: true });
                }

                // Crée une nouvelle ville avec un revenu par défaut de 1000
                await DeiVille.create({
                    royaume_id: royaume.id,
                    nom_ville: nomVille,
                    revenu_quotidien: 1000,
                });

                // Déduit 10000 pièces d'or à l'utilisateur
                utilisateur.pieces_or -= coutCreation;
                await utilisateur.save();

                // Enregistre la transaction de création
                await DeiTransaction.create({
                    utilisateur_id: userId,
                    type_transaction: 'city_create',
                    montant: -coutCreation,
                    description: `Création de la ville "${nomVille}"`,
                });

                return interaction.reply({ content: `La ville "${nomVille}" a été créée avec succès ! Vous avez dépensé 10000 pièces d'or.`, ephemeral: true });

            } else if (action === 'edit') {
                // Vérifie si une ville avec le nom donné existe
                const ville = await DeiVille.findOne({ where: { nom_ville: nomVilleExistant, royaume_id: royaume.id } });

                if (!ville) {
                    return interaction.reply({ content: `La ville "${nomVilleExistant}" n'existe pas ou ne vous appartient pas.`, ephemeral: true });
                }

                // Met à jour le nom de la ville
                ville.nom_ville = nomVille;
                await ville.save();

                return interaction.reply({ content: `La ville "${nomVilleExistant}" a été renommée en "${nomVille}".`, ephemeral: true });

            } else if (action === 'delete') {
                // Vérifie si une ville avec le nom donné existe
                const ville = await DeiVille.findOne({ where: { nom_ville: nomVilleExistant, royaume_id: royaume.id } });

                if (!ville) {
                    return interaction.reply({ content: `La ville "${nomVilleExistant}" n'existe pas ou ne vous appartient pas.`, ephemeral: true });
                }

                // Supprime la ville
                await ville.destroy();

                // Rembourse 5000 pièces d'or à l'utilisateur
                const remboursement = 5000;
                utilisateur.pieces_or += remboursement;
                await utilisateur.save();

                // Enregistre la transaction de suppression
                await DeiTransaction.create({
                    utilisateur_id: userId,
                    type_transaction: 'city_delete',
                    montant: remboursement,
                    description: `Suppression de la ville "${nomVilleExistant}"`,
                });

                return interaction.reply({ content: `La ville "${nomVilleExistant}" a été supprimée. Vous avez récupéré 5000 pièces d'or.`, ephemeral: true });
            }

        } catch (error) {
            console.error(error);
            return interaction.reply({ content: 'Une erreur est survenue lors de l\'exécution de la commande.', ephemeral: true });
        }
    },
};

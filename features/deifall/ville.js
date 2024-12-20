const { SlashCommandBuilder } = require('discord.js');
const DeiUtilisateur = require('../../database/models/dei_utilisateurs');
const DeiRoyaume = require('../../database/models/dei_royaumes');
const DeiVille = require('../../database/models/dei_villes');
const DeiEmplacement = require('../../database/models/dei_emplacements');
const DeiBatiment = require('../../database/models/dei_batiments');
const DeiTransaction = require("../../database/models/dei_transactions");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ville')
        .setDescription('Créer, éditer, supprimer une ville ou voir son statut')
        .addStringOption(option =>
            option.setName('action')
                .setDescription('Choisir une action')
                .setRequired(true)
                .addChoices(
                    { name: 'Créer une ville', value: 'create' },
                    { name: 'Éditer une ville', value: 'edit' },
                    { name: 'Supprimer une ville', value: 'delete' },
                    { name: 'Statut des villes', value: 'status' },
                    { name: 'Amélioration des villes', value: 'upgrade' }
                ))
        .addStringOption(option =>
            option.setName('nom')
                .setDescription('Le nom de la ville')
                .setRequired(false)
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


            // Autres actions : create, edit, delete
            if (action === 'create') {
                // Vérifie si l'utilisateur a assez de pièces d'or
                const coutCreation = 10000;
                if (utilisateur.pieces_or < coutCreation) {
                    return interaction.reply({ content: 'Vous n\'avez pas assez de pièces d\'or pour créer une ville. (Coût: 10000 pièces d\'or)', ephemeral: true });
                }

                // Crée une nouvelle ville avec un revenu par défaut de 400
                await DeiVille.create({
                    royaume_id: royaume.id,
                    nom_ville: nomVille,
                    revenu_quotidien: 400,
                });

                utilisateur.pieces_or -= coutCreation;
                await utilisateur.save();

                return interaction.reply({ content: `La ville "${nomVille}" a été créée avec succès ! Vous avez dépensé 10000 pièces d'or.`, ephemeral: true });
            }

            if (action === 'edit') {
                const ville = await DeiVille.findOne({ where: { nom_ville: nomVilleExistant, royaume_id: royaume.id } });

                if (!ville) {
                    return interaction.reply({ content: `La ville "${nomVilleExistant}" n'existe pas ou ne vous appartient pas.`, ephemeral: true });
                }

                ville.nom_ville = nomVille;
                await ville.save();

                return interaction.reply({ content: `La ville "${nomVilleExistant}" a été renommée en "${nomVille}".`, ephemeral: true });
            }

            if (action === 'delete') {
                const ville = await DeiVille.findOne({ where: { nom_ville: nomVilleExistant, royaume_id: royaume.id } });

                if (!ville) {
                    return interaction.reply({ content: `La ville "${nomVilleExistant}" n'existe pas ou ne vous appartient pas.`, ephemeral: true });
                }

                await ville.destroy();

                utilisateur.pieces_or += 5000;
                await utilisateur.save();

                return interaction.reply({ content: `La ville "${nomVilleExistant}" a été supprimée. Vous avez récupéré 5000 pièces d'or.`, ephemeral: true });
            }

            if (action === 'status') {
                const villes = await DeiVille.findAll({
                    where: { royaume_id: royaume.id },
                    include: [
                        {
                            model: DeiEmplacement,
                            include: [{ model: DeiBatiment }]
                        }
                    ]
                });

                if (villes.length === 0) {
                    return interaction.reply({ content: 'Vous n\'avez aucune ville.', ephemeral: true });
                }

                let message = `🏰 **Statut de vos villes :**\n\n`;

                for (const ville of villes) {
                    message += `🏙️ **${ville.nom_ville}** (Niveau : ${ville.niveau}, Revenu quotidien : ${ville.revenu_quotidien} pièces d'or)\n`;

                    if (ville.capitale) {
                        message += `🏰 **Capitale**\n`;
                    }

                    for (const emplacement of ville.dei_emplacements) {
                        const batiment = emplacement.dei_batiment || emplacement.DeiBatiment;
                        if (batiment) {
                            message += `  🏢 **${batiment.nom_batiment}** (Type : ${batiment.type}, Niveau : ${emplacement.niveau})\n`;
                        } else {
                            message += `  🚧 Emplacement libre : ${emplacement.nom_emplacement}\n`;
                        }
                    }

                    message += `\n`;
                }

                return interaction.reply({ content: message, ephemeral: false });
            }

            if (action === 'upgrade') {
                if (!nomVilleExistant) {
                    return interaction.reply({ content: 'Vous devez spécifier le nom de la ville à améliorer.', ephemeral: true });
                }

                const ville = await DeiVille.findOne({ where: { nom_ville: nomVilleExistant, royaume_id: royaume.id } });
                if (!ville) {
                    return interaction.reply({ content: `La ville "${nomVilleExistant}" n'existe pas ou ne vous appartient pas.`, ephemeral: true });
                }

                if (ville.niveau >= 3) {
                    return interaction.reply({ content: `La ville "${nomVilleExistant}" a déjà atteint le niveau maximum (Niveau 3).`, ephemeral: true });
                }

                // Définir les coûts en fonction du type et du niveau de la ville
                let coutAmelioration = 0;
                let coutBois = 0;
                let coutPierre = 0;
                let revenuAmeliore = 0;

                if (ville.capitale) {
                    if (ville.niveau === 1) {
                        coutAmelioration = 20000;
                        coutBois = 500;
                        coutPierre = 500;
                        revenuAmeliore = 2000;
                    } else if (ville.niveau === 2) {
                        coutAmelioration = 50000;
                        coutBois = 2000;
                        coutPierre = 2000;
                        revenuAmeliore = 3000;
                    }
                } else {
                    if (ville.niveau === 1) {
                        coutAmelioration = 10000;
                        coutBois = 300;
                        coutPierre = 300;
                        revenuAmeliore = 800;
                    } else if (ville.niveau === 2) {
                        coutAmelioration = 20000;
                        coutBois = 600;
                        coutPierre = 600;
                        revenuAmeliore = 1500;
                    }
                }

                // Vérifie si l'utilisateur a assez de ressources
                if (utilisateur.pieces_or < coutAmelioration || utilisateur.bois < coutBois || utilisateur.pierre < coutPierre) {
                    return interaction.reply({
                        content: `Vous n'avez pas assez de ressources pour améliorer la ville.\nCoût : ${coutAmelioration} pièces d'or, ${coutBois} bois, ${coutPierre} pierres.`,
                        ephemeral: true
                    });
                }

                // Déduit les ressources nécessaires
                utilisateur.pieces_or -= coutAmelioration;
                utilisateur.bois -= coutBois;
                utilisateur.pierre -= coutPierre;

                // Améliore le niveau de la ville et met à jour le revenu
                ville.niveau += 1;
                ville.revenu_quotidien = revenuAmeliore;

                await ville.save();
                await utilisateur.save();

                // Enregistre la transaction d'amélioration
                await DeiTransaction.create({
                    utilisateur_id: userId,
                    type_transaction: 'city_upgrade',
                    montant: -coutAmelioration,
                    description: `Amélioration de la ville "${nomVilleExistant}" au niveau ${ville.niveau}`,
                });

                return interaction.reply({
                    content: `La ville "${nomVilleExistant}" a été améliorée au niveau ${ville.niveau}.\nRevenu quotidien : ${ville.revenu_quotidien} pièces d'or.\nRessources dépensées : ${coutAmelioration} pièces d'or, ${coutBois} bois, ${coutPierre} pierres.`,
                    ephemeral: true
                });
            }

        } catch (error) {
            console.error(error);
            return interaction.reply({ content: 'Une erreur est survenue lors de l\'exécution de la commande.', ephemeral: true });
        }
    },
};

const { SlashCommandBuilder } = require('discord.js');
const DeiUtilisateur = require('../../database/models/dei_utilisateurs');
const DeiVille = require('../../database/models/dei_villes');
const DeiEmplacement = require('../../database/models/dei_emplacements');
const DeiBatiment = require('../../database/models/dei_batiments'); // Import du modèle DeiBatiment

module.exports = {
    data: new SlashCommandBuilder()
        .setName('structure')
        .setDescription('Construire une structure dans une ville')
        .addStringOption(option =>
            option.setName('ville')
                .setDescription('Nom de la ville')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('structure')
                .setDescription('Type de structure à construire')
                .setRequired(true)
                .addChoices(
                    { name: 'Scierie (bois)', value: 'scierie' },
                    { name: 'Champ (nourriture)', value: 'champ' },
                    { name: 'Mine (pierre)', value: 'mine' }
                )),

    async execute(interaction) {
        const userId = interaction.user.id;
        const nomVille = interaction.options.getString('ville');
        const typeStructure = interaction.options.getString('structure');

        try {
            // Trouver la ville par son nom
            const ville = await DeiVille.findOne({ where: { nom_ville: nomVille } });

            if (!ville) {
                return interaction.reply({ content: `La ville "${nomVille}" n'existe pas.`, ephemeral: true });
            }

            // Trouver l'utilisateur
            const utilisateur = await DeiUtilisateur.findOne({ where: { id: userId } });
            if (!utilisateur) {
                return interaction.reply({ content: 'Utilisateur introuvable.', ephemeral: true });
            }

            // Vérifier le nombre d'emplacements existants dans la ville
            const emplacementsExistants = await DeiEmplacement.count({ where: { ville_id: ville.id } });

            if (emplacementsExistants >= ville.niveau) {
                return interaction.reply({ content: `La ville "${nomVille}" ne peut pas avoir plus de ${ville.niveau} emplacements (1 par niveau).`, ephemeral: true });
            }

            // Définir les coûts en fonction du type de structure
            let coutPieces = 1000;
            let coutBois = 0;
            let coutPierre = 0;
            let coutNourriture = 0;

            switch (typeStructure) {
                case 'scierie':
                    coutPierre = 200;
                    coutNourriture = 100;
                    break;
                case 'mine':
                    coutBois = 200;
                    coutNourriture = 100;
                    break;
                case 'champ':
                    coutPierre = 100;
                    coutBois = 100;
                    break;
                default:
                    return interaction.reply({ content: 'Type de structure invalide.', ephemeral: true });
            }

            // Vérifier si l'utilisateur a assez de ressources
            if (
                utilisateur.pieces_or < coutPieces ||
                utilisateur.bois < coutBois ||
                utilisateur.pierre < coutPierre ||
                utilisateur.nourriture < coutNourriture
            ) {
                return interaction.reply({
                    content: `Vous n'avez pas assez de ressources pour construire "${typeStructure}".\nCoût : ${coutPieces} pièces, ${coutBois} bois, ${coutPierre} pierres, ${coutNourriture} nourriture.`,
                    ephemeral: true
                });
            }

            // Trouver le bâtiment correspondant au type de structure sélectionné
            const batiment = await DeiBatiment.findOne({ where: { nom_batiment: typeStructure } });

            if (!batiment) {
                return interaction.reply({ content: `Le bâtiment pour la structure "${typeStructure}" n'existe pas dans la base de données.`, ephemeral: true });
            }

            // Déduire les ressources nécessaires
            utilisateur.pieces_or -= coutPieces;
            utilisateur.bois -= coutBois;
            utilisateur.pierre -= coutPierre;
            utilisateur.nourriture -= coutNourriture;
            await utilisateur.save();

            // Créer l'emplacement pour la structure avec le type et l'ID du bâtiment
            await DeiEmplacement.create({
                ville_id: ville.id,
                nom_emplacement: typeStructure,
                type_batiment: batiment.type,
                batiment_id: batiment.id,
                niveau: 1
            });

            return interaction.reply({
                content: `La structure "${typeStructure}" a été construite dans la ville "${nomVille}".\nRessources dépensées : ${coutPieces} pièces, ${coutBois} bois, ${coutPierre} pierres, ${coutNourriture} nourriture.`,
                ephemeral: true
            });

        } catch (error) {
            console.error(error);
            return interaction.reply({ content: 'Une erreur est survenue lors de la construction de la structure.', ephemeral: true });
        }
    },
};

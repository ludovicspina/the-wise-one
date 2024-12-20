const cron = require('node-cron');
const DeiUtilisateur = require('../database/models/dei_utilisateurs');
const DeiVille = require('../database/models/dei_villes');
const DeiEmplacement = require('../database/models/dei_emplacements');
const DeiBatiment = require('../database/models/dei_batiments');
const DeiRoyaume = require('../database/models/dei_royaumes');

async function updateDailyIncome() {
    try {
        console.log('Début de la mise à jour des revenus et ressources...');

        // Récupérer toutes les villes
        const villes = await DeiVille.findAll();
        console.log(`Nombre de villes trouvées : ${villes.length}`);
        console.log('Détails des villes :', JSON.stringify(villes, null, 2));

        for (const ville of villes) {
            console.log(`\nTraitement de la ville : ${ville.nom_ville}, ID : ${ville.id}, Revenu : ${ville.revenu_quotidien}, Royaume ID : ${ville.royaume_id}`);

            // Trouver le royaume associé
            const royaume = await DeiRoyaume.findOne({ where: { id: ville.royaume_id } });
            console.log(`Royaume trouvé : ${royaume ? JSON.stringify(royaume, null, 2) : 'Aucun royaume trouvé'}`);

            if (!royaume) {
                console.log(`Royaume introuvable pour l'ID : ${ville.royaume_id}`);
                continue;
            }

            // Trouver l'utilisateur associé au royaume
            const utilisateur = await DeiUtilisateur.findOne({ where: { id: royaume.utilisateur_id } });
            console.log(`Utilisateur trouvé : ${utilisateur ? JSON.stringify(utilisateur, null, 2) : 'Aucun utilisateur trouvé'}`);

            if (!utilisateur) {
                console.log(`Utilisateur introuvable pour l'ID du royaume : ${royaume.utilisateur_id}`);
                continue;
            }

            // Mettre à jour les pièces d'or de l'utilisateur avec le revenu de la ville
            console.log(`Utilisateur avant mise à jour : ${utilisateur.nom_rp}, Pièces d'or : ${utilisateur.pieces_or}`);
            utilisateur.pieces_or += ville.revenu_quotidien;
            await utilisateur.save();
            console.log(`Utilisateur après mise à jour : ${utilisateur.nom_rp}, Pièces d'or : ${utilisateur.pieces_or}`);

            // Récupérer les emplacements et leurs bâtiments pour chaque ville
            const emplacements = await DeiEmplacement.findAll({
                where: { ville_id: ville.id },
                include: [{ model: DeiBatiment }],
            });

            console.log(`Nombre d'emplacements trouvés pour la ville "${ville.nom_ville}" : ${emplacements.length}`);
            console.log('Détails des emplacements :', JSON.stringify(emplacements, null, 2));

            for (const emplacement of emplacements) {
                console.log(`\nTraitement de l'emplacement ID : ${emplacement.id}, Nom : ${emplacement.nom_emplacement}, Batiment ID : ${emplacement.batiment_id}, Niveau : ${emplacement.niveau}`);
                const batiment = emplacement.dei_batiment;

                if (!batiment) {
                    console.log(`Aucun bâtiment trouvé pour l'emplacement ID : ${emplacement.id}`);
                    continue;
                }

                console.log(`Bâtiment trouvé : ${JSON.stringify(batiment, null, 2)}`);
                console.log(`Traitement du bâtiment : ${batiment.nom_batiment}, Niveau : ${emplacement.niveau}`);

                // Mettre à jour les ressources en fonction du type de bâtiment
                switch (batiment.nom_batiment) {
                    case 'scierie':
                        console.log(`Bois actuel avant ajout : ${utilisateur.bois}`);
                        utilisateur.bois += 100 * emplacement.niveau;
                        console.log(`Ajout de bois : ${100 * emplacement.niveau}, Bois après ajout : ${utilisateur.bois}`);
                        break;
                    case 'champ':
                        console.log(`Nourriture actuelle avant ajout : ${utilisateur.nourriture}`);
                        utilisateur.nourriture += 100 * emplacement.niveau;
                        console.log(`Ajout de nourriture : ${100 * emplacement.niveau}, Nourriture après ajout : ${utilisateur.nourriture}`);
                        break;
                    case 'mine':
                        console.log(`Pierre actuelle avant ajout : ${utilisateur.pierre}`);
                        utilisateur.pierre += 100 * emplacement.niveau;
                        console.log(`Ajout de pierre : ${100 * emplacement.niveau}, Pierre après ajout : ${utilisateur.pierre}`);
                        break;
                    case 'temple':
                        console.log(`Pièces d'or avant ajout : ${utilisateur.pieces_or}`);
                        utilisateur.pieces_or += 500 * emplacement.niveau;
                        console.log(`Ajout de pièces d'or (temple) : ${500 * emplacement.niveau}, Pièces d'or après ajout : ${utilisateur.pieces_or}`);
                        break;
                    default:
                        console.log(`Aucune ressource ajoutée pour le bâtiment : ${batiment.nom_batiment}`);
                }

                await utilisateur.save();
            }
        }

        console.log('\nMise à jour des revenus et ressources terminée avec succès.');
    } catch (error) {
        console.error('Erreur lors de la mise à jour des revenus et ressources :', error);
    }
}

// Planifier la tâche pour s'exécuter tous les jours à 23h30
cron.schedule('30 23 * * *', updateDailyIncome);

module.exports = { updateDailyIncome };

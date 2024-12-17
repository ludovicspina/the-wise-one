// const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
// const { join } = require("node:path");
//
// module.exports = {
//     data: new SlashCommandBuilder()
//         .setName('g-raid')
//         .setDescription("Génère un message de création d'event de raid de guilde.")
//         .addStringOption(option =>
//             option.setName('date')
//                 .setDescription('Heure et date de l\'événement (HH:MM JJ/MM)')
//                 .setRequired(true)
//         )
//         .addStringOption(option =>
//             option.setName('boss')
//                 .setDescription('Type de boss (Morokai ou Excavateur)')
//                 .setRequired(true)
//                 .addChoices(
//                     { name: 'Morokai', value: 'Morokai' },
//                     { name: 'Excavateur', value: 'Excavateur' }
//                 )
//         ),
//     async execute(interaction) {
//         const date = interaction.options.getString('date');
//         const boss = interaction.options.getString('boss');
//
//         let bossType = boss + ".png"
//
//         const attachmentImage = "attachment://" + bossType;
//         const imagePath = join(__dirname, '../../images/' + bossType);
//         const image = new AttachmentBuilder(imagePath);
//
//         const tankEmoji = "<:tank:1298402413547487254>";
//
//         const raidEmbed = new EmbedBuilder()
//             .setColor('#ff0000')
//             .setTitle('Raid de Guilde')
//             .addFields(
//                 { name: 'Date et Heure', value: date, inline: true },
//                 { name: 'Boss', value: boss.toLocaleUpperCase(), inline: true }
//             )
//             .setDescription(`${tankEmoji} DPS\n`)
//             .setTimestamp()
//             .setImage(attachmentImage); // Utilisation du nom du fichier attaché
//
//
//
//         // Envoie l'embed avec l'image en pièce jointe
//         await interaction.reply({
//             embeds: [raidEmbed],
//             files: [image] // Ajout du fichier joint
//         });
//
//         // Récupérer le message envoyé
//         const message = await interaction.fetchReply();
//
//         const dps = message.guild.emojis.cache.find(emoji => emoji.name === 'dps');
//         const tank = message.guild.emojis.cache.find(emoji => emoji.name === 'tank');
//         const healer = message.guild.emojis.cache.find(emoji => emoji.name === 'healer');
//
//         // Ajouter des réactions au message (sans les chevrons)
//         await message.react(dps)
//             .then(() => message.react(tank))
//             .then(() => message.react(healer))
//             .then(() => message.react("❌"))
//             .catch(error => console.error('One of the emojis failed to react:', error));
//     }
// };
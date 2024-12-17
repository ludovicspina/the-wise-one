const {SlashCommandBuilder} = require('discord.js');
const User = require("../../database/models/User");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('meteo')
        .setDescription("Envoie le lien pour la météo T&L."),
    async execute(interaction) {
        try {

            await interaction.reply('https://questlog.gg/throne-and-liberty/en-nc/rain-schedule');
        } catch (error) {
            console.error(error);
            await interaction.reply('Une erreur est survenue lors de l\'envoi de la météo.');
        }
    },
};

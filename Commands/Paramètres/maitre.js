import { EmbedBuilder } from 'discord.js';
import db from '../../Events/loadDatabase.js';

export const command = {
	name: 'maitre',
	helpname: ',maitre [mention/id]',
	description: 'Permet de gérer les Maîtres.',
	help: ',maitre [mention/id]',

	run: async (bot, message, args, config) => {

		// Seuls les Owners peuvent gérer les Maîtres
		if (!config.owners.includes(message.author.id)) {
			const embed = new EmbedBuilder()
				.setColor('#3f3f46')
				.setTitle('🐦‍⬛・GLORIOUSBOT')
				.setDescription('🔒 **Accès refusé**\n\nSeuls les **Owners** peuvent gérer les Maîtres.')
				.setTimestamp();

			return message.reply({ embeds: [embed] });
		}

		const user =
			message.mentions.users.first() ||
			await bot.users.fetch(args[0]).catch(() => null);

		if (!user) {
			const embed = new EmbedBuilder()
				.setColor('#3f3f46')
				.setTitle('🐦‍⬛・GLORIOUSBOT')
				.setDescription('❌ **Utilisateur introuvable**\n\nUtilisation : `,maitre @Utilisateur`')
				.setTimestamp();

			return message.reply({ embeds: [embed] });
		}

		db.get(
			'SELECT id FROM maitres WHERE id = ?',
			[user.id],
			(err, row) => {

				if (err) {
					console.error('Erreur lors de la vérification du Maître :', err);
					return;
				}

				// Déjà Maître → on retire l'accès
				if (row) {

					db.run(
						'DELETE FROM maitres WHERE id = ?',
						[user.id],
						function (err) {

							if (err) {
								console.error('Erreur lors du retrait du Maître :', err);
								return;
							}

							const embed = new EmbedBuilder()
								.setColor('#3f3f46')
								.setTitle('🐦‍⬛・MAÎTRE')
								.setDescription(
									`🔻 ${user} **n'est plus Maître.**\n\n` +
									`👑 Action effectuée par ${message.author}.`
								)
								.setTimestamp();

							message.reply({ embeds: [embed] });
						}
					);

					return;
				}

				// Pas encore Maître → on ajoute l'accès
				db.run(
					'INSERT INTO maitres (id) VALUES (?)',
					[user.id],
					function (err) {

						if (err) {
							console.error("Erreur lors de l'ajout du Maître :", err);
							return;
						}

						const embed = new EmbedBuilder()
							.setColor('#3f3f46')
							.setTitle('🐦‍⬛・MAÎTRE')
							.setDescription(
								`🟢 ${user} **est désormais Maître.**\n\n` +
								`👑 Action effectuée par ${message.author}.`
							)
							.setTimestamp();

						message.reply({ embeds: [embed] });
					}
				);
			}
		);
	}
};
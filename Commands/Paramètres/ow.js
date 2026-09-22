import { EmbedBuilder } from 'discord.js';
import db from '../../Events/loadDatabase.js';

export const command = {
	name: 'ow',
	helpname: '=ow [mention/id]',
	description: 'Ajoute ou retire un utilisateur des OWNER.',
	help: '=ow [mention/id]',

	run: async (bot, message, args, config) => {

		const isOwner = config.owners.includes(message.author.id);

		const isMaitre = await new Promise((resolve, reject) => {
			db.get(
				'SELECT id FROM maitres WHERE id = ?',
				[message.author.id],
				(err, row) => {
					if (err) return reject(err);
					resolve(!!row);
				}
			);
		}).catch(() => false);

		if (!isOwner && !isMaitre) {
			const embed = new EmbedBuilder()
				.setColor('#3f3f46')
				.setTitle('🐦‍⬛・GLORIOUSBOT')
				.setDescription(
					'🔒 **Accès refusé**\n\n' +
					'Seuls les **Owners** et les **Maîtres** peuvent utiliser cette commande.'
				)
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
				.setDescription(
					'❌ **Utilisateur introuvable**\n\n' +
					'Utilisation : `=ow @Utilisateur`'
				)
				.setTimestamp();

			return message.reply({ embeds: [embed] });
		}

		db.get(
			'SELECT id FROM owner WHERE id = ?',
			[user.id],
			(err, row) => {

				if (err) {
					console.error('Erreur lors de la vérification de l\'Owner :', err);
					return;
				}

				if (row) {
					db.run(
						'DELETE FROM owner WHERE id = ?',
						[user.id],
						function (err) {

							if (err) {
								console.error('Erreur lors du retrait de l\'Owner :', err);
								return;
							}

							const embed = new EmbedBuilder()
								.setColor('#3f3f46')
								.setTitle('🐦‍⬛・OWNER')
								.setDescription(
									`🔻 ${user} **n'est plus Owner.**\n\n` +
									`👑 Action effectuée par ${message.author}.`
								)
								.setTimestamp();

							message.reply({ embeds: [embed] });
						}
					);

					return;
				}

				db.run(
					'INSERT INTO owner (id) VALUES (?)',
					[user.id],
					function (err) {

						if (err) {
							console.error('Erreur lors de l\'ajout de l\'Owner :', err);
							return;
						}

						const embed = new EmbedBuilder()
							.setColor('#3f3f46')
							.setTitle('🐦‍⬛・OWNER')
							.setDescription(
								`🟢 ${user} **est désormais Owner.**\n\n` +
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
const { Client } = require('discord.js')
const Coub = require('coub-dl')
const logr = require('logr')
const path = require('path')

// ---- COUB ----
const coubRegexp = /(https?:\/\/)?(www\.)?coub\.com\/[\w/]+/

async function fetchCoub(text, format = 'mp4') {
  const url = text.match(coubRegexp)[0]
  const coub = await Coub.fetch(url)
  const filePath = path.join(__dirname, `../.coub.${format}`)

  if (format === 'gif') {
    return coub
      .scale(500)
      .write(filePath)
  }

  return coub
    .attachAudio()
    .loop(Math.floor(21 / coub.duration))
    .addOption('-c', 'copy')
    .addOption('-shortest')
    .write(filePath)
}
// ---- COUB ----


// ---- DISCORD ----
const client = new Client()
const prefix = 'c.'

client
  .on('ready', () => logr.success(`Up and running as ${client.user.tag}!`))
  .on('message', async msg => {
    // --- Coub catching ---
    if (coubRegexp.test(msg.content) && !msg.content.startsWith(prefix)) {
      const coub = await fetchCoub(msg.content, msg.content.includes('gif') ? 'gif' : 'mp4')
      return msg.channel.send({ files: [coub] })
    }

    // --- Commands ---
    if (!msg.content.startsWith(prefix)) return
    const args = msg.content.toLowerCase().split(' ')
    const command = args.shift().slice(prefix.length)

    if (command === 'ping') {
      const response = await msg.channel.send('Pong!')
      return response.edit(`Pong! ${response.createdAt - msg.createdAt} ms`)
    }

    if (command === 'help') {
      return msg.reply([
        'my only command is `ping`, so my owner can check if I\'m not dead, haha.',
        'Just send a coub link anywhere I can see it and I will do my best to embed it for you.',
        'You can wrap the link in `<` and `>` to prevent Discord from showing its inferior embed and only let mine through',
        'As a bonus, you can add the keyword `gif` to your message and I will make it into a gif insead :wink:.'
      ].join('\n'))
    }
  })

client.login(process.env.TOKEN)
// ---- DISCORD ----

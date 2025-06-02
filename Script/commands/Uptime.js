module.exports.config = {
	name: "uptime",
	version: "1.0.1",
	hasPermssion: 0,
	credits: "Mirai - JRT",
	description: "Check bot's online time",
	commandCategory: "Information",
	cooldowns: 5,
	dependencies: {
		"pidusage": "",
		"fast-speedtest-api": ""
	}
};

function byte2mb(bytes) {
	const units = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
	let l = 0, n = parseInt(bytes, 10) || 0;
	while (n >= 1024 && ++l) n = n / 1024;
	return `${n.toFixed(n < 10 && l > 0 ? 1 : 0)} ${units[l]}`;
}

module.exports.run = async ({ api, event, arg, Users }) => {
	const axios = global.nodemodule["axios"];
	const fast = global.nodemodule["fast-speedtest-api"];
	const speedTest = new fast({
			token: "YXNkZmFzZGxmbnNkYWZoYXNkZmhrYWxm",
			verbose: false,
			timeout: 10000,
			https: true,
			urlCount: 5,
			bufferSize: 8,
			unit: fast.UNITS.Mbps
		});
	const ketqua = await speedTest.getSpeed();
  const request = require('request');
	const res = await axios.get(`https://jrt-api.jrt-official.repl.co/love`);
var love = res.data.data;
  const req = await axios.get(`https://jrt-api.jrt-official.repl.co/cadao`);
var cadao = req.data.data;
  const jrt = await axios.get(`https://jrt-api.jrt-official.repl.co/thayboi`);
var thayboi = jrt.data.data;
   const rep = await axios.get(`https://jrt-api.jrt-official.repl.co/joker`);
var joker = rep.data.data;
	const fs = require("fs");
    let name = await Users.getNameUser(event.senderID)
  const time = process.uptime(),
		hours = Math.floor(time / (60 * 60)),
		minutes = Math.floor((time % (60 * 60)) / 60),
		seconds = Math.floor(time % 60);
  const pidusage = await global.nodemodule["pidusage"](process.pid);
	const moment = require("moment-timezone");
    var gio = moment.tz("Asia/Dhaka").format("D/MM/YYYY || HH:mm:ss");
    var thu = moment.tz('Asia/Dhaka').format('dddd');
     if (thu == 'Sunday') thu = 'Sunday'
  if (thu == 'Monday') thu = 'Monday'
  if (thu == 'Tuesday') thu = 'Tuesday'
  if (thu == 'Wednesday') thu = 'Wednesday'
  if (thu == "Thursday") thu = 'Thursday'
  if (thu == 'Friday') thu = 'Friday'
  if (thu == 'Saturday') thu = 'Saturday'
    const timeStart = Date.now();
	let today = new Date();
 axios.get('https://apimyjrt.jrt-official.repl.co/instagram.php').then(res => {
 let ext = res.data.data.substring(res.data.data.lastIndexOf(".") + 1);
 let callback = function () {
     api.sendMessage({body: `[🔱] Hello: ${name}\n[🔱] Today is: ${thu} || ${gio}\n[🔱] Bot has been online for: ${hours} hours ${minutes} minutes ${seconds} seconds.\n[🔱] Prefix: ${global.config.PREFIX}\n[🔱] Version: 1.2.15\n[🔱] Total users: ${global.data.allUserID.length}\n[🔱] Total groups: ${global.data.allThreadID.length}\n[🔱] CPU usage: ${pidusage.cpu.toFixed(1)}%\n[🔱] RAM usage: ${byte2mb(pidusage.memory)}\n[🔱] Ping: ${Date.now() - timeStart}ms\n[🔱] Network speed: ${ketqua} Mbps \n≻───── •👇🏻• ─────≺\n[🔱] Love quote:\n${love}\n[🔱] Vietnamese proverb:\n${cadao}\n[🔱] Did you know:\n${joker}\n[🔱] Fortune teller says:\n${thayboi}`, attachment: fs.createReadStream(__dirname + `/cache/waifu.${ext}`)
     }, event.threadID, () => fs.unlinkSync(__dirname + `/cache/waifu.${ext}`), event.messageID);
    };
    request(res.data.data).pipe(fs.createWriteStream(__dirname + `/cache/waifu.${ext}`)).on("close", callback);
   })
}

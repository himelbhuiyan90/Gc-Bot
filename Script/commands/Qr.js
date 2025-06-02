module.exports.config = {
    name: "qr",
    version: "1.2.0",
    hasPermssion: 0,
    credits: "Chitron Bhattacharjee",
    description: "Generate customizable QR codes",
    commandCategory: "Utility Tools",
    usages: "[text] -color [color] -bg [background] -size [100-1000]",
    cooldowns: 5,
    dependencies: {
        "qrcode": "",
        "fs-extra": "",
        "chalk": ""
    }
};

module.exports.languages = {
    "en": {
        "missingInput": "Please enter text to generate QR code",
        "invalidColor": "Invalid color format. Use hex codes (e.g., #FF0000) or color names",
        "invalidSize": "Size must be between 100-1000 pixels",
        "generating": "🔄 Generating your QR code...",
        "success": "✅ Successfully generated QR code!",
        "help": 
            "📌 QR Code Generator Help 📌\n\n" +
            "Basic Usage:\n" +
            "• qr [text] - Creates QR with default settings\n\n" +
            "Customization Options:\n" +
            "• -color [value] - Set QR color (hex or name)\n" +
            "• -bg [value] - Set background color\n" +
            "• -size [100-1000] - Set image size\n\n" +
            "Examples:\n" +
            "• qr Hello World\n" +
            "• qr https://example.com -color red -bg white\n" +
            "• qr Contact:123-456-789 -size 500 -color #0000FF\n\n" +
            "💡 Tip: Use high contrast colors for better scanning!"
    }
};

module.exports.run = async function({ api, event, args, getText }) {
    const { createReadStream, unlinkSync, ensureDir } = global.nodemodule["fs-extra"];
    const qrcode = global.nodemodule["qrcode"];
    const chalk = global.nodemodule["chalk"];

    // Show help if requested
    if (args[0] === "help") {
        return api.sendMessage(getText("help"), event.threadID);
    }

    // Parse arguments
    const text = args.join(" ").split("-").map(item => item.trim());
    const content = text[0];
    
    if (!content) return api.sendMessage(getText("missingInput"), event.threadID);

    const options = {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        quality: 0.3,
        margin: 1,
        color: {
            dark: '#000000',
            light: '#ffffff'
        },
        width: 300
    };

    // Process flags
    for (const item of text.slice(1)) {
        const [flag, value] = item.split(/\s+/);
        switch (flag.toLowerCase()) {
            case 'color':
                if (/^#([0-9A-F]{3}){1,2}$/i.test(value) || /^[a-z]+$/i.test(value)) {
                    options.color.dark = value;
                } else {
                    return api.sendMessage(getText("invalidColor"), event.threadID);
                }
                break;
            case 'bg':
                if (/^#([0-9A-F]{3}){1,2}$/i.test(value) || /^[a-z]+$/i.test(value)) {
                    options.color.light = value;
                } else {
                    return api.sendMessage(getText("invalidColor"), event.threadID);
                }
                break;
            case 'size':
                const size = parseInt(value);
                if (isNaN(size) || size < 100 || size > 1000) {
                    return api.sendMessage(getText("invalidSize"), event.threadID);
                }
                options.width = size;
                break;
        }
    }

    try {
        await ensureDir(__dirname + '/cache');
        const qrPath = __dirname + '/cache/qr_' + Date.now() + '.png';
        
        api.sendMessage(getText("generating"), event.threadID);
        
        await new Promise((resolve, reject) => {
            qrcode.toFile(qrPath, content, options, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        await api.sendMessage({
            body: getText("success"),
            attachment: createReadStream(qrPath)
        }, event.threadID);

        unlinkSync(qrPath);
    } catch (error) {
        console.error(chalk.red('QR Generation Error:'), error);
        api.sendMessage("An error occurred while generating the QR code.", event.threadID);
    }
};

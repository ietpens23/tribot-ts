import { downloadMediaMessage, getContentType } from '@whiskeysockets/baileys';
import { IWebMessageInfoExtended } from './types.js';
import { ipaddr } from '../commands/ip.js';
import { helpCommand } from '../commands/help.js';
import { speedtest } from '../commands/speedtest.js';
import { shell } from '../commands/shell.js';
import { sticker } from '../commands/sticker.js';
import { tiktok } from '../commands/tiktok.js';
import utils from './utils.js';

export default async function (m: IWebMessageInfoExtended): Promise<void> {
  const senderNumber: string = m.key.remoteJid ?? '';
  let body;

  if (m.message) {
    m.mtype = getContentType(m.message);

    try {
      body =
        m.mtype === 'conversation'
          ? m.message.conversation
          : m.mtype == 'imageMessage'
            ? m.message?.imageMessage?.caption
            : m.mtype == 'videoMessage'
              ? m.message?.videoMessage?.caption ||
                m.message?.extendedTextMessage?.contextInfo?.quotedMessage
                  ?.videoMessage
              : m.mtype == 'extendedTextMessage'
                ? m.message?.extendedTextMessage?.text ||
                  m.message?.extendedTextMessage?.contextInfo?.quotedMessage
                    ?.conversation
                : m.mtype == 'ephemeralMessage'
                  ? m.message?.ephemeralMessage?.message?.extendedTextMessage
                      ?.text
                  : m.mtype == 'buttonsResponseMessage'
                    ? m.message?.buttonsResponseMessage?.selectedButtonId
                    : m.mtype == 'listResponseMessage'
                      ? m.message?.listResponseMessage?.singleSelectReply
                          ?.selectedRowId
                      : m.mtype == 'templateButtonReplyMessage'
                        ? m.message?.templateButtonReplyMessage?.selectedId
                        : m.mtype === 'messageContextInfo'
                          ? m.message.buttonsResponseMessage
                              ?.selectedButtonId ||
                            m.message?.listResponseMessage?.singleSelectReply
                              ?.selectedRowId ||
                            m.text
                          : '';
    } catch (e) {
      console.log(e);
    }
  }

  if (typeof body === 'string') {
    try {
      const prefixMatch = /^[\\/!#.]/gi.test(body)
        ? body.match(/^[\\/!#.]/gi)
        : '/';
      const prefix = prefixMatch instanceof Array ? prefixMatch[0] : '/';
      const trimmedBody = body.replace(prefix, '').trim();
      const words = trimmedBody.split(/ +/);
      let command;

      if (words.length > 0) {
        command = words[0].toLowerCase();
        m.args = words.slice(1);
      } else {
        m.args = [];
      }

      switch (command) {
        case 'help':
          await helpCommand(senderNumber, m);
          break;
        case 'p':
          console.log(m.args);
          break;
        case 'ip':
          await ipaddr(senderNumber);
          break;
        case 'test':
          utils.sendText('testo testo', senderNumber);
          break;
        case 'speedtest':
          utils.sendText('Performing server speedtest...', senderNumber);
          await speedtest(senderNumber, m);
          break;
        case 'shell':
          await shell(m.args, senderNumber, m);
          break;
        case 'sticker': {
          const media = await downloadMediaMessage(m, 'buffer', {});
          if (media instanceof Buffer) {
            await sticker(senderNumber, media, m);
          } else {
            console.error('Downloaded media is not a Buffer.');
          }
          break;
        }
        case 'tiktok':
          await tiktok(m.args, senderNumber, m);
          break;
      }
    } catch (err) {
      console.log(err);
    }
  }
}

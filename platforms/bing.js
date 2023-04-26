import { BingChat } from "bing-chat";
import dotenv from 'dotenv';
dotenv.config();

const Bing = new BingChat({
    cookie: process.env.BING,
});

const clearText = (text) => {
    const regex = /\[\d+\^*\d*\]|\[\^*\d+\^*\d*\]/g;
    return text.replace(regex, '');
}


export default async (prompt, ctx, messageId, userId) => {
    try {

        let prevmsg = '';

        const res = await Bing.sendMessage(prompt, {
            variant: "Precise",
            onProgress: (partialResponse) => {
                if (prevmsg.length + 25 < partialResponse.text.length) {
                    ctx.editMessageText(`${clearText(partialResponse.text)}✍️`, {
                        message_id: messageId,
                        chat_id: userId
                    });
                    prevmsg = partialResponse.text;
                }
            },
        });

        // console.log(res.detail.sourceAttributions);
        // console.log(res.detail.suggestedResponses);
        return clearText(res.text);
    } catch (error) {
        console.log(error);
    }
};
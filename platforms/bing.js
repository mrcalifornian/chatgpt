import { BingChat } from "bing-chat";

const Bing = new BingChat({
    cookie:
        "1a-aHBzJB0Sru296vI6Kj_0_B37Uv5JfxngeO1GrjB1JtDtzzze-1hEF-N7db9onHySpaIA8ZIRt9zwqEiCTO9U1wlXsshNBEymaWTxfOwAeTiYVrD7Mu5_0Qhnxuksi7vEf3LOR1k5nePhKicAzHWUc0wPHrNVPJp_0xa6AMJokJJHq3Py2KoUnKuGzOY_ncIWHQOwCIYx5Cp0VMxQ6yWti0V4-_BSeafN4UxiRfIys",
});

const clearText = (text) => {
    const regex = /\[\d+\^*\d*\]|\[\^*\d+\^*\d*\]/g;
    return text.replace(regex, '');
}


export default async (prompt, ctx, messageId, userId) => {
    try {

        let prevmsg = '';

        const res = await Bing.sendMessage(prompt, {
            onProgress: (partialResponse) => {
                if (prevmsg.length + 50 < partialResponse.text.length) {
                    ctx.editMessageText(clearText(partialResponse.text), {
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
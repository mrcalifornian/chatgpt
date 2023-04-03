exports.messsages = {
    'start': "O'zingiz xohlagan suhbat tilini tanlang\n\nВыберите разговорный язык, который вы хотите \n\nChoose a conversational language you want",
    'uz': {
        "greet": (username) => `Salom ${username}. ChatGPT-ga xush kelibsiz! Men sizning so'rovlaringiz bo'yicha sizga yordam berish va tushunarli javoblar berish uchun mo'ljallangan til modeliman. Bugun sizga qanday yordam bera olaman? \n\n/help - qo'shimcha ma'lumot uchun`,
        'restart': (username) => `Salom ${username}. Bugun sizga qanday yordam bera olaman? \n\n/help - qo'shimcha ma'lumot uchun`,
        'daily': 'Sizga bugungi kun uchun foydalanishga 10 ta bonus berildi. Ulardan hoziroq foydalanishni boshlashingiz mumkin',
        'attempts': (daily, bonus) => `Bonuslaringiz: \n\Kunlik: ${daily} \nBoshqa: ${bonus} \nSiz har doim koʻproq olish uchun /invite qilishingiz mumkin!`,
        'noattempts': `Urinishlaringiz tugadi. \nBotdan foydalanishni davom ettirish uchun /invite qiling yoki ertaga qaytib keling. \n\n/help - qo'shimcha ma'lumot uchun`,
        'error': `Bu tizim xatosi edi. Iltimos, keyinroq urinib ko'ring!`,
        'dalle': `Dall-E tasvirini yaratish uchun so'rovingizni quyidagicha yuboring: \n\n/dalle - Rasm yaratish uchun matningiz`,
        'invite': (botname, userId) => `Salom, ChatGPT-ni telegramda sinab ko'rmoqchimisiz? \n\nBu havoladan foydalanishingiz mumkin:\nt.me/${botname}?start=${userId}`,
        'limit': 'Sizning xabaringiz uzunligi 250 belgidan oshmasligi kerak',
        'invited': `Do'stingizni taklif qilganingiz uchun 5 ta bonus oldingiz. Buni /attempts orqali tekshirishingiz mumkin`,
        'help': "@GPT_ProBot ga xush kelibsiz!🤖 \nBizning sun'iy intellektga asoslangan botimiz OpenAI tomonidan ishlab chiqilgan ilg'or AI modelidan foydalangan holda sizni qiziqtirgan barcha savollarga javob berish uchun shu yerda. \n\nHar kuni sizga savol berish uchun 10 ta kredit beriladi. Har bir savol 1 ta kredit turadi.\n\nXususiyatlar: \n\n1. /attempts buyrug'i sizga qancha urinishlar qolganligini darhol tekshirish imkonini beradi. \n\n2. /invite buyrug'i yordamida siz taklif havolasini olishingiz va uni do'stlaringiz bilan baham ko'rishingiz mumkin va har bir qo'shilgan do'stingiz uchun siz 5 ta kredit olasiz. \n\n3. Rasm yaratish\n/dalle-Siz yaratmoqchi boʻlgan rasm uchun matn"
    },
    'ru': {
        "greet": (username) => `Здравствуйте, ${username}. Добро пожаловать в ChatGPT! Я языковая модель, созданная, чтобы помочь вам с вашими запросами и дать проницательные ответы. Как я могу Вам сегодня помочь?\n\n/help - для получения дополнительной информации`,
        'restart': (username) => `Здравствуйте, ${username}. Как я могу помочь вам сегодня? \n\n/help - для получения дополнительной информации`,
        'daily': 'Вам дано 10 ежедневных попыток на сегодня. Вы можете начать использовать их прямо сейчас',
        'attempts': (daily, bonus) => `Ваши бонусы: \n\nЕжедневно: ${daily} \nЗаработано:: ${bonus} \n\nВы всегда можете /invite, чтобы получить больше!`,
        'noattempts': 'У вас закончились попытки. \n/invite или приходите завтра, чтобы продолжить использование бота. \n\n/help - для получения дополнительной информации',
        'error': 'Это была системная ошибка. Пожалуйста, вернитесь позже!',
        'dalle': 'Чтобы сгенерировать изображение Dall-E, отправьте запрос следующим образом: \n\n/dalle - Ваш текст для создания изображения',
        'invite': (botname, userId) => `Привет, хочешь попробовать ChatGPT в Telegram? \n\nВы можете использовать эту ссылку:\nt.me/${botname}?start=${userId}`,
        'limit': 'Длина вашего сообщения не должна превышать 250 символов',
        'invited': 'Вы получили 5 бонусов за приглашение друга. Вы можете проверить это в /attempts',
        "help": "Добро пожаловать в @GPT_ProBot!🤖 \nНаш бот с искусственным интеллектом здесь, чтобы дать вам ответы на любые вопросы, которые могут у вас возникнуть, используя передовую модель искусственного интеллекта, разработанную OpenAI. \n\nКаждый день вам будет даваться 10 кредитов, которые вы сможете использовать, чтобы задавать вопросы. Каждый вопрос стоит 1 кредит.\n\nОсобенности:\n\n1. Команда /attempts позволяет мгновенно проверить, сколько попыток у вас осталось. \n\n2. Используя команду /invite, вы можете получить свою пригласительную ссылку и поделиться ею с друзьями, а за каждого присоединившегося друга вы получите 5 кредитов. \n\n3. Генерация изображения\n/dalle-Text для изображения, которое вы хотите создать"
    },
    'en': {
        "greet": (username) => `Hello ${username}. Welcome to ChatGPT! I am a language model designed to assist you with your inquiries and provide insightful answers. How may I assist you today? \n\n/help - for more info`,
        'restart': (username) => `Hello ${username}. How can I help you today? \n\n/help - for more info`,
        'daily': "You have been given 10 daily attempts for today. You can start using them now",
        'attempts': (daily, bonus) => `Your bonuses: \n\nDaily:  ${daily} \nEarned:  ${bonus} \n\nYou can always /invite to get more!`,
        'noattempts': 'You run out of attempts. \n/invite or come back tomorrow to continue using the bot. \n\n/help - for more info',
        'error': 'That was a system error. Please come back later!',
        'dalle': 'In order to generate Dall-E image, send your request as follows: \n\n/dalle - Your text for image generation',
        'invite': (botname, userId) => `Hey, do you want to try out ChatGPT in telegram? \n\nYou can use this link:\nt.me/${botname}?start=${userId}`,
        'limit': 'You message length should not exceed 250 characters',
        'invited': 'You received 5 bonuses for inviting a friend. You can check it at /attempts',
        'help': "Welcome to @GPT_ProBot!🤖 \nOur AI-powered bot is here to provide you with answers to any questions you may have using the cutting-edge AI model developed by OpenAI. \n\nEvery day you will be given 10 credits to use for asking questions. Each question costs 1 credit.\n\nFeatures: \n\n1. /attempts command allows you to instantly check how many attempts you have left.   \n\n2. Using /invite command you can get your invite link and share it with your friends, and for each friend that joins, you will receive 5 credits. \n\n3. Image generation\n/dalle-Text for image you want to create"
    },
}

exports.lang = (lang) => {
    switch (lang) {
        case 'uz':
        case 'ru':
        case 'rn':
            return lang;
        default:
            return 'en';
    }
}

exports.news = (caption) => {
    try {
        let captionList = caption.split('#');

        let msgs = {}
        for (let cpt of captionList) {
            let nc = cpt.split('*');
            msgs[nc[0].toLowerCase().replace(new RegExp('\n', 'g'), '').trim()] = nc[1].trim();
        }
        return msgs;
    } catch (error) {
        return '';
    }
}
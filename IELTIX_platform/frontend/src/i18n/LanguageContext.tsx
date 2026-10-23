import React, { createContext, useContext, useState } from 'react';

export type Language = 'uz' | 'ru' | 'en';

export interface Translations {
  topBanner: {
    text: string;
    action: string;
  };
  nav: {
    platform: string;
    results: string;
    reviews: string;
    pricing: string;
    faq: string;
    login: string;
    start: string;
    profile: string;
    logout: string;
  };
  hero: {
    badge: string;
    score: string;
    scoreSubtitle: string;
    headlineStart: string;
    headlineHighlight: string;
    headlineEnd: string;
    subheadline: string;
    btnStart: string;
    btnPlatform: string;
    stats: {
      tests: string;
      students: string;
      access: string;
    };
  };
  results: {
    badge: string;
    title: string;
    subtitle: string;
    btnStart: string;
    placeholderLabel: string;
    items: string[];
  };
  platform: {
    badge: string;
    title: string;
    subtitle: string;
    tabs: string[];
    userLabel: string;
    levelLabel: string;
    recommended: string;
    bannerTitle: string;
    bannerDesc: string;
    bannerBtn: string;
    activeSub: string;
    timerLabel: string;
    streak: string;
    btnStart: string;
  };
  reviews: {
    badge: string;
    title: string;
    ratingSuffix: string;
    scoreLabel: string;
    placeholderText: string;
    dateLabel: string;
    btnStart: string;
  };
  pricing: {
    badge: string;
    title: string;
    subtitle: string;
    packageTitle: string;
    mostPopular: string;
    monthlyLabel: string;
    price: string;
    currency: string;
    period: string;
    btnSubscribe: string;
    secureNote: string;
    features: string[];
  };
  faq: {
    badge: string;
    title: string;
    subtitle: string;
    items: {
      q: string;
      a: string;
    }[];
  };
  footer: {
    desc: string;
    botNotice: string;
    quickLinks: string;
    focusTitle: string;
    focusDesc: string;
    priceNote: string;
    rights: string;
    terms: string;
    privacy: string;
  };
  modals: {
    subscription: {
      title: string;
      desc: string;
      subject: string;
      subjectVal: string;
      duration: string;
      durationVal: string;
      total: string;
      providerLabel: string;
      payBtn: string;
      secureNote: string;
      successMsg: string;
    };
    login: {
      title: string;
      desc: string;
      phoneLabel: string;
      codeLabel: string;
      sendCodeBtn: string;
      verifyBtn: string;
      codeSentMsg: string;
      successMsg: string;
    };
  };
  auth: {
    loginTab: string;
    registerTab: string;
    loginTitle: string;
    loginSubtitle: string;
    registerTitle: string;
    registerSubtitle: string;
    otpTitle: string;
    otpSubtitle: string;
    forgotTitle: string;
    forgotSubtitle: string;
    phoneLabel: string;
    phonePlaceholder: string;
    nameLabel: string;
    namePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    confirmPasswordLabel: string;
    confirmPasswordPlaceholder: string;
    methodOtp: string;
    methodPassword: string;
    forgotPasswordLink: string;
    termsAgreement: string;
    loginBtn: string;
    registerBtn: string;
    sendOtpBtn: string;
    verifyOtpBtn: string;
    resetPasswordBtn: string;
    backBtn: string;
    resendCode: string;
    resendIn: string;
    changePhone: string;
    orContinueWith: string;
    googleBtn: string;
    telegramBtn: string;
    secureNote: string;
    demoOtpNote: string;
    alreadyHaveAccount: string;
    dontHaveAccount: string;
    passwordStrength: {
      weak: string;
      medium: string;
      strong: string;
    };
    validation: {
      nameRequired: string;
      phoneRequired: string;
      phoneInvalid: string;
      passwordRequired: string;
      passwordTooShort: string;
      passwordsDoNotMatch: string;
      termsRequired: string;
      otpRequired: string;
      otpInvalid: string;
    };
    messages: {
      otpSentSuccess: string;
      loginSuccess: string;
      registerSuccess: string;
      passwordResetSuccess: string;
    };
  };
}

export const translations: Record<Language, Translations> = {
  uz: {
    topBanner: {
      text: "Saytning rus va ingliz tillaridagi talqini ham mavjud",
      action: "Tilni tanlash",
    },
    nav: {
      platform: "Platforma",
      results: "Natijalar",
      reviews: "Sharhlar",
      pricing: "Narx",
      faq: "Savollar",
      login: "Kirish",
      start: "BOSHLASH",
      profile: "Profil",
      logout: "Chiqish",
    },
    hero: {
      badge: "7 kunlik bepul sinov · Barcha mock testlar ochiq",
      score: "9.0",
      scoreSubtitle: "IELTS & Milliy test darajasi",
      headlineStart: "Ingliz tilidan kerakli balni ",
      headlineHighlight: "birinchi urinishda",
      headlineEnd: " oling",
      subheadline: "Haqiqiy imtihon muhiti, batafsil tahlil va xatolar ustida ishlash. Barcha darajalar uchun sinov testlari bir joyda.",
      btnStart: "TAYYORLANISHNI BOSHLASH",
      btnPlatform: "PLATFORMA",
      stats: {
        tests: "Ishlangan testlar",
        students: "Faol o'quvchilar",
        access: "Onlayn kirish imkoniyati",
      },
    },
    results: {
      badge: "Videolar va natijalar",
      title: "Natijalarimiz o'zi gapiradi",
      subtitle: "Ingliz tili imtihonlariga MockLife orqali tayyorlanib yuqori ball to'plagan o'quvchilar tajribasi.",
      btnStart: "TAYYORLANISHNI BOSHLASH",
      placeholderLabel: "[PLACEHOLDER: Video natija]",
      items: [
        "Natijalar tahlili va yechimlar",
        "Listening bo'yicha maslahatlar",
        "Reading strategiyalari",
        "Mock test tajribasi",
      ],
    },
    platform: {
      badge: "Platforma interfeysi",
      title: "Platforma ichiga nazar soling",
      subtitle: "Imtihon topshiruvchilar uchun maxsus yaratilgan ixcham, qulay va chalg'itmaydigan muhit.",
      tabs: ["Mock testlar", "Reja", "Batafsil izoh", "Statistika", "Lug'at", "Imtihon rejimi"],
      userLabel: "[Foydalanuvchi]",
      levelLabel: "Ingliz tili (B2-C1)",
      recommended: "Tavsiya etilgan",
      bannerTitle: "English Mock #12 — Full Simulation",
      bannerDesc: "Listening (40 savol) + Reading (40 savol) · Imtihon standartiga mos",
      bannerBtn: "Boshlash",
      activeSub: "Faol obuna:",
      timerLabel: "Real taymer bilan",
      streak: "Haftalik faollik: 5/7 kun faol",
      btnStart: "TAYYORLANISHNI BOSHLASH",
    },
    reviews: {
      badge: "Fikrlar va natijalar",
      title: "Minnatdor o'quvchilarimiz",
      ratingSuffix: "SHARH",
      scoreLabel: "BALL [0.0]",
      placeholderText: "[PLACEHOLDER: Sinov testlari orqali o'z darajamni aniqlab oldim va imtihonga to'liq tayyorlandim.]",
      dateLabel: "[PLACEHOLDER]",
      btnStart: "TAYYORLANISHNI BOSHLASH",
    },
    pricing: {
      badge: "Ochiq va shaffof narx",
      title: "Bitta oddiy va qulay narx",
      subtitle: "Hech qanday yashirin to'lovlarsiz, barcha ingliz tili testlari va tahlillariga to'liq kirish.",
      packageTitle: "Ingliz tili to'liq to'plami",
      mostPopular: "Eng ommabop",
      monthlyLabel: "Oylik to'lov",
      price: "29 000",
      currency: "so'm",
      period: "/ har oy uchun",
      btnSubscribe: "OBUNA BO'LISH",
      secureNote: "Xavfsiz to'lov va kafolatlangan kirish",
      features: [
        "Barcha ingliz tili mock testlariga cheksiz kirish",
        "Haqiqiy imtihon vaqtiga moslashtirilgan taymer",
        "Har bir savol bo'yicha batafsil izoh va tahlil",
        "Xatolar ustida ishlash bo'limi",
        "Shaxsiy ballar va o'sish statistikasi",
        "Telefonda va kompyuterda qulay ishlash",
      ],
    },
    faq: {
      badge: "Savollarga javoblar",
      title: "Ko'p so'raladigan savollar",
      subtitle: "Platforma, to'lovlar va mock testlar haqida eng ko'p beriladigan savollarga aniq javoblar.",
      items: [
        {
          q: "Platformada qaysi fanlardan testlar mavjud?",
          a: "Platformamiz faqat ingliz tili fani bo'yicha ixtisoslashgan. Barcha darajadagi testlar va imtihon formatlari mukammal ishlab chiqilgan.",
        },
        {
          q: "Obunani qanday to'layman va qancha vaqt amal qiladi?",
          a: "Oylik obuna narxi 29 000 so'm. To'lov qilingan kundan boshlab 30 kun davomida barcha testlar va imkoniyatlar to'liq ochiq bo'ladi.",
        },
        {
          q: "Testlarni telefondan yechish mumkinmi?",
          a: "Ha, MockLife to'liq mobile-first dizaynga ega. Smartfoningiz orqali istalgan joyda qulay test topshirishingiz mumkin.",
        },
      ],
    },
    footer: {
      desc: "Ingliz tili bo'yicha mustaqil sinov testlari platformasi. Imtihonga tayyorgarlik darajangizni aniq tekshiring va natijangizni yaxshilang.",
      botNotice: "Boshqaruv: Telegram Bot orqali integratsiya qilingan",
      quickLinks: "Bo'limlar",
      focusTitle: "Faqat ingliz tili fani",
      focusDesc: "Listening, Reading, Grammar va Full Mock formatidagi sinov testlari to'plami.",
      priceNote: "Narx: 29 000 so'm / oy",
      rights: "© 2026 MockLife. Barcha huquqlar himoyalangan.",
      terms: "Foydalanish shartlari",
      privacy: "Maxfiylik siyosati",
    },
    modals: {
      subscription: {
        title: "MockLife Obunasi",
        desc: "Barcha ingliz tili mock testlariga 30 kunlik cheksiz kirish.",
        subject: "Fan:",
        subjectVal: "Ingliz tili",
        duration: "Muddati:",
        durationVal: "1 oy (30 kun)",
        total: "Jami to'lov:",
        providerLabel: "To'lov tizimini tanlang:",
        payBtn: "To'lovga o'tish",
        secureNote: "Xavfsiz va tezkor to'lov",
        successMsg: "To'lov tizimi muvaffaqiyatli ishga tushirildi!",
      },
      login: {
        title: "Tizimga kirish",
        desc: "Mock testlarni davom ettirish uchun telefon raqamingizni kiriting.",
        phoneLabel: "Telefon raqam",
        codeLabel: "SMS tasdiqlash kodi",
        sendCodeBtn: "SMS kod olish",
        verifyBtn: "Tasdiqlash va kirish",
        codeSentMsg: "Tasdiqlash kodi telefoningizga yuborildi (Test rejimida: 1234)",
        successMsg: "Muvaffaqiyatli tizimga kirildi!",
      },
    },
    auth: {
      loginTab: "Kirish",
      registerTab: "Ro'yxatdan o'tish",
      loginTitle: "Tizimga kirish",
      loginSubtitle: "Mock testlarni davom ettirish va natijalaringizni ko'rish uchun kiring",
      registerTitle: "Yangi hisob yaratish",
      registerSubtitle: "Ingliz tili mock testlarini boshlash uchun ro'yxatdan o'ting",
      otpTitle: "Tasdiqlash kodi",
      otpSubtitle: "raqamiga 4 xonali SMS tasdiqlash kodi yuborildi",
      forgotTitle: "Parolni tiklash",
      forgotSubtitle: "Hisobingizga bog'langan telefon raqamini kiriting",
      phoneLabel: "Telefon raqami",
      phonePlaceholder: "+998 90 123 45 67",
      nameLabel: "Ismingiz",
      namePlaceholder: "Masalan: Jasur Aliyev",
      emailLabel: "Elektron pochta (ixtiyoriy)",
      emailPlaceholder: "example@mail.com",
      passwordLabel: "Parol",
      passwordPlaceholder: "••••••••",
      confirmPasswordLabel: "Parolni takrorlang",
      confirmPasswordPlaceholder: "••••••••",
      methodOtp: "SMS kod orqali (Tezkor)",
      methodPassword: "Parol orqali",
      forgotPasswordLink: "Parolni unutdingizmi?",
      termsAgreement: "Foydalanish shartlari va Maxfiylik siyosatiga roziman",
      loginBtn: "KIRISH",
      registerBtn: "RO'YXATDAN O'TISH",
      sendOtpBtn: "SMS KOD OLISH",
      verifyOtpBtn: "TASDIQLASH VA KIRISH",
      resetPasswordBtn: "PAROLNI YANGILASH",
      backBtn: "Orqaga",
      resendCode: "Kodni qayta yuborish",
      resendIn: "Qayta yuborish:",
      changePhone: "Raqamni o'zgartirish",
      orContinueWith: "Yoki quyidagilar orqali",
      googleBtn: "Google orqali kirish",
      telegramBtn: "Telegram orqali kirish",
      secureNote: "Shaxsiy ma'lumotlaringiz 256-bit shifrlash bilan himoyalangan",
      demoOtpNote: "Test rejimida demo SMS kodi: 1234",
      alreadyHaveAccount: "Profilingiz bormi?",
      dontHaveAccount: "Profilingiz yo'qmi?",
      passwordStrength: {
        weak: "Zaif",
        medium: "O'rtacha",
        strong: "Kuchli",
      },
      validation: {
        nameRequired: "Iltimos, ismingizni kiriting",
        phoneRequired: "Telefon raqami kiritilishi shart",
        phoneInvalid: "Telefon raqami noto'g'ri (+998 bilan 9 ta raqam bo'lishi kerak)",
        passwordRequired: "Parolni kiriting",
        passwordTooShort: "Parol kamida 6 ta belgidan iborat bo'lishi kerak",
        passwordsDoNotMatch: "Kiritilgan parollar bir-biriga mos kelmadi",
        termsRequired: "Davom etish uchun shartlarga rozilik bildiring",
        otpRequired: "4 xonali kodni to'liq kiriting",
        otpInvalid: "Kiritilgan kod xato, qayta urinib ko'ring (Demo kod: 1234)",
      },
      messages: {
        otpSentSuccess: "SMS tasdiqlash kodi telefoningizga yuborildi!",
        loginSuccess: "Tizimga muvaffaqiyatli kirdingiz!",
        registerSuccess: "Ro'yxatdan muvaffaqiyatli o'tdingiz!",
        passwordResetSuccess: "Parolingiz muvaffaqiyatli yangilandi!",
      },
    },
  },
  ru: {
    topBanner: {
      text: "Доступны также узбекская и английская версии сайта",
      action: "Выбрать язык",
    },
    nav: {
      platform: "Платформа",
      results: "Результаты",
      reviews: "Отзывы",
      pricing: "Тариф",
      faq: "Вопросы",
      login: "Войти",
      start: "НАЧАТЬ",
      profile: "Профиль",
      logout: "Выйти",
    },
    hero: {
      badge: "7 дней бесплатного пробного периода · Все тесты открыты",
      score: "9.0",
      scoreSubtitle: "Уровень IELTS и гос. тестов",
      headlineStart: "Получите желаемый балл ",
      headlineHighlight: "с первой попытки",
      headlineEnd: " по английскому",
      subheadline: "Реальная экзаменационная среда, детальный разбор каждого вопроса и работа над ошибками. Полные пробные тесты в одном месте.",
      btnStart: "НАЧАТЬ ПОДГОТОВКУ",
      btnPlatform: "ПЛАТФОРМА",
      stats: {
        tests: "Сданных тестов",
        students: "Активных студентов",
        access: "Круглосуточный доступ 24/7",
      },
    },
    results: {
      badge: "Видео и результаты",
      title: "Наши результаты говорят сами за себя",
      subtitle: "Опыт и реальные достижения студентов, подготовившихся к экзаменам по английскому языку через MockLife.",
      btnStart: "НАЧАТЬ ПОДГОТОВКУ",
      placeholderLabel: "[PLACEHOLDER: Видео результат]",
      items: [
        "Разбор результатов и решений",
        "Советы по аудированию (Listening)",
        "Стратегии чтения (Reading)",
        "Опыт прохождения Mock теста",
      ],
    },
    platform: {
      badge: "Интерфейс платформы",
      title: "Взгляните внутрь платформы",
      subtitle: "Компактная, продуманная среда без лишних отвлечений, разработанная специально для сдающих экзамены.",
      tabs: ["Пробные тесты", "План", "Разбор", "Статистика", "Словарь", "Экзамен"],
      userLabel: "[Пользователь]",
      levelLabel: "Английский (B2-C1)",
      recommended: "Рекомендуется",
      bannerTitle: "English Mock #12 — Full Simulation",
      bannerDesc: "Listening (40 вопросов) + Reading (40 вопросов) · Стандарт экзамена",
      bannerBtn: "Начать",
      activeSub: "Активная подписка:",
      timerLabel: "С реальным таймером",
      streak: "Недельная активность: 5/7 дней",
      btnStart: "НАЧАТЬ ПОДГОТОВКУ",
    },
    reviews: {
      badge: "Отзывы и результаты",
      title: "Благодарные ученики",
      ratingSuffix: "ОТЗЫВОВ",
      scoreLabel: "БАЛЛ [0.0]",
      placeholderText: "[PLACEHOLDER: С помощью этих пробных тестов я точно оценил свой уровень и подготовился к экзамену.]",
      dateLabel: "[PLACEHOLDER]",
      btnStart: "НАЧАТЬ ПОДГОТОВКУ",
    },
    pricing: {
      badge: "Прозрачные условия",
      title: "Одна простая и доступная цена",
      subtitle: "Никаких скрытых платежей: полный доступ ко всем пробным тестам и аналитике по английскому языку.",
      packageTitle: "Полный пакет английского языка",
      mostPopular: "Популярный",
      monthlyLabel: "Оплата за месяц",
      price: "29 000",
      currency: "сум",
      period: "/ в месяц",
      btnSubscribe: "ОФОРМИТЬ ПОДПИСКУ",
      secureNote: "Безопасная оплата и мгновенный доступ",
      features: [
        "Неограниченный доступ ко всем mock тестам по английскому",
        "Таймер, адаптированный под формат реального экзамена",
        "Подробное объяснение и разбор каждого вопроса",
        "Специальный раздел работы над ошибками",
        "Личная статистика баллов и прогресса",
        "Удобно заниматься на смартфоне и компьютере",
      ],
    },
    faq: {
      badge: "Ответы на вопросы",
      title: "Часто задаваемые вопросы",
      subtitle: "Четкие и понятные ответы на самые частые вопросы о платформе, подписке и тестах.",
      items: [
        {
          q: "По каким предметам доступны тесты на платформе?",
          a: "Наша платформа специализируется исключительно на английском языке. Тесты всех уровней и стандарты экзаменов проработаны до мелочей.",
        },
        {
          q: "Как оплатить подписку и на сколько она действует?",
          a: "Стоимость месячной подписки составляет 29 000 сум. С момента оплаты все тесты и аналитика открыты на 30 дней.",
        },
        {
          q: "Можно ли проходить тесты со смартфона?",
          a: "Да, MockLife создан по принципу mobile-first. Вы можете комфортно решать тесты с любого смартфона в любом месте.",
        },
      ],
    },
    footer: {
      desc: "Платформа независимых пробных тестов по английскому языку. Проверьте уровень подготовки и повысьте свой результат.",
      botNotice: "Управление: интеграция через Telegram-бота",
      quickLinks: "Разделы",
      focusTitle: "Только английский язык",
      focusDesc: "Наборы тестов по Listening, Reading, Grammar и полной симуляции Mock.",
      priceNote: "Цена: 29 000 сум / месяц",
      rights: "© 2026 MockLife. Все права защищены.",
      terms: "Условия использования",
      privacy: "Политика конфиденциальности",
    },
    modals: {
      subscription: {
        title: "Подписка MockLife",
        desc: "30 дней неограниченного доступа ко всем пробным тестам по английскому языку.",
        subject: "Предмет:",
        subjectVal: "Английский язык",
        duration: "Срок:",
        durationVal: "1 месяц (30 дней)",
        total: "К оплате:",
        providerLabel: "Выберите платежную систему:",
        payBtn: "Перейти к оплате",
        secureNote: "Безопасный и быстрый платеж",
        successMsg: "Платежный шлюз успешно активирован!",
      },
      login: {
        title: "Вход в систему",
        desc: "Введите номер телефона для продолжения работы с mock тестами.",
        phoneLabel: "Номер телефона",
        codeLabel: "Код из SMS",
        sendCodeBtn: "Получить SMS код",
        verifyBtn: "Подтвердить и войти",
        codeSentMsg: "Код подтверждения отправлен на телефон (тестовый: 1234)",
        successMsg: "Вы успешно вошли в систему!",
      },
    },
    auth: {
      loginTab: "Вход",
      registerTab: "Регистрация",
      loginTitle: "Вход в систему",
      loginSubtitle: "Войдите для продолжения mock тестов и просмотра результатов",
      registerTitle: "Создать аккаунт",
      registerSubtitle: "Зарегистрируйтесь, чтобы начать тренировочные тесты по английскому",
      otpTitle: "Код подтверждения",
      otpSubtitle: "на номер отправлен 4-значный SMS-код подтверждения",
      forgotTitle: "Восстановление пароля",
      forgotSubtitle: "Введите номер телефона, привязанный к вашему аккаунту",
      phoneLabel: "Номер телефона",
      phonePlaceholder: "+998 90 123 45 67",
      nameLabel: "Ваше имя",
      namePlaceholder: "Например: Жасур Алиев",
      emailLabel: "Электронная почта (необязательно)",
      emailPlaceholder: "example@mail.com",
      passwordLabel: "Пароль",
      passwordPlaceholder: "••••••••",
      confirmPasswordLabel: "Повторите пароль",
      confirmPasswordPlaceholder: "••••••••",
      methodOtp: "Через SMS-код (Быстро)",
      methodPassword: "По паролю",
      forgotPasswordLink: "Забыли пароль?",
      termsAgreement: "Я согласен с Условиями использования и Политикой конфиденциальности",
      loginBtn: "ВОЙТИ",
      registerBtn: "ЗАРЕГИСТРИРОВАТЬСЯ",
      sendOtpBtn: "ПОЛУЧИТЬ SMS КОД",
      verifyOtpBtn: "ПОДТВЕРДИТЬ И ВОЙТИ",
      resetPasswordBtn: "ОБНОВИТЬ ПАРОЛЬ",
      backBtn: "Назад",
      resendCode: "Отправить код повторно",
      resendIn: "Повтор через:",
      changePhone: "Изменить номер",
      orContinueWith: "Или через сервисы",
      googleBtn: "Войти через Google",
      telegramBtn: "Войти через Telegram",
      secureNote: "Ваши личные данные надежно защищены 256-битным шифрованием",
      demoOtpNote: "Тестовый SMS код: 1234",
      alreadyHaveAccount: "Уже есть аккаунт?",
      dontHaveAccount: "Еще нет аккаунта?",
      passwordStrength: {
        weak: "Слабый",
        medium: "Средний",
        strong: "Надежный",
      },
      validation: {
        nameRequired: "Пожалуйста, введите ваше имя",
        phoneRequired: "Номер телефона обязателен",
        phoneInvalid: "Неверный номер телефона (+998 и 9 цифр)",
        passwordRequired: "Введите пароль",
        passwordTooShort: "Пароль должен содержать минимум 6 символов",
        passwordsDoNotMatch: "Пароли не совпадают",
        termsRequired: "Необходимо согласие с условиями",
        otpRequired: "Введите 4-значный код полностью",
        otpInvalid: "Неверный код подтверждения (Демо код: 1234)",
      },
      messages: {
        otpSentSuccess: "SMS-код подтверждения отправлен на ваш телефон!",
        loginSuccess: "Вы успешно вошли в систему!",
        registerSuccess: "Регистрация прошла успешно!",
        passwordResetSuccess: "Ваш пароль успешно обновлен!",
      },
    },
  },
  en: {
    topBanner: {
      text: "Uzbek and Russian versions of this site are also available",
      action: "Change language",
    },
    nav: {
      platform: "Platform",
      results: "Results",
      reviews: "Reviews",
      pricing: "Pricing",
      faq: "FAQ",
      login: "Log in",
      start: "START",
      profile: "Profile",
      logout: "Log out",
    },
    hero: {
      badge: "7-Day Free Trial · Unlimited Access to All Mock Tests",
      score: "9.0",
      scoreSubtitle: "IELTS & Mock Standard Band",
      headlineStart: "Get the band score you want — ",
      headlineHighlight: "on your first try",
      headlineEnd: "",
      subheadline: "Real exam simulation, in-depth explanations, and systematic mistake review. Complete English mock tests all in one place.",
      btnStart: "START PREPARATION",
      btnPlatform: "PLATFORM",
      stats: {
        tests: "Tests completed",
        students: "Active students",
        access: "24/7 Online access",
      },
    },
    results: {
      badge: "Videos & Results",
      title: "Our results speak for themselves",
      subtitle: "Real stories and high-band achievements from students preparing with MockLife.",
      btnStart: "START PREPARATION",
      placeholderLabel: "[PLACEHOLDER: Video result]",
      items: [
        "Results breakdown & answer keys",
        "Listening section master tips",
        "Reading speed & accuracy strategies",
        "Full mock test exam walkthrough",
      ],
    },
    platform: {
      badge: "Platform Interface",
      title: "A look inside the platform",
      subtitle: "Clean, distraction-free environment engineered exclusively for ambitious test takers.",
      tabs: ["Mock Tests", "Study Plan", "Explanations", "Statistics", "Vocabulary", "Exam Mode"],
      userLabel: "[Student]",
      levelLabel: "English (B2-C1)",
      recommended: "Recommended",
      bannerTitle: "English Mock #12 — Full Simulation",
      bannerDesc: "Listening (40 questions) + Reading (40 questions) · Strict timed standard",
      bannerBtn: "Start Now",
      activeSub: "Active pass:",
      timerLabel: "Real exam timer",
      streak: "Weekly consistency: 5/7 active days",
      btnStart: "START PREPARATION",
    },
    reviews: {
      badge: "Feedback & Scores",
      title: "Grateful Students",
      ratingSuffix: "REVIEWS",
      scoreLabel: "BAND [0.0]",
      placeholderText: "[PLACEHOLDER: Through timed mock tests I accurately calibrated my real exam score and achieved my target band.]",
      dateLabel: "[PLACEHOLDER]",
      btnStart: "START PREPARATION",
    },
    pricing: {
      badge: "Simple & Clear",
      title: "One simple and accessible price",
      subtitle: "No hidden charges: unlimited access to all English mock tests, explanations, and score tracking.",
      packageTitle: "Complete English Mock Pass",
      mostPopular: "Most Popular",
      monthlyLabel: "Monthly billing",
      price: "29,000",
      currency: "UZS",
      period: "/ per month",
      btnSubscribe: "SUBSCRIBE NOW",
      secureNote: "Secure checkout & instant activation",
      features: [
        "Unlimited access to all English mock tests",
        "Official exam timed simulation",
        "Detailed step-by-step answers & explanations",
        "Dedicated error analysis laboratory",
        "Personal score tracking & progression analytics",
        "Flawless mobile & desktop experience",
      ],
    },
    faq: {
      badge: "Help & Answers",
      title: "Frequently Asked Questions",
      subtitle: "Clear answers to the most common questions regarding MockLife, subscriptions, and exam tests.",
      items: [
        {
          q: "What subjects are available on MockLife?",
          a: "Our platform is 100% specialized in English. Every test format, section, and difficulty level is crafted specifically for English tests.",
        },
        {
          q: "How does the subscription work and how long is it valid?",
          a: "The monthly pass is 29,000 UZS. It unlocks unlimited access across all test sets for 30 consecutive days from activation.",
        },
        {
          q: "Can I take mock tests on my smartphone?",
          a: "Yes! MockLife is engineered with a strict mobile-first design so you can test smoothly anywhere on your phone.",
        },
      ],
    },
    footer: {
      desc: "Independent English mock test simulation platform. Verify your readiness and achieve your target band score.",
      botNotice: "Admin Control: Seamlessly integrated via Telegram Bot",
      quickLinks: "Navigation",
      focusTitle: "English Only Focus",
      focusDesc: "Listening, Reading, Grammar and Full Exam simulations.",
      priceNote: "Rate: 29,000 UZS / month",
      rights: "© 2026 MockLife. All rights reserved.",
      terms: "Terms of Service",
      privacy: "Privacy Policy",
    },
    modals: {
      subscription: {
        title: "MockLife Subscription",
        desc: "30 days of unlimited access to all English mock tests and analytics.",
        subject: "Subject:",
        subjectVal: "English",
        duration: "Duration:",
        durationVal: "1 month (30 days)",
        total: "Total amount:",
        providerLabel: "Choose payment provider:",
        payBtn: "Proceed to Payment",
        secureNote: "Encrypted & instant transaction",
        successMsg: "Payment gateway initialized successfully!",
      },
      login: {
        title: "Sign In",
        desc: "Enter your phone number to continue your mock test sessions.",
        phoneLabel: "Phone number",
        codeLabel: "SMS Verification Code",
        sendCodeBtn: "Send SMS code",
        verifyBtn: "Verify & Enter",
        codeSentMsg: "Verification code sent to your phone (Test mode: 1234)",
        successMsg: "Successfully authenticated!",
      },
    },
    auth: {
      loginTab: "Sign In",
      registerTab: "Register",
      loginTitle: "Sign in to MockLife",
      loginSubtitle: "Sign in to continue your mock tests and check your analytics",
      registerTitle: "Create an Account",
      registerSubtitle: "Sign up to begin your official English mock examination practice",
      otpTitle: "Verification Code",
      otpSubtitle: "a 4-digit SMS verification code was sent to",
      forgotTitle: "Reset Password",
      forgotSubtitle: "Enter the phone number connected to your account",
      phoneLabel: "Phone Number",
      phonePlaceholder: "+998 90 123 45 67",
      nameLabel: "Full Name",
      namePlaceholder: "E.g. Jasur Aliyev",
      emailLabel: "Email (Optional)",
      emailPlaceholder: "example@mail.com",
      passwordLabel: "Password",
      passwordPlaceholder: "••••••••",
      confirmPasswordLabel: "Confirm Password",
      confirmPasswordPlaceholder: "••••••••",
      methodOtp: "Via SMS Code (Instant)",
      methodPassword: "Via Password",
      forgotPasswordLink: "Forgot password?",
      termsAgreement: "I agree to the Terms of Service and Privacy Policy",
      loginBtn: "SIGN IN",
      registerBtn: "CREATE ACCOUNT",
      sendOtpBtn: "SEND SMS CODE",
      verifyOtpBtn: "VERIFY & ENTER",
      resetPasswordBtn: "RESET PASSWORD",
      backBtn: "Back",
      resendCode: "Resend code",
      resendIn: "Resend in:",
      changePhone: "Change phone",
      orContinueWith: "Or continue with",
      googleBtn: "Continue with Google",
      telegramBtn: "Continue with Telegram",
      secureNote: "Your data is encrypted and securely protected with 256-bit SSL",
      demoOtpNote: "Demo test OTP code: 1234",
      alreadyHaveAccount: "Already have an account?",
      dontHaveAccount: "Don't have an account?",
      passwordStrength: {
        weak: "Weak",
        medium: "Medium",
        strong: "Strong",
      },
      validation: {
        nameRequired: "Please enter your name",
        phoneRequired: "Phone number is required",
        phoneInvalid: "Invalid phone number format (+998 and 9 digits)",
        passwordRequired: "Password is required",
        passwordTooShort: "Password must be at least 6 characters",
        passwordsDoNotMatch: "Passwords do not match",
        termsRequired: "You must accept terms and conditions",
        otpRequired: "Please enter the complete 4-digit code",
        otpInvalid: "Invalid verification code (Demo code: 1234)",
      },
      messages: {
        otpSentSuccess: "SMS verification code sent to your phone!",
        loginSuccess: "Successfully signed in!",
        registerSuccess: "Account registered successfully!",
        passwordResetSuccess: "Password reset successfully!",
      },
    },
  },
};

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = (localStorage.getItem('mocklife_lang') || localStorage.getItem('mockeng_lang')) as Language;
    if (saved && (saved === 'uz' || saved === 'ru' || saved === 'en')) {
      return saved;
    }
    return 'uz';
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('mocklife_lang', newLang);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};


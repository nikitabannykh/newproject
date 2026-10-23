// Флаги функций прототипа
const FEATURES={categoryCounts:false};
const TODAY = new Date();
const CATS={flour:'Мука и крупы',dairy:'Молочная продукция',fish:'Рыба и морепродукты',meat:'Мясо и птица',veg:'Овощи и фрукты',spice:'Специи и ингредиенты',oil:'Масла и жиры',ready:'Готовая продукция',pack:'Упаковка'};
// [ключ, название, рубрики 2ГИС, уточнение внутри рубрики, шаблон для демо-каталога и релевантности]
const SUBS={
 flour:[['flourw','Мука',[3232],'мука',/мук/],['groats','Крупы',[3232],'крупы',/круп|греч|рис|манн/],['fraw','Сырьё для выпечки',[925],'',/смес|сырь|разрыхл|выпеч/]],
 dairy:[['milk','Молоко и сливки',[557],'молоко',/молок|сливк/],['cheese','Сыры',[935],'',/сыр|моцарел|маскарпоне/],['butter','Масло сливочное',[557],'сливочное масло',/сливоч/],['curd','Творог и кисломолочка',[557],'творог',/творог|кефир|сметан/]],
 fish:[['redfish','Красная рыба',[366],'лосось',/лосос|форел|сёмг|семг|кижуч|нерк|кет|горбуш/],['whitefish','Белая рыба',[366],'треска',/треск|минтай|тилапи|хек|судак|окун|пангасиус/],['seafood','Креветки и морепродукты',[366],'креветки',/кревет|кальмар|миди|краб|лангуст|осьмин|морепрод/],['caviar','Икра',[366],'икра',/икр/]],
 meat:[['beef','Говядина',[562],'говядина',/говяд/],['pork','Свинина',[562],'свинина',/свин/],['poultry','Птица',[712],'',/птиц|кур|филе|бедро/],['sausage','Колбасы и деликатесы',[4480],'',/колбас|деликат/],['halal','Халяль',[562,712],'халяль',/халял/]],
 veg:[['vegs','Овощи',[564],'овощи',/овощ|томат|огур|перец/],['fruits','Фрукты',[564],'фрукты',/фрукт/],['greens','Зелень',[564],'зелень',/зелен|микрозел|салат/],['berries','Ягоды и грибы',[110324],'',/ягод|гриб/]],
 spice:[['spices','Специи и приправы',[501],'',/специ|припра|паприк|ванил/],['sraw','Пищевое сырьё и ингредиенты',[925],'',/сырь|ингредиент|какао|шокол|разрыхл|стабилиз/]],
 oil:[['sun','Подсолнечное',[568],'подсолнечное',/подсолнеч/],['olive','Оливковое',[568],'оливковое',/олив/],['fry','Фритюрное',[568],'фритюр',/фритюр/]],
 ready:[['semi','Полуфабрикаты',[561],'',/полуфабрикат|пельмен|варени|хинкал/],['culinary','Кулинария и готовая еда',[16677],'',/суп|салат|гарнир|соус|кулинар/],['bakery','Хлеб и выпечка',[544],'',/круассан|выпечк|хлеб|тесто/]],
 pack:[['pmat','Упаковочные материалы',[635],'',/упаков/],['disp','Одноразовая посуда',[632],'',/стакан|ланч|контейнер|посуд|крышк/],['bags','Пакеты и плёнка',[626],'',/пакет|пл[её]нк/],['paper','Бумажная упаковка',[627],'',/бумаж|крафт/],['corr','Гофротара и коробки',[10291],'',/гофро|короб|пицц/]]
};
const SUB={};Object.entries(SUBS).forEach(([c,a])=>a.forEach(([k,n,r,q,re])=>SUB[k]={k,cat:c,name:n,r,q,re}));
const CAT_RUB={};Object.entries(SUBS).forEach(([c,a])=>CAT_RUB[c]=[...new Set(a.flatMap(x=>x[2]))]);
const FOOD_RUB=[...new Set(Object.values(CAT_RUB).flat().map(String))];
// счётчики: ключ `${region}|cat:${k}` или `${region}|sub:${k}`
const CNT={};const cntLoading=new Set();
const CAT_Q={fish:'рыба',flour:'мука',dairy:'молочная продукция',meat:'мясо',veg:'овощи фрукты',spice:'специи',oil:'растительное масло',ready:'полуфабрикаты',pack:'упаковка для общепита'};
const CAT_KW={fish:/рыб|морепрод|лосос|форел|сёмг|семг|икр|кревет/,flour:/мук|круп|хлебопек|зерн|сырь/,dairy:/молоч|сыр|молок|сливоч/,meat:/мяс|птиц|колбас|говяд|свин/,veg:/овощ|фрукт|плодоовощ|зелен|ягод/,spice:/специ|пряност|приправ|ингредиент|сырь|кондитерск/,oil:/масл|жир/,ready:/полуфабрикат|заморож|готов|выпечк|кулинар/,pack:/упаков|тара|одноразов|пакет|пл[её]нк|посуд/};
const REGIONS={msk:'Москва и МО',spb:'Санкт-Петербург',kzn:'Казань',ekb:'Екатеринбург',krd:'Краснодар',nsk:'Новосибирск'};
const REGION_IN={msk:'Москву',spb:'Петербург',kzn:'Казань',ekb:'Екатеринбург',krd:'Краснодар',nsk:'Новосибирск'};
const CODES={msk:'495',spb:'812',kzn:'843',ekb:'343',krd:'861',nsk:'383'};
const DOCS={decl:'Декларация ЕАЭС',haccp:'ХАССП',iso:'ISO 22000',halal:'Халяль',org:'Органик',vet:'ВСД «Меркурий»',contact:'Пищевой контакт',fsc:'FSC'};
const SRC={site:'Сайт компании',fsa:'Реестр деклараций ЕАЭС',merc:'ФГИС «Меркурий»',maps:'Карточка на картах',b2b:'B2B-каталог',egrul:'ЕГРЮЛ',owner:'Подтверждено поставщиком',twogis:'2ГИС'};
const DEMO_TYPES=['Производитель','Дистрибьютор','Импортёр','Фермер'];
const LIVE_TYPES=['Производитель','Оптовая компания','Импортёр','Компания','Розница'];
const STATUSES={candidate:'Кандидаты',contacted:'Написал',waiting:'Ждём КП',offer:'КП получено',approved:'Постоянный',reserve:'Резервный',rejected:'Не подходит'};
const CHOSEN=['approved','reserve'];
const PRESETS={balance:{label:'Баланс',w:{region:25,moq:25,docs:20,price:15,trust:15}},price:{label:'Цена',w:{region:15,moq:20,docs:15,price:35,trust:15}},trust:{label:'Надёжность',w:{region:20,moq:15,docs:30,price:10,trust:25}}};
const CRIT={region:'Регион',moq:'Мин. заказ',docs:'Документы',price:'Цена',trust:'Доверие к данным'};
const LW={profile:35,rel:25,rep:20,hours:10,full:10};
const LCRIT={profile:'Профиль B2B',rel:'Рубрика',rep:'Репутация',hours:'Режим работы',full:'Полнота карточки'};

// ---------- демо-каталог (вымышленные компании) ----------
const S=[
 {id:1,name:'Мельница «Заречье»',type:'Производитель',cat:'flour',city:'Серпухов',region:'msk',served:['msk','spb'],products:['Мука пшеничная в/с','Мука 1 сорта','Цельнозерновая мука'],moq:[500,'кг'],price:[34,'₽/кг','мука в/с, мешок 50 кг'],docs:{decl:'2027-08',haccp:'2026-12'},d:[1,0,'Своя, 2–3 дня','Своя машина, 2–3 рабочих дня. Бесплатно от 1 т'],pay:'Отсрочка 14 дней',verified:1,upd:'2026-10-12',src:['site','fsa','egrul','owner'],person:'Ирина Соколова',dom:'zarechye-mill',since:2009},
 {id:2,name:'Хлебная Нива',type:'Дистрибьютор',cat:'flour',city:'Москва',region:'msk',served:['msk'],products:['Мука в/с','Ржаная мука','Смеси для выпечки','Крупы'],moq:[50,'кг'],price:[41,'₽/кг','мука в/с'],docs:{decl:'2027-02'},d:[1,0,'Своя, на след. день','Своя доставка на следующий день, бесплатно от 300 кг'],pay:'Предоплата',verified:0,upd:'2026-09-28',src:['site','maps'],person:'Отдел продаж',dom:'hleb-niva',since:2015},
 {id:3,name:'Волжские зёрна',type:'Производитель',cat:'flour',city:'Казань',region:'kzn',served:['all'],products:['Мука в/с','Гречневая крупа','Рисовая мука'],moq:[2000,'кг'],price:[29,'₽/кг','мука в/с, от 2 т'],docs:{decl:'2027-05',haccp:'2027-01',halal:'2026-11'},d:[0,0,'ТК, 4–7 дней','Транспортной компанией по РФ, 4–7 дней'],pay:'Отсрочка 30 дней после 3 поставок',verified:1,upd:'2026-10-18',src:['site','fsa','egrul','owner'],person:'Ринат Галиев',dom:'volga-zerno',since:2004},
 {id:4,name:'ЗерноТрейд Юг',type:'Дистрибьютор',cat:'flour',city:'Краснодар',region:'krd',served:['krd','msk'],products:['Мука в/с','Манная крупа','Крупы'],moq:[1000,'кг'],price:null,docs:{decl:'2026-12',iso:'2027-04'},d:[0,0,'ТК, 3–5 дней','ТК до Москвы 3–5 дней'],pay:'Не указано',verified:0,upd:'2026-07-04',src:['b2b','site'],person:'',dom:'zernotrade-yug',since:2018},
 {id:25,name:'Балтийская мука',type:'Дистрибьютор',cat:'flour',city:'Санкт-Петербург',region:'spb',served:['spb'],products:['Мука в/с','Мука для пиццы тип 00','Крупы'],moq:[100,'кг'],price:[38,'₽/кг','мука в/с'],docs:{decl:'2027-03',haccp:'2027-06'},d:[1,0,'Своя, 1–2 дня','Своя доставка по СПб и ЛО, 1–2 дня'],pay:'Отсрочка 7 дней',verified:1,upd:'2026-10-10',src:['site','fsa','owner'],person:'Анна Лебедева',dom:'baltmuka',since:2012},
 {id:5,name:'Молочный двор «Озёры»',type:'Производитель',cat:'dairy',city:'Озёры',region:'msk',served:['msk'],products:['Сливки 33%','Молоко 3,2%','Творог 9%','Маскарпоне'],moq:[100,'кг'],price:[210,'₽/кг','сливки 33%'],docs:{decl:'2027-01',vet:'2027-10',haccp:'2026-12'},d:[1,1,'Своя, холод, ежедневно','Рефрижератор, ежедневно до 11:00'],pay:'Отсрочка 7 дней',verified:1,upd:'2026-10-20',src:['site','fsa','merc','owner'],person:'Сергей Котов',dom:'ozery-moloko',since:2011},
 {id:6,name:'Северное молоко',type:'Производитель',cat:'dairy',city:'Санкт-Петербург',region:'spb',served:['spb'],products:['Масло сливочное 82,5%','Сыры полутвёрдые'],moq:[200,'кг'],price:[620,'₽/кг','масло 82,5%'],docs:{decl:'2026-11',vet:'2027-10'},d:[1,1,'Своя, холод, 2 раза в нед.','Рефрижератор, вторник и пятница'],pay:'Предоплата',verified:0,upd:'2026-09-10',src:['site','merc'],person:'',dom:'sever-moloko',since:1998},
 {id:7,name:'ДайриЛайн',type:'Дистрибьютор',cat:'dairy',city:'Москва',region:'msk',served:['msk','spb'],products:['Моцарелла для пиццы','Сыры РФ и импорт','Сливочный сыр'],moq:[30,'кг'],price:[540,'₽/кг','моцарелла, блок 2 кг'],docs:{decl:'2027-04',vet:'2027-10'},d:[1,1,'Своя, холод, на след. день','Рефрижератор на следующий день, в СПб 2 раза в неделю'],pay:'Отсрочка 10 дней',verified:1,upd:'2026-10-05',src:['site','merc','owner'],person:'Олег Жуков',dom:'dairyline',since:2016},
 {id:8,name:'Птицеферма «Клин»',type:'Производитель',cat:'meat',city:'Клин',region:'msk',served:['msk'],products:['Курица охлаждённая','Филе грудки','Бедро без кости'],moq:[300,'кг'],price:[389,'₽/кг','филе грудки'],docs:{decl:'2027-02',vet:'2027-10',halal:'2027-03'},d:[1,1,'Своя, холод, 1 день','Рефрижератор, заказ до 16:00 на завтра'],pay:'Отсрочка 7 дней',verified:1,upd:'2026-10-15',src:['site','merc','fsa','owner'],person:'Марина Белова',dom:'klin-ptica',since:2007},
 {id:9,name:'МясОпт Урал',type:'Дистрибьютор',cat:'meat',city:'Екатеринбург',region:'ekb',served:['ekb'],products:['Говядина','Свинина','Субпродукты'],moq:[500,'кг'],price:[455,'₽/кг','говядина, лопатка'],docs:{decl:'2026-12',vet:'2027-10'},d:[1,1,'Своя, холод','Рефрижератор по Екатеринбургу'],pay:'Предоплата',verified:0,upd:'2026-08-20',src:['b2b','maps'],person:'',dom:'myasopt-ural',since:2013},
 {id:10,name:'Казанский мясной двор',type:'Производитель',cat:'meat',city:'Казань',region:'kzn',served:['kzn','msk'],products:['Говядина халяль','Баранина','Курица халяль'],moq:[200,'кг'],price:[610,'₽/кг','говядина халяль'],docs:{decl:'2027-06',vet:'2027-10',halal:'2027-01',haccp:'2027-02'},d:[0,1,'ТК, холод, 2 дня','Рефрижераторная ТК, в Москву 2 дня'],pay:'Отсрочка 14 дней',verified:1,upd:'2026-10-01',src:['site','merc','fsa','owner'],person:'Айдар Хасанов',dom:'kzn-myaso',since:2010},
 {id:11,name:'Зелёный ряд',type:'Дистрибьютор',cat:'veg',city:'Москва',region:'msk',served:['msk'],products:['Овощи','Зелень','Ягоды','Фрукты'],moq:[20,'кг'],price:null,docs:{decl:'2027-01'},d:[1,1,'Своя, утром до 10:00','Своя доставка ежедневно до 10:00'],pay:'Отсрочка 7 дней',verified:1,upd:'2026-10-21',src:['site','owner'],person:'Дмитрий Орлов',dom:'zeleny-ryad',since:2017},
 {id:12,name:'Кубань-Фреш',type:'Производитель',cat:'veg',city:'Краснодар',region:'krd',served:['krd','msk','spb'],products:['Томаты тепличные','Огурцы','Перец'],moq:[1000,'кг'],price:[145,'₽/кг','томаты'],docs:{decl:'2027-03'},d:[0,1,'ТК, холод, 2–3 дня','Рефрижераторная ТК, 2–3 дня'],pay:'Предоплата 50%',verified:0,upd:'2026-10-09',src:['site','b2b'],person:'',dom:'kuban-fresh',since:2014},
 {id:13,name:'ЭкоГрядка',type:'Фермер',cat:'veg',city:'Дмитров',region:'msk',served:['msk'],products:['Микрозелень','Салатные миксы','Сезонные овощи'],moq:[10,'кг'],price:[320,'₽/кг','салатный микс'],docs:{decl:'2027-05',org:'2027-02'},d:[1,1,'Своя, 2 раза в нед.','Своя доставка вт и пт'],pay:'По факту',verified:1,upd:'2026-10-14',src:['site','fsa','owner'],person:'Ольга Ветрова',dom:'ecogryadka',since:2020},
 {id:14,name:'Пряный путь',type:'Импортёр',cat:'spice',city:'Москва',region:'msk',served:['all'],products:['Специи','Приправы','Ваниль'],moq:[5,'кг'],price:[890,'₽/кг','паприка копчёная'],docs:{decl:'2027-07',haccp:'2027-01',halal:'2027-04'},d:[0,0,'ТК, 2–5 дней','ТК по РФ, в Москве своя доставка'],pay:'Отсрочка 14 дней',verified:1,upd:'2026-10-11',src:['site','fsa','owner'],person:'Елена Мирзоева',dom:'pryany-put',since:2008},
 {id:15,name:'ИнгредиентСнаб',type:'Дистрибьютор',cat:'spice',city:'Санкт-Петербург',region:'spb',served:['all'],products:['Какао-порошок','Шоколад','Разрыхлители'],moq:[25,'кг'],price:[640,'₽/кг','какао-порошок'],docs:{decl:'2027-02',iso:'2027-09',haccp:'2027-03'},d:[0,0,'ТК, 3–6 дней','ТК по РФ'],pay:'Отсрочка 21 день',verified:1,upd:'2026-09-30',src:['site','fsa','owner'],person:'Павел Громов',dom:'ingredsnab',since:2012},
 {id:16,name:'Маслозавод «Приволжье»',type:'Производитель',cat:'oil',city:'Казань',region:'kzn',served:['all'],products:['Масло подсолнечное','Масло для фритюра'],moq:[1000,'кг'],price:[118,'₽/кг','подсолнечное рафинированное'],docs:{decl:'2027-01',haccp:'2026-11',halal:'2027-02'},d:[0,0,'ТК, 3–7 дней','ТК по РФ'],pay:'Предоплата',verified:0,upd:'2026-10-02',src:['site','fsa'],person:'',dom:'privolzhye-oil',since:2001},
 {id:17,name:'Олива Трейд',type:'Импортёр',cat:'oil',city:'Москва',region:'msk',served:['msk','spb'],products:['Оливковое масло','Кунжутное масло'],moq:[50,'кг'],price:[980,'₽/кг','оливковое Extra Virgin'],docs:{decl:'2026-12'},d:[1,0,'Своя, 1–2 дня','Своя доставка по Москве'],pay:'Предоплата',verified:0,upd:'2026-08-01',src:['b2b'],person:'',dom:'olivatrade',since:2019},
 {id:22,name:'Фабрика-кухня «Пятый цех»',type:'Производитель',cat:'ready',city:'Москва',region:'msk',served:['msk'],products:['Супы','Салаты','Гарниры','Соусы'],moq:[30,'кг'],price:[280,'₽/кг','гарниры, средняя'],docs:{decl:'2027-04',haccp:'2027-01'},d:[1,1,'Своя, холод, ежедневно','Ежедневно до 9:00, гастроёмкости'],pay:'Отсрочка 7 дней',verified:1,upd:'2026-10-17',src:['site','fsa','owner'],person:'Никита Рябов',dom:'pyaty-ceh',since:2018},
 {id:23,name:'Заморозка Про',type:'Производитель',cat:'ready',city:'Подольск',region:'msk',served:['msk','spb'],products:['Круассаны','Слоёное тесто','Замороженная выпечка'],moq:[100,'кг'],price:[410,'₽/кг','круассан сливочный'],docs:{decl:'2027-02',haccp:'2027-05',iso:'2027-07'},d:[0,1,'ТК, мороз, 1–3 дня','Морозильная ТК, в СПб 3 дня'],pay:'Отсрочка 14 дней',verified:1,upd:'2026-10-08',src:['site','fsa','owner'],person:'Ксения Ильина',dom:'zamorozka-pro',since:2015},
 {id:24,name:'Пельменная мануфактура',type:'Производитель',cat:'ready',city:'Новосибирск',region:'nsk',served:['all'],products:['Пельмени','Вареники','Хинкали'],moq:[300,'кг'],price:[360,'₽/кг','пельмени говядина'],docs:{decl:'2027-01',vet:'2027-10',halal:'2026-12'},d:[0,1,'ТК, мороз, 5–8 дней','Морозильная ТК по РФ'],pay:'Предоплата',verified:0,upd:'2026-09-22',src:['site','merc'],person:'',dom:'pelmen-man',since:2006},
 {id:18,name:'ЭкоТара',type:'Производитель',cat:'pack',city:'Химки',region:'msk',served:['all'],products:['Бумажные стаканы 250–450 мл','Крафт-контейнеры','Крафт-пакеты'],moq:[5000,'шт'],price:[4.2,'₽/шт','стакан 350 мл'],docs:{contact:'2027-06',fsc:'2027-03'},d:[1,0,'Своя / ТК, 2–4 дня','По Москве своя, по РФ ТК'],pay:'Отсрочка 14 дней',verified:1,upd:'2026-10-16',src:['site','fsa','owner'],person:'Артём Назаров',dom:'ecotara',since:2013},
 {id:19,name:'ПакСервис',type:'Дистрибьютор',cat:'pack',city:'Москва',region:'msk',served:['msk'],products:['Ланч-боксы','Пищевая плёнка','Одноразовая посуда','Стаканы'],moq:[500,'шт'],price:[6.8,'₽/шт','ланч-бокс'],docs:{contact:'2027-01'},d:[1,0,'Своя, на след. день','Своя доставка на следующий день, бесплатно от 15 000 ₽'],pay:'По факту',verified:1,upd:'2026-10-19',src:['site','owner'],person:'Виктория Ким',dom:'paksrv',since:2016},
 {id:20,name:'Невская упаковка',type:'Производитель',cat:'pack',city:'Санкт-Петербург',region:'spb',served:['spb','msk'],products:['Коробки для пиццы','Гофрокороба','Печать логотипа'],moq:[3000,'шт'],price:[18,'₽/шт','коробка для пиццы 33 см'],docs:{contact:'2027-02',fsc:'2027-05',iso:'2027-04'},d:[0,0,'ТК, 3–5 дней','ТК, в Москву 3–5 дней'],pay:'Предоплата 50%',verified:0,upd:'2026-09-12',src:['site','b2b'],person:'',dom:'nevpack',since:2005},
 {id:21,name:'ПолимерПак Сибирь',type:'Производитель',cat:'pack',city:'Новосибирск',region:'nsk',served:['nsk','ekb'],products:['Вакуумные пакеты','Лотки','Термоусадочная плёнка'],moq:[10000,'шт'],price:[2.1,'₽/шт','вакуумный пакет 20×30'],docs:{contact:'2026-12'},d:[0,0,'ТК, 4–6 дней','ТК'],pay:'Предоплата',verified:0,upd:'2026-06-25',src:['b2b'],person:'',dom:'polimerpak-sib',since:2011}
];
S.forEach(s=>{s.id=String(s.id);const a=200+(+s.id)*13,b=10+((+s.id)*7)%89,c=10+((+s.id)*17)%89;s.phone=`+7 (${CODES[s.region]}) ${a}-${b}-${c}`;s.email=`sales@${s.dom}.example`;s.site=`${s.dom}.example`;});

// ---------- состояние ----------
const DEF={minRating:0,noRetail:false,cashless:false,withReviews:false,weekend:false,subs:[],cat:'',region:'msk',vol:0,unit:'кг',docs:[],types:[],onlyRegion:false,verified:false,priceKnown:false,preset:'balance',sort:'match'};
let st=JSON.parse(JSON.stringify(DEF));
st.source='demo';
const L={avail:false,items:[],page:0,hasMore:false,total:0,loading:false,error:'',fetchedAt:null,query:''};
let work=null;
try{work=JSON.parse(localStorage.getItem('snab-work-v2')||'null')}catch(e){}
const fresh=!work;
if(!work)work={compare:[],status:{},notes:{},live:{}};
work.offers=work.offers||{};work.viewed=work.viewed||{};work.enrich=work.enrich||{};work.sites=work.sites||{};work.hidden=work.hidden||{};work.egrul=work.egrul||{};
const expanded=new Set();work.progress=work.progress||{};let showHidden=false;
work.live=work.live||{};
const save=()=>{try{localStorage.setItem('snab-work-v2',JSON.stringify(work))}catch(e){}};
let showFilters=window.innerWidth>=900;

// ---------- утилиты ----------
const safeUrl=u=>{try{const x=new URL(u,location.href);return /^https?:$/.test(x.protocol)?x.href:'#'}catch(e){return '#'}};
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fmt=n=>Number(n).toLocaleString('ru-RU');
const days=d=>Math.max(0,Math.round((TODAY-new Date(d))/864e5));
const ago=d=>{const n=days(d);return n===0?'сегодня':n===1?'вчера':n+' дн. назад'};
const priceTxt=s=>s.price?`${fmt(s.price[0])} ${s.price[1]}`:'по запросу';
const monthsLeft=m=>{const [y,mo]=m.split('-').map(Number);return (y-TODAY.getFullYear())*12+(mo-1-TODAY.getMonth())};
const docState=(s,k)=>{if(!s.docs||!s.docs[k])return 'miss';const m=monthsLeft(s.docs[k]);return m<0?'miss':m<=2?'warn':'ok'};
const until=m=>{const [y,mo]=m.split('-');return `до ${mo}.${y}`};
function seenAgo(t){const m=Math.round((Date.now()-t)/60000);if(m<1)return 'только что';if(m<60)return m+' мин назад';const h=Math.round(m/60);if(h<24)return h+' ч назад';return new Date(t).toLocaleDateString('ru-RU',{day:'2-digit',month:'2-digit'})}
const plural=(n,a,b,c)=>{const m=n%10,h=n%100;return m===1&&h!==11?a:m>=2&&m<=4&&(h<10||h>=20)?b:c};
const toast=(t,undo)=>{const el=document.getElementById('toast');el.innerHTML='';const sp=document.createElement('span');sp.textContent=t;el.appendChild(sp);if(undo){const b=document.createElement('button');b.type='button';b.textContent='Отменить';b.onclick=()=>{undo();el.hidden=true};el.appendChild(b)}el.hidden=false;clearTimeout(toast._t);toast._t=setTimeout(()=>el.hidden=true,undo?5000:2400)};
function copyText(text,btn){
  const done=()=>{if(btn){const o=btn.textContent;btn.textContent='Скопировано';setTimeout(()=>btn.textContent=o,1400)}};
  const fb=()=>{const ta=document.createElement('textarea');ta.value=text;document.body.appendChild(ta);ta.select();try{document.execCommand('copy');done()}catch(e){toast('Выделите текст и скопируйте вручную')}ta.remove()};
  try{navigator.clipboard.writeText(text).then(done).catch(fb)}catch(e){fb()}
}
const getS=id=>{id=String(id);return S.find(s=>s.id===id)||L.items.find(s=>s.id===id)||work.live[id]||null};
const remember=s=>{if(s&&s.live){work.live[s.id]=s}};

// ---------- адаптер 2ГИС → карточка поставщика ----------
const POS=/оптов|опт\b|оптом|компани|производ|завод|фабрик|комбинат|дистриб|поставщ|склад|сырь|торговый дом|база|импорт|мануфактур/;
const NEG=/магазин|супермаркет|гипермаркет|кафе|ресторан|кофейн|пекарня|столовая|доставка еды|бар\b|салон|рынок|ларёк|киоск/;
function inferType(text){
  if(/производ|завод|фабрик|комбинат|мануфактур|пищекомбинат|мельниц/.test(text))return 'Производитель';
  if(/импорт/.test(text))return 'Импортёр';
  if(/оптов|опт\b|оптом|дистриб|поставщ|склад|торговый дом|база/.test(text))return 'Оптовая компания';
  if(NEG.test(text))return 'Розница';
  return 'Компания';
}
function scheduleText(sc){
  if(!sc)return null;if(sc.is24x7)return 'Круглосуточно';
  const d=sc.days||{},wk=['Пн','Вт','Ср','Чт','Пт'];
  if(!Object.keys(d).length)return null;
  const parts=[];
  if(wk.every(x=>d[x]&&d[x]===d.Пн))parts.push(`Пн–Пт ${d.Пн}`);else wk.filter(x=>d[x]).forEach(x=>parts.push(`${x} ${d[x]}`));
  if(d.Сб&&d.Вс&&d.Сб===d.Вс)parts.push(`Сб–Вс ${d.Сб}`);else{if(d.Сб)parts.push(`Сб ${d.Сб}`);if(d.Вс)parts.push(`Вс ${d.Вс}`)}
  if(!d.Сб&&!d.Вс)parts.push('выходные Сб, Вс');
  return parts.join(' · ');
}
function adapt(x,region,cat){
  const rubr=x.rubrics.map(r=>r.name);
  const text=(x.name+' '+x.extension+' '+rubr.join(' ')).toLowerCase();
  const phone=x.contacts.find(c=>c.type==='phone'), email=x.contacts.find(c=>c.type==='email'), site=x.contacts.find(c=>c.type==='website');
  const notSupplier=/администрац|рестобар|ресторан|(^|[^-])кафе(?!-магазин)|(^|\s)бар(\s|,|$)|столов|кофейн|бистро|пиццер|суши|бургер|шаурм|фуд-?корт|парковк|офис продаж билет/.test((x.extension+' '+x.name).toLowerCase());
  return {notSupplier,id:'g'+x.id,live:true,name:x.name,brand:x.brand,ext:x.extension,type:inferType(text),cat,city:REGIONS[region],region,served:[region],
    products:rubr,rubrics:x.rubrics,address:x.address,fullAddress:x.fullAddress,addressComment:x.addressComment,point:x.point,
    rating:x.rating,reviews:x.reviewCount||0,branches:x.branches,schedule:x.schedule,scheduleText:scheduleText(x.schedule),attributes:x.attributes||[],
    moq:null,price:null,docs:{},d:null,pay:null,verified:0,upd:new Date().toISOString().slice(0,10),src:['twogis'],
    person:'',phone:phone?phone.text:'',email:email?email.value:'',site:site?(site.text||site.value):'',url:x.url,_text:text};
}

// ---------- MOQ и цена: откуда берём ----------
const OSRC={kp:'Ответ на запрос КП',site:'Прайс на сайте',call:'Звонок',supplier:'Данные поставщика'};
function offerOf(s){
  const o=work.offers[s.id];
  if(o)return {moq:o.moq!=null?[o.moq,o.moqUnit]:null,price:o.price!=null?[o.price,o.priceUnit,o.note||'']:null,delivery:o.delivery||'',pay:o.pay||'',src:OSRC[o.src]||o.src,at:o.at,mine:true};
  if(!s.live)return {moq:s.moq,price:s.price,delivery:s.d?s.d[3]:'',pay:s.pay,src:s.verified?'Подтверждено поставщиком':'Собрано автоматически',at:s.upd,mine:false};
  const e=enrOf(s);
  if(e&&!e.error){const m=(e.moq||[]).find(x=>x.value),it=((e.product||{}).items||[]).find(x=>x.price),pr=(e.prices||[]).find(x=>x.value);
    if(m||pr||it)return {moq:m?[m.value,m.unit||'']:null,price:it?[it.price,'₽'+(it.pack?' за '+it.pack:''),it.title]:(pr?[pr.value,'₽'+(pr.unit?' '+pr.unit:''),pr.text]:null),delivery:(e.delivery||[])[0]?.text||'',pay:'',src:'Сайт компании',at:e.fetchedAt,mine:false,site:true}}
  return {moq:null,price:null,src:null};
}
function bench(s){ // ориентир по цене: внесённые КП той же категории/подкатегории
  const vals=Object.entries(work.offers).filter(([id,o])=>id!==s.id&&o.price!=null&&o.cat===s.cat&&(!s.sub||!o.sub||o.sub===s.sub)).map(([,o])=>[o.price,o.priceUnit]);
  if(!vals.length)return null;const u=vals[0][1],v=vals.filter(x=>x[1]===u).map(x=>x[0]).sort((a,b)=>a-b);
  return {min:v[0],max:v[v.length-1],n:v.length,u};
}
// ---------- позиция из запроса ----------
function prodStems(){const src=st.text||(st.subs.length?SUB[st.subs[0]].q||SUB[st.subs[0]].name:'');return src.toLowerCase().split(/[^а-яёa-z0-9]+/).filter(w=>w.length>=4&&!/^(высш|перв|для|оптом|сорт)/.test(w)).map(w=>w.slice(0,Math.max(4,w.length-2))).slice(0,3)}
function prodMatch(s){
  const st_=prodStems();if(!st_.length)return null;
  const where=[];const test=t=>st_.some(x=>t.toLowerCase().includes(x));
  if(test(s.name))where.push('название');
  const rb=(s.rubrics||[]).filter(r=>test(r.name)).map(r=>r.name);if(rb.length)where.push('рубрика «'+rb[0]+'»');
  const at=(s.attributes||[]).filter(test);if(at.length)where.push('ассортимент: '+at.slice(0,3).join(', '));
  if(!s.live&&(s.products||[]).some(test))where.push('ассортимент: '+s.products.filter(test).slice(0,3).join(', '));
  return {term:st.text||SUB[st.subs[0]]?.name||'',found:where.length>0,where};
}
// ---------- оценка ----------
function catPrices(cat){const p=S.filter(s=>s.cat===cat&&s.price).map(s=>s.price[0]);return [Math.min(...p),Math.max(...p)]}
function demoScore(s0){
  const of=offerOf(s0),s={...s0,moq:of.moq||s0.moq,price:of.price||s0.price};
  const w=PRESETS[st.preset].w,r=[],p={};
  if(!st.region)p.region=1;
  else if(s.region===st.region){p.region=1;r.push(['ok',`В регионе: ${s.city}`])}
  else if(s.served.includes('all')||s.served.includes(st.region)){p.region=.75;r.push(['ok',`Возит в ${REGION_IN[st.region]}`])}
  else{p.region=0;r.push(['bad',`Не работает с регионом «${REGIONS[st.region]}»`])}
  const v=+st.vol;
  if(!v)p.moq=1;
  else if(s.moq[1]!==st.unit){p.moq=.5;r.push(['warn',`MOQ в ${s.moq[1]}, уточнить`])}
  else if(v>=s.moq[0]){p.moq=1;r.push(['ok',`Объём ≥ MOQ ${fmt(s.moq[0])} ${s.moq[1]}`])}
  else if(v>=s.moq[0]*.5){p.moq=.4;r.push(['warn',`MOQ ${fmt(s.moq[0])} ${s.moq[1]} чуть больше объёма`])}
  else{p.moq=0;r.push(['bad',`MOQ ${fmt(s.moq[0])} ${s.moq[1]}, в ${Math.round(s.moq[0]/v)} раз больше объёма`])}
  if(!st.docs.length)p.docs=1;
  else{const have=st.docs.filter(k=>docState(s,k)!=='miss'),miss=st.docs.filter(k=>docState(s,k)==='miss'),exp=st.docs.filter(k=>docState(s,k)==='warn');
    p.docs=have.length/st.docs.length;
    if(have.length)r.push(['ok','Есть: '+have.map(k=>DOCS[k]).join(', ')]);
    if(miss.length)r.push(['bad','Нет: '+miss.map(k=>DOCS[k]).join(', ')]);
    if(exp.length)r.push(['warn',exp.map(k=>DOCS[k]).join(', ')+': срок истекает'])}
  if(!s.price){p.price=.3;r.push(['warn','Цена по запросу'])}
  else{const [mn,mx]=catPrices(s.cat);p.price=mx>mn?1-(s.price[0]-mn)/(mx-mn)*.7:1;if(s.price[0]===mn)r.push(['ok','Самая низкая цена в категории'])}
  const dd=days(s.upd);p.trust=(s.verified?.6:.2)+(dd<=14?.4:dd<=45?.25:dd<=90?.1:0);
  if(s.verified)r.push(['ok','Карточку подтвердил поставщик']);
  if(dd>90)r.push(['warn',`Данные устарели: ${dd} дн.`]);
  return {total:Math.round(Object.keys(w).reduce((a,k)=>a+w[k]*p[k],0)),parts:p,w,labels:CRIT,reasons:r};
}
function liveScore(s){
  const r=[],p={},t=s._text||(s.name+' '+(s.ext||'')+' '+s.products.join(' ')).toLowerCase();
  const pos=POS.test(t),neg=NEG.test((s.ext||'')+' '+(s.rubrics||[]).filter(x=>x.primary).map(x=>x.name).join(' ').toLowerCase()+' '+s.name.toLowerCase());
  p.profile=Math.max(0,Math.min(1,.5+(pos?.45:0)-(neg?.5:0)));
  if(pos&&!neg)r.push(['ok',s.type==='Производитель'?'Производитель':'Оптовый профиль']);
  if(neg)r.push(['bad','Похоже на розничную точку']);
  if(!pos&&!neg)r.push(['warn','Профиль не ясен: опт или розница']);
  const kw=CAT_KW[s.cat]?new RegExp([CAT_KW[s.cat].source,...(st.subs.length&&s.cat===st.cat?st.subs.map(k=>SUB[k].re.source):[])].join('|')):null;
  const prim=(s.rubrics||[]).find(x=>x.primary);
  if(!kw){p.rel=.6}
  else if(prim&&kw.test(prim.name.toLowerCase())){p.rel=1;r.push(['ok',`Основная рубрика: ${prim.name}`])}
  else if((s.rubrics||[]).some(x=>kw.test(x.name.toLowerCase()))||kw.test(s.name.toLowerCase())){p.rel=.7;const m=(s.rubrics||[]).find(x=>kw.test(x.name.toLowerCase()));r.push(['ok',`Рубрика: ${m?m.name:'по названию'}`])}
  else{p.rel=.2;r.push(['warn','Рубрики не про эту категорию'])}
  if(s.rating==null){p.rep=.35;r.push(['warn','Нет оценок в 2ГИС'])}
  else{const q=Math.max(0,Math.min(1,(s.rating-3)/2)),c=Math.min(1,(s.reviews||0)/25);p.rep=.3+.7*q*(.4+.6*c);
    r.push([s.rating>=4.3?'ok':s.rating>=3.8?'warn':'bad',`★ ${String(s.rating).replace('.',',')} · ${s.reviews} ${plural(s.reviews,'оценка','оценки','оценок')}`])}
  const d=s.schedule?.days||{};
  if(s.schedule?.is24x7){p.hours=1}
  else if(['Пн','Вт','Ср','Чт','Пт'].filter(x=>d[x]).length>=5){p.hours=1}
  else if(Object.keys(d).length){p.hours=.6}
  else{p.hours=.3;r.push(['warn','График не указан'])}
  p.full=Math.min(1,((s.rubrics||[]).length>=2?.4:.2)+(s.scheduleText?.3:0)+(s.addressComment?.15:0)+(s.phone?.15:0));
  if(s.branches>1)r.push(['ok',`${s.branches} ${plural(s.branches,'филиал','филиала','филиалов')}`]);
  const pm=prodMatch(s);
  if(pm&&pm.found){p.rel=Math.min(1,p.rel+.3);for(let i=r.length-1;i>=0;i--)if(/^(Основная )?[Рр]убрика/.test(r[i][1]))r.splice(i,1);r.unshift(['ok',`Позиция в карточке: ${pm.where[0]}`])}
  const en=enrOf(s);
  if(en&&!en.error){const P=en.product||{};
    const it=(P.items||[])[0];
    if(it){p.rel=Math.min(1,p.rel+.35);r.unshift(['ok',`На сайте: ${it.title.slice(0,40)}${it.price?' — '+fmt(it.price)+' ₽':''}`])}
    else if(P.snippets&&P.snippets.length){p.rel=Math.min(1,p.rel+.15);r.unshift(['ok','Позиция упоминается на сайте'])}
    if(P.images&&P.images.length){p.full=Math.min(1,p.full+.3);r.push(['ok','Фото позиции'])}
    if((en.phones||[]).length||(en.emails||[]).length){p.full=Math.min(1,p.full+.3);r.push(['ok','Контакты с сайта'])}
    p.profile=Math.min(1,p.profile+.05)}
  if((s.attributes||[]).some(a=>/оплата через банк|безнал/i.test(a))){p.profile=Math.min(1,p.profile+.15);r.push(['ok','Безналичный расчёт'])}
  const eg=work.egrul[s.id];
  if(eg){if(eg.closed){p.full=Math.max(0,p.full-.6);p.profile=Math.max(0,p.profile-.4);r.push(['bad',`ЕГРЮЛ: деятельность прекращена ${esc(eg.closed)}`])}else{p.full=Math.min(1,p.full+.3);r.push(['ok',`ЕГРЮЛ: действует с ${(eg.registered||'').slice(-4)}`])}}
  const of=offerOf(s);
  if(!of.moq&&!of.price){r.push(['warn','MOQ и цена неизвестны — запросите']);return {total:Math.round(Object.keys(LW).reduce((a,k)=>a+LW[k]*p[k],0)),parts:p,w:LW,labels:LCRIT,reasons:r}}
  const v=+st.vol;
  if(!of.moq){p.moq=.5}else if(!v||of.moq[1]!==st.unit){p.moq=.8}else if(v>=of.moq[0]){p.moq=1;r.push(['ok',`MOQ ${fmt(of.moq[0])} ${of.moq[1]} ≤ вашего объёма`])}else{p.moq=v>=of.moq[0]*.5?.4:0;r.push([p.moq?'warn':'bad',`MOQ ${fmt(of.moq[0])} ${of.moq[1]} больше вашего объёма`])}
  if(!of.price){p.price=.4}else{const b=bench(s);if(b&&b.u===of.price[1]&&b.max>b.min){p.price=Math.max(0,Math.min(1,1-(of.price[0]-b.min)/(b.max-b.min)*.7))}else p.price=.7;r.push(['ok',`${of.site?'Цена на сайте':'Цена из КП'}: ${fmt(of.price[0])} ${of.price[1]}`])}
  const W2={profile:25,rel:20,moq:15,price:15,rep:15,hours:5,full:5},LB2={...LCRIT,moq:'Мин. заказ',price:'Цена'};
  return {total:Math.round(Object.keys(W2).reduce((a,k)=>a+W2[k]*p[k],0)),parts:p,w:W2,labels:LB2,reasons:r};
}
const score=s=>s.live?liveScore(s):demoScore(s);
const band=n=>n>=75?['g','Подходит']:n>=50?['a','Под вопросом']:['r','Слабо подходит'];
const tile=(n)=>{const [c,l]=band(n);return `<div class="tile ${c}${n>=88?' s':''}"><span class="t-l">${l}</span><span class="t-v num">${n}%</span></div>`};

// ---------- разбор запроса ----------
function parse(q){
  const t=q.toLowerCase(),out={};
  const catRules=[['fish',/рыб|лосос|форел|сёмг|семг|треск|кревет|морепрод|икр|тунец|тунц|кальмар|миди|краб|кижуч|нерк|горбуш|минтай|тилапи|судак|сибас|дорадо/],['pack',/стакан|упаков|короб|контейнер|ланч|пакет|тара|пл[её]нк|посуд/],['ready',/полуфабр|замороз|выпечк|круассан|пельмен|готов|супы?(?![а-я])|гарнир/],['flour',/мук|круп|зерн/],['dairy',/молок|сыр|моцарел|сливк|творог|сливоч|молоч/],['oil',/масл|фритюр/],['meat',/мяс|кур|птиц|говяд|свин|баран|филе/],['veg',/овощ|фрукт|зелен|томат|огур|ягод|микрозел/],['spice',/специ|припра|ванил|какао|разрыхл|шоколад/]];
  for(const [k,re] of catRules){if(re.test(t)){out.cat=k;break}}
  out.subs=out.cat?SUBS[out.cat].filter(x=>x[4].test(t)).map(([k])=>k).slice(0,2):[];
  const regRules=[['msk',/москв|мск|подмоск/],['spb',/петербург|спб|питер/],['kzn',/казан|татарст/],['ekb',/екатеринб|екб|урал/],['krd',/краснодар|кубан/],['nsk',/новосиб|сибир/]];
  for(const [k,re] of regRules){if(re.test(t)){out.region=k;break}}
  const m=t.match(/(\d+(?:[.,]\d+)?)\s*(тонн[аы]?|т|кг|шт)(?![а-яa-z])/);
  if(m){let n=parseFloat(m[1].replace(',','.'));if(m[2].startsWith('т')){n*=1000;out.unit='кг'}else out.unit=m[2];out.vol=Math.round(n)}
  const docRules=[['decl',/деклар/],['haccp',/хассп|haccp/],['iso',/iso|исо(?![а-я])/],['halal',/халял/],['org',/органик|органич/],['vet',/меркур|всд|ветерин/],['fsc',/fsc/],['contact',/пищев\S*\s+контакт/]];
  out.docs=docRules.filter(([,re])=>re.test(t)).map(([k])=>k);
  // текст для 2ГИС: убираем город, объём, документы и служебные слова
  let c=' '+t+' ';
  [/москв\S*|мск|подмоск\S*|санкт|петербург\S*|спб|питер\S*|казан\S*|екатеринбург\S*|екб|краснодар\S*|новосибирск\S*/g,/\d+(?:[.,]\d+)?\s*(тонн[аы]?|т|кг|шт|мл|л)(?![а-яa-z])/g,/с?\s*(декларац\S*|хассп|haccp|iso\s*\d*|исо|халяль|органик\S*|fsc|пищев\S*\s+контакт\S*|меркури\S*|всд)/g,/[,.;:!?()«»"]/g,/(?<![а-я])(в|с|со|от|до|для|и|на|по|месяц|мес|нужн\S*|ищу|ищем|оптом|опт|высшего сорта|в\/с|сорта)(?![а-я])/g].forEach(re=>c=c.replace(re,' '));
  out.text=c.replace(/\s+/g,' ').trim()||q.trim().toLowerCase();
  return out;
}
function clearQuery(){
  const q=document.getElementById('q');q.value='';
  st.text='';st.cat='';st.subs=[];st.vol=0;st.docs=[];st.types=[];st.onlyRegion=false;st.verified=false;st.priceKnown=false;
  if(st.source!=='live')st.region='';
  L.items=[];L.total=0;L.hasMore=false;L.error='';L.loading=false;
  renderFilters();renderParsed();renderList();renderCounts();q.focus();
}
function liveQueries(){ // каждая спецификация — рубрики + необязательное уточнение
  if(st.subs.length)return st.subs.map(k=>({rubric:SUB[k].r.join(','),q:SUB[k].q,sub:k}));
  if(st.cat)return [{rubric:CAT_RUB[st.cat].join(','),q:(st.text&&st.text.length>=3)?st.text:'',sub:null}];
  if(st.text&&st.text.length>=3)return [{rubric:'',q:st.text,sub:null,free:true}];
  return [];
}
function liveQuery(){
  const base=(st.text&&st.text.length>=3)?st.text:(st.cat?CAT_Q[st.cat]:'');
  return base?base+' оптом':'';
}

// ---------- 2ГИС ----------
async function checkLive(){
  try{const r=await fetch('/api/health',{headers:{accept:'application/json'}});if(!r.ok)throw 0;const d=await r.json();L.avail=!!d.ok}catch(e){L.avail=false}
  if(L.avail){st.source='live'}
  else if(fresh){work.compare=['1','2','3'];work.status={'1':'waiting','2':'contacted','25':'candidate','18':'offer','4':'rejected'};work.notes={'1':'Пример: звонил 20.10, Ирина обещает прайс на 1 т до пятницы.'};}
  renderSource();renderFilters();renderParsed();
  if(L.avail&&liveQueries().length)runLive(true);else refresh();
}
async function runLive(reset){
  if(!st.region)st.region='msk';
  const qs=liveQueries();
  if(!qs.length){L.items=[];L.error='';L.note='';renderList();return}
  if(reset){L.items=[];L.page=0;L.hasMore=false;L.total=0;L.note=''}
  L.loading=true;L.error='';renderList();
  const page=L.page+1;
  const get=sp=>fetch(`/api/search?rubric=${sp.rubric}&q=${encodeURIComponent(sp.q||'')}&region=${st.region}&page=${page}`).then(r=>r.json().then(d=>r.ok?d:Promise.reject(new Error(d.error||'Ошибка')))).catch(e=>({error:e.message}));
  let res=await Promise.all(qs.map(get));
  // уточнение из текста ничего не дало — ищем по всей рубрике категории
  if(reset&&!st.subs.length&&qs[0].q&&res[0]&&!res[0].error&&!res[0].total){L.note=`По уточнению «${qs[0].q}» в рубриках 2ГИС ничего нет — показаны все поставщики категории.`;qs[0]={...qs[0],q:''};res=await Promise.all(qs.map(get))}
  const ok=res.filter(d=>!d.error);
  if(!ok.length){L.error=res[0]?.error||'2ГИС не ответил'}
  const seen=new Set(L.items.map(s=>s.id));
  ok.forEach((d,i)=>{const allowed=new Set(qs[i].rubric?qs[i].rubric.split(','):FOOD_RUB);d.items.filter(x=>x.rubrics.some(r=>allowed.has(String(r.id)))).map(x=>{const a=adapt(x,st.region,st.cat);a.sub=qs[i].sub;return a}).forEach(s=>{if(!seen.has(s.id)){L.items.push(s);seen.add(s.id)}})});
  if(ok.length){L.page=page;L.hasMore=ok.some(d=>d.hasMore);if(reset)L.total=ok.reduce((a,d)=>a+d.total,0);L.fetchedAt=new Date(ok[0].fetchedAt)}
  L.loading=false;
  if(reset&&L.hasMore&&currentItems().length<10&&L.page<2&&!L.autoMore){L.autoMore=true;await runLive(false);L.autoMore=false;return}
  renderList();renderStamp();
  enrichTop(currentItems().map(s=>({s,t:score(s).total})).sort((a,b)=>b.t-a.t).map(x=>x.s));
}
// ---------- обогащение с сайтов (краулер в Yandex Cloud) ----------
const termKey=()=>String(prodTerm()||'').toLowerCase().trim();
const enrOf=s=>{const e=work.enrich[s.id];return e&&e.v>=11&&(e.term||'')===termKey()?e:null};
const enrAny=s=>work.enrich[s.id]||null; // контакты не зависят от товара
let enrichAvail=null;const enrichBusy=new Set(),enrichQ=[];
function prodTerm(){return st.text||(st.subs.length?SUB[st.subs[0]].name:(st.cat?CATS[st.cat]:''))}
async function enrichOne(id,force,retry){
  const s=getS(id);if(!s||!s.live||enrichAvail===false)return;
  if(enrichBusy.has(id)||(!force&&enrOf(s)))return;
  enrichBusy.add(id);refreshEnrichUI(id);
  const city=(REGIONS[s.region]||'').replace(' и МО','');
  try{const r=await fetch(`/api/enrich?name=${encodeURIComponent(s.brand||s.name)}&city=${encodeURIComponent(city)}&product=${encodeURIComponent(prodTerm())}&site=${encodeURIComponent(work.sites[id]||'')}&addr=${encodeURIComponent(s.address||'')}`);
    if(r.status===501){enrichAvail=false}else if(r.status===429||r.status===403){const d=await r.json().catch(()=>({}));toast(d.error||'Слишком много запросов');}else{enrichAvail=true;const d=await r.json();if(d.error&&!d.v&&!retry){enrichBusy.delete(id);await new Promise(ok=>setTimeout(ok,2500));return enrichOne(id,true,true)}remember(s);d.term=termKey();work.enrich[id]=d;save()}}
  catch(e){work.enrich[id]={error:'Краулер не ответил'}}
  enrichBusy.delete(id);refreshEnrichUI(id);
}
function refreshEnrichUI(id){
  if(currentView()==='search')renderList();
  const dr=document.getElementById('drawer');if(!dr.hidden&&comp.id===id){const el=document.getElementById('siteSec');if(el)el.innerHTML=siteHTML(getS(id));const k=document.getElementById('keySec');if(k&&!document.getElementById('offerForm'))k.innerHTML=keyHTML(getS(id))}
}
async function enrichTop(items){
  if(enrichAvail===false)return;
  items.filter(s=>s.live&&!enrOf(s)).slice(0,8).forEach(s=>{if(!enrichQ.includes(s.id))enrichQ.push(s.id)});
  const worker=async()=>{while(enrichQ.length&&enrichAvail!==false){await enrichOne(enrichQ.shift())}};
  if(!enrichTop.running){enrichTop.running=true;await Promise.all([worker(),worker(),worker()]);enrichTop.running=false}
}
function siteHTML(s){
  if(!s.live)return '';
  const e=enrOf(s),busy=enrichBusy.has(s.id);
  const manual=`<form class="site-form" data-siteform="${s.id}"><input id="siteUrl" type="url" placeholder="https://сайт-поставщика.ru" value="${esc(work.sites[s.id]||'')}"><button class="btn sm" type="submit">Разобрать сайт</button></form>`;
  if(enrichAvail===false)return `<h3>С сайта компании</h3><p class="hint" style="margin:0">Обогащение с сайтов работает через краулер в Yandex Cloud — он ещё не подключён.</p>`;
  if(busy)return `<h3>С сайта компании</h3><div class="hint">Ищем сайт и разбираем страницы…</div><div class="skel" style="height:70px"></div>`;
  if(!e)return `<h3>С сайта компании</h3><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn sm primary" data-enrich="${s.id}">Найти сайт и собрать данные</button></div>${manual}`;
  if(e.error)return `<h3>С сайта компании</h3><div class="notice warn">${esc(e.error)}. Если знаете сайт — вставьте адрес из карточки 2ГИС.</div>${manual}`;
  const P=e.product||{},li=(arr,f)=>arr.length?`<ul class="slist">${arr.map(f).join('')}</ul>`:'<span class="q">не найдено</span>';
  const src=u=>`<a href="${esc(safeUrl(u))}" target="_blank" rel="noopener" class="srcl">источник</a>`;
  return `<h3>С сайта компании</h3>
  <div class="hint"><a href="${esc(safeUrl(e.site))}" target="_blank" rel="noopener">${esc(e.site.replace(/^https?:\/\//,'').replace(/\/$/,''))}</a> · ${e.via==='manual'?'адрес указан вручную':'найден через Яндекс'} · разобрано страниц: ${(e.pages||[]).length} · ${new Date(e.fetchedAt).toLocaleString('ru-RU',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}</div>
  ${(P.items||[]).length?`<div class="items">${P.items.map(x=>`<a class="item" href="${esc(safeUrl(x.url))}" target="_blank" rel="noopener">${x.image?`<img src="${esc(safeUrl(x.image))}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.style.visibility='hidden'">`:'<span class="noimg"></span>'}<span class="it-t">${esc(x.title)}</span>${x.price?`<b class="num">${fmt(x.price)} ₽${x.pack?` <small>за ${esc(x.pack)}</small>`:''}</b>`:'<span class="q">цена не указана</span>'}</a>`).join('')}</div>`:''}
  ${!(P.items||[]).length&&P.images&&P.images.length?`<div class="gal">${P.images.map(i=>`<a href="${esc(safeUrl(i.url))}" target="_blank" rel="noopener"><img src="${esc(safeUrl(i.src))}" alt="${esc(i.alt||prodTerm())}" loading="lazy" referrerpolicy="no-referrer" onerror="this.parentNode.remove()"></a>`).join('')}</div>`:''}
  <dl class="kv">
    ${(P.items||[]).length?'':`<dt>Позиция «${esc(prodTerm())}»</dt><dd>${li((P.snippets||[]).slice(0,4),x=>`<li>${esc(x.text)} ${src(x.url)}</li>`)}</dd>
    <dt>Цены</dt><dd>${li((e.prices||[]).slice(0,4),x=>`<li><b class="num">${fmt(x.value)} ₽${x.unit?' '+esc(x.unit):''}</b> — ${esc(x.text.slice(0,120))} ${src(x.url)}</li>`)}</dd>`}
    <dt>Мин. заказ</dt><dd>${li((e.moq||[]).slice(0,3),x=>`<li>${esc(x.text)} ${src(x.url)}</li>`)}</dd>
    <dt>Доставка</dt><dd>${li((e.delivery||[]).slice(0,2),x=>`<li>${esc(x.text)} ${src(x.url)}</li>`)}</dd>
    <dt>Телефоны</dt><dd>${(e.phones||[]).map(x=>`<span class="num" style="user-select:all">${esc(x)}</span>`).join(', ')||'<span class="q">не найдено</span>'}</dd>
    <dt>Почта</dt><dd>${(e.emails||[]).map(x=>`<span class="num" style="user-select:all">${esc(x)}</span>`).join(', ')||'<span class="q">не найдено</span>'}</dd>
  </dl>
  <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn sm" data-enrich="${s.id}" data-force="1">Обновить с сайта</button></div>${manual}`;
}
// ---------- счётчики по категориям и подкатегориям ----------
function demoCount(kind,k){
  const inReg=x=>!st.region||x.region===st.region||x.served.includes('all')||x.served.includes(st.region);
  return kind==='cat'?S.filter(x=>x.cat===k&&inReg(x)).length:S.filter(x=>x.cat===SUB[k].cat&&inReg(x)&&SUB[k].re.test(x.products.join(' ').toLowerCase())).length;
}
function countOf(kind,k){
  if(st.source!=='live')return demoCount(kind,k);
  const v=CNT[`${st.region}|${kind}:${k}`];return v===undefined?null:v;
}
async function loadCounts(kind,keys){
  if(st.source!=='live')return;
  const reg=st.region||'msk';
  const todo=keys.filter(k=>CNT[`${reg}|${kind}:${k}`]===undefined&&!cntLoading.has(`${reg}|${kind}:${k}`));
  if(!todo.length)return;
  todo.forEach(k=>cntLoading.add(`${reg}|${kind}:${k}`));
  await Promise.all(todo.map(async k=>{
    const rub=kind==='cat'?CAT_RUB[k].join(','):SUB[k].r.join(','),q=kind==='cat'?'':SUB[k].q;
    for(let i=0;i<2;i++){try{const r=await fetch(`/api/count?rubric=${rub}&q=${encodeURIComponent(q)}&region=${reg}`);const d=await r.json();if(r.ok){CNT[`${reg}|${kind}:${k}`]=d.total||0;break}}catch(e){}}
    cntLoading.delete(`${reg}|${kind}:${k}`);
  }));
  renderFilters();
}

// ---------- рендер: источник, фильтры ----------
function renderSource(){
  const live=st.source==='live';
  document.querySelectorAll('[data-src]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.src===st.source));
  document.getElementById('srcLive').disabled=!L.avail;
  document.getElementById('srcLive').title=L.avail?'Живые данные 2ГИС':'Доступно после деплоя с ключом 2ГИС';
  ['srcDot','segDot'].forEach(id=>document.getElementById(id).classList.toggle('off',!L.avail));
  document.getElementById('srcLbl').textContent=live?'2ГИС · live':'Демо-каталог';
  document.getElementById('demoOnly').hidden=live;document.getElementById('liveOnly').hidden=!live;

  document.getElementById('onlyRegionWrap').hidden=live;
  const n=document.getElementById('srcNote');
  n.innerHTML=live?`<div class="notice nt-info">Данные 2ГИС в реальном времени: адрес, рубрики, график, рейтинг. Телефоны и сайт открываются в карточке 2ГИС, MOQ и цены запрашиваются через КП.</div>`
    :(L.avail?'':`<div class="notice warn">Сейчас открыт демо-каталог с вымышленными компаниями. Поиск по 2ГИС работает в развёрнутой версии с серверной функцией и ключом.</div>`);
  const sort=document.getElementById('sort');
  sort.innerHTML=live?`<option value="match">По совпадению</option><option value="price">Дешевле</option><option value="moq">Меньше MOQ</option><option value="rating">По рейтингу</option><option value="reviews">По числу оценок</option>`
    :`<option value="match">По совпадению</option><option value="price">Дешевле</option><option value="moq">Меньше MOQ</option><option value="fresh">Свежие данные</option>`;
  if(![...sort.options].some(o=>o.value===st.sort))st.sort='match';
  sort.value=st.sort;setTimeout(()=>renderDD('sort'),0);
  document.getElementById('gridHead').innerHTML=`<span></span><span>Совпадение</span><span>Поставщик</span><span>Мин. заказ</span><span>Цена</span><span>${live?'Рейтинг и график':'Доставка'}</span><span></span>`;
}
function renderFilters(){
  const live=st.source==='live';
  const count=k=>live?'':S.filter(s=>s.cat===k).length;
  const CHEV='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg>';
  const nTxt=n=>n===null?'…':fmt(n);
  document.getElementById('fCats').innerHTML=Object.entries(CATS).map(([k,v])=>{
    const n=countOf('cat',k),zero=n===0,op=expanded.has(k)&&!zero;
    return `<div class="cat${zero?' zero':''}"><div class="cat-row"><label class="check${zero?' dis':''}"><input type="radio" name="cat" value="${k}" ${st.cat===k&&!zero?'checked':''} ${zero?'disabled':''}> ${v}<span class="n">${nTxt(n)}</span></label><button type="button" class="exp" data-exp="${k}" aria-expanded="${op}" ${zero?'disabled':''} aria-label="Подкатегории: ${v}">${CHEV}</button></div>
    <div class="subs" ${op?'':'hidden'}>${SUBS[k].map(([sk,sn])=>{const m=op?countOf('sub',sk):null,z=m===0;return `<label class="check${z?' dis':''}"><input type="checkbox" data-sub="${sk}" ${st.subs.includes(sk)&&!z?'checked':''} ${z?'disabled':''}> ${sn}<span class="n">${op?nTxt(m):''}</span></label>`}).join('')}</div></div>`}).join('')+(live?'':`<label class="check"><input type="radio" name="cat" value="" ${!st.cat?'checked':''}> Все категории<span class="n">${S.length}</span></label>`);
  // Счётчики по категориям стоят по запросу 2ГИС на каждую рубрику — выключены, чтобы не тратить лимит ключа
  if(FEATURES.categoryCounts){loadCounts('cat',Object.keys(CATS));
const ex=[...expanded].filter(k=>countOf('cat',k)!==0);if(ex.length)loadCounts('sub',ex.flatMap(k=>SUBS[k].map(x=>x[0])))}
  setTimeout(renderCity,0);
  document.getElementById('fRegion').innerHTML=(live?'':`<option value="">Любой</option>`)+Object.entries(REGIONS).map(([k,v])=>`<option value="${k}" ${st.region===k?'selected':''}>${v}</option>`).join('');
  document.getElementById('fDocs').innerHTML=Object.entries(DOCS).map(([k,v])=>`<label class="check"><input type="checkbox" data-doc="${k}" ${st.docs.includes(k)?'checked':''}> ${v}</label>`).join('')+(live?'<div class="hint">В 2ГИС документов нет: попадут в запрос КП</div>':'');
  document.getElementById('fTypes').innerHTML=(live?LIVE_TYPES:DEMO_TYPES).map(t=>`<label class="check"><input type="checkbox" data-type="${t}" ${st.types.includes(t)?'checked':''}> ${t}</label>`).join('');
  document.getElementById('fVol').value=st.vol||'';
  document.getElementById('fUnit').value=st.unit;
  document.getElementById('fOnlyRegion').checked=st.onlyRegion;
  document.getElementById('fVerified').checked=st.verified;
  document.getElementById('fPrice').checked=st.priceKnown;
  document.querySelectorAll('#fPreset button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.p===st.preset));
  document.getElementById('filters').hidden=!showFilters;
  [['fNoRetail','noRetail'],['fCashless','cashless'],['fReviews','withReviews'],['fWeekend','weekend']].forEach(([id,k])=>document.getElementById(id).checked=!!st[k]);
  document.querySelectorAll('#fRating button').forEach(b=>b.setAttribute('aria-pressed',String(String(st.minRating||'')===b.dataset.r)));
  const nf=(live?(st.noRetail?1:0)+(st.cashless?1:0)+(st.withReviews?1:0)+(st.weekend?1:0)+(st.minRating?1:0):0)+(st.vol?1:0)+st.docs.length+st.types.length+(!live&&st.onlyRegion?1:0)+(!live&&st.verified?1:0)+(!live&&st.priceKnown?1:0);
  const fc=document.getElementById('fCount');fc.textContent=nf;fc.hidden=!nf;
  document.getElementById('toggleFilters').setAttribute('aria-pressed',String(showFilters));
  document.getElementById('work').classList.toggle('nofilters',!showFilters);
}
// ---------- выпадающие списки (город, сортировка) ----------
const DD={city:{sel:'fRegion',ph:'Город'},sort:{sel:'sort',ph:'Сортировка'}};
const ddEl=(k,part)=>document.getElementById(k+part);
function renderDD(k){
  const sel=document.getElementById(DD[k].sel),pop=ddEl(k,'Pop');if(!sel||!pop)return;
  const opts=[...sel.options];
  ddEl(k,'Val').textContent=(opts.find(o=>o.value===sel.value)||opts[0]||{}).text||DD[k].ph;
  pop.innerHTML=opts.map(o=>`<li role="option" data-dd="${k}" data-v="${o.value}" aria-selected="${o.value===sel.value}"><span class="dotc"></span>${esc(o.text)}<svg class="i ck" viewBox="0 0 24 24"><path d="M5 12l5 5 9-10"/></svg></li>`).join('');
}
const renderCity=()=>renderDD('city');
function ddOpen(k,open){
  Object.keys(DD).forEach(x=>{if(x!==k&&open){ddEl(x,'Pop').hidden=true;ddEl(x,'Btn').setAttribute('aria-expanded','false')}});
  const b=ddEl(k,'Btn'),pop=ddEl(k,'Pop');pop.hidden=!open;b.setAttribute('aria-expanded',String(open));
  if(open){const cur=pop.querySelector('[aria-selected="true"]')||pop.firstElementChild;pop.querySelectorAll('.act').forEach(x=>x.classList.remove('act'));cur&&cur.classList.add('act')}
}
function ddPick(k,v){
  const sel=document.getElementById(DD[k].sel);ddOpen(k,false);ddEl(k,'Btn').focus();
  if(sel.value===v)return;sel.value=v;sel.dispatchEvent(new Event('change',{bubbles:true}));renderDD(k);
}
document.addEventListener('click',e=>{
  const btn=e.target.closest('.dd-btn');if(btn){const k=btn.dataset.ddk;ddOpen(k,ddEl(k,'Pop').hidden);return}
  const li=e.target.closest('[data-dd]');if(li){ddPick(li.dataset.dd,li.dataset.v);return}
  Object.keys(DD).forEach(k=>{if(!e.target.closest('#'+k+'Box'))ddOpen(k,false)});
});
document.addEventListener('keydown',e=>{
  const box=e.target.closest&&e.target.closest('.ddx');if(!box)return;const k=box.dataset.ddk,pop=ddEl(k,'Pop');
  const items=[...pop.querySelectorAll('li')];let i=items.findIndex(x=>x.classList.contains('act'));
  if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();if(pop.hidden){ddOpen(k,true);return}i=(i+(e.key==='ArrowDown'?1:-1)+items.length)%items.length;items.forEach(x=>x.classList.remove('act'));items[i].classList.add('act');items[i].scrollIntoView({block:'nearest'})}
  else if((e.key==='Enter'||e.key===' ')&&!pop.hidden&&i>=0){e.preventDefault();ddPick(k,items[i].dataset.v)}
  else if(e.key==='Escape'&&!pop.hidden){e.stopPropagation();ddOpen(k,false);ddEl(k,'Btn').focus()}
});
function renderParsed(){
  const parts=[];
  const what=st.text||(st.subs.length?st.subs.map(k=>SUB[k].name).join(', '):(st.cat?CATS[st.cat]:''));
  if(what){parts.push(`Ищем: <b>${esc(what)}</b>`);
    if(st.source==='live'){const rub=st.subs.length?[...new Set(st.subs.map(k=>SUB[k].name))].join(', '):(st.cat?CATS[st.cat]:'');parts.push(rub?`категория 2ГИС: ${esc(rub)}`:'по всем пищевым рубрикам 2ГИС')}
    parts.push(`<button type="button" class="chip-clear" data-clearall>Стереть</button>`)}
  document.getElementById('parsed').innerHTML=parts.join(' · ');
  document.getElementById('parsed').className='ask-line';
  document.getElementById('qClear').hidden=!document.getElementById('q').value;
  renderGuide();
}
function renderStamp(){
  const t=st.source==='live'&&L.fetchedAt?L.fetchedAt:new Date();
  document.getElementById('stamp').textContent='Последнее обновление: '+t.toLocaleDateString('ru-RU')+', '+t.toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'});
}

// ---------- рендер: выдача ----------
function currentItems(){
  const vis=s=>showHidden||!work.hidden[s.id];
  const subOk=s=>!st.subs.length||s.live||s.cat!==st.cat||st.subs.some(k=>SUB[k].re.test(s.products.join(' ').toLowerCase()));
  if(st.source==='live'){
    const by=new Map();
    for(const s of L.items){if(s.notSupplier)continue;const k=(s.brand||s.name).toLowerCase().trim();const g=by.get(k);if(!g){s.groupN=1;by.set(k,s)}else{g.groupN=(g.groupN||1)+1;if((s.reviews||0)>(g.reviews||0)){s.groupN=g.groupN;by.set(k,s)}}}
    return [...by.values()].filter(s=>vis(s)&&(!st.types.length||st.types.includes(s.type))
    &&(!st.noRetail||s.type!=='Розница')
    &&(!st.cashless||(s.attributes||[]).some(a=>/оплата через банк|безнал/i.test(a)))
    &&(!st.withReviews||(s.reviews||0)>0)
    &&(!st.weekend||!!(s.schedule&&(s.schedule.is24x7||s.schedule.days?.Сб||s.schedule.days?.Вс)))
    &&(!st.minRating||(s.rating||0)>=st.minRating));
  }
  return S.filter(s=>vis(s)&&subOk(s)&&(!st.cat||s.cat===st.cat)&&(!st.onlyRegion||!st.region||s.region===st.region||s.served.includes('all')||s.served.includes(st.region))&&(!st.verified||s.verified)&&(!st.priceKnown||s.price||work.offers[s.id])&&(!st.types.length||st.types.includes(s.type)));
}
function renderList(){
  const live=st.source==='live',Lst=document.getElementById('list'),more=document.getElementById('more');
  if(live&&L.loading&&!L.items.length){document.getElementById('resTitle').textContent='Ищем в 2ГИС…';Lst.innerHTML='<div style="display:grid;gap:8px;padding-top:8px">'+'<div class="skel"></div>'.repeat(4)+'</div>';more.innerHTML='';return}
  if(live&&L.error&&!L.items.length){document.getElementById('resTitle').textContent='Поставщики';Lst.innerHTML=`<div class="notice err" style="margin-top:8px">${esc(L.error)}. Попробуйте ещё раз через минуту.</div>`;more.innerHTML='';return}
  if(live&&!L.loading&&!L.items.length&&!liveQueries().length){document.getElementById('resTitle').textContent='Поставщики';Lst.innerHTML=`<div class="empty" style="margin-top:8px"><b>Какой товар ищем?</b><span>Напишите позицию в строке поиска — найдём поставщиков в 2ГИС.</span></div>`;more.innerHTML='';return}
  const items=currentItems().map(s=>({s,sc:score(s)}));
  const noteHTML=live&&L.note?`<div class="notice warn" style="margin:8px 0">${esc(L.note)}</div>`:'';
  const so=st.sort;
  const pv=x=>{const o=offerOf(x);return o.price?o.price[0]:1e9},mv=x=>{const o=offerOf(x);return o.moq?o.moq[0]:1e9};
  items.sort((a,b)=>so==='price'?(pv(a.s)-pv(b.s)):so==='moq'?(mv(a.s)-mv(b.s)):so==='fresh'?(days(a.s.upd)-days(b.s.upd)):so==='rating'?((b.s.rating||0)-(a.s.rating||0)):so==='reviews'?((b.s.reviews||0)-(a.s.reviews||0)):(b.sc.total-a.sc.total));
  const good=items.filter(i=>i.sc.total>=75).length;
  document.getElementById('resTitle').textContent=live
    ?`2ГИС: ${items.length} из ${fmt(L.total)} · ${good} ${plural(good,'подходит','подходят','подходят')} · ${REGIONS[st.region]}`
    :`${items.length} ${plural(items.length,'поставщик','поставщика','поставщиков')} · ${good} ${plural(good,'подходит','подходят','подходят')}`;
  if(!items.length){Lst.innerHTML=`<div class="empty" style="margin-top:8px"><b>Никого не нашли</b><span>${live?'Попробуйте другую формулировку или категорию.':'Ослабьте фильтры.'}</span></div>`;more.innerHTML='';return}
  Lst.innerHTML=noteHTML+items.map(({s,sc})=>{
    const stt=work.status[s.id];
    const of=offerOf(s),bm=bench(s);
    const need=(what)=>`<div class="nodata"><span class="q">нет данных</span><button class="linkbtn" data-ask="${s.id}">Запросить ${what}</button></div>`;
    const moqC=of.moq?`<div class="offer"><span class="v num">${fmt(of.moq[0])} ${of.moq[1]}</span><span class="src">${esc(of.src)}${of.mine?' · '+new Date(of.at).toLocaleDateString('ru-RU'):''}</span></div>`:need('MOQ');
    const priceC=of.price?`<div class="offer"><span class="v num">${fmt(of.price[0])} ${of.price[1]}</span><span class="src">${esc(of.price[2]||of.src)}</span></div>`:(need('цену')+(bm?`<div class="bench">ориентир по КП: ${fmt(bm.min)}${bm.max>bm.min?'–'+fmt(bm.max):''} ${bm.u}</div>`:''));
    const c5live=(s.rating!=null?`<span class="num">★ ${String(s.rating).replace('.',',')}</span> <span class="sub">· ${s.reviews} ${plural(s.reviews,'оценка','оценки','оценок')}</span>`:'<span class="q">нет оценок</span>')+`<div class="sub">${s.scheduleText?esc(s.scheduleText):'график не указан'}</div>`;
    const c3_old=live?(s.rating!=null?`<span class="num">★ ${String(s.rating).replace('.',',')}</span><div class="sub">${s.reviews} ${plural(s.reviews,'оценка','оценки','оценок')}</div>`:'<span class="q">нет оценок</span>')
                 :`<span class="num">${fmt(s.moq[0])} ${s.moq[1]}</span>`;
    const c4=live?`<span class="num">${s.branches}</span><div class="sub">${plural(s.branches,'филиал','филиала','филиалов')}</div>`
                 :(s.price?`<span class="num">${priceTxt(s)}</span><div class="sub">${esc(s.price[2])}</div>`:'<span class="q">по запросу</span>');
    const c5=live?(s.scheduleText?esc(s.scheduleText):'<span class="q">не указан</span>'):esc(s.d[2]);
    const en=enrOf(s),img=en&&!en.error&&en.product&&((en.product.items||[]).find(x=>x.image)?{src:en.product.items.find(x=>x.image).image}:en.product.images&&en.product.images[0]);
    const tags=live?`<span class="tag">${esc(s.type)}</span><span class="tag blue">2ГИС</span>${en&&!en.error?'<span class="tag site">✓ сайт</span>':enrichBusy.has(s.id)?'<span class="tag">сайт…</span>':''}`
                   :`<span class="tag">${s.type}</span>${s.verified?'<span class="tag ok">✓ Подтверждено</span>':'<span class="tag">Собрано автоматически</span>'}${Object.keys(s.docs).map(k=>`<span class="tag">${DOCS[k]}</span>`).join('')}`;
    const sub=live?esc(s.fullAddress)+(s.addressComment?' · '+esc(s.addressComment):'')+(s.groupN>1?` · <b>ещё ${s.groupN-1} ${plural(s.groupN-1,'филиал','филиала','филиалов')} в выдаче</b>`:''):`${s.city} · ${esc(s.products.join(', '))}`;
    const seen=work.viewed[s.id];
    return `<div class="row ${work.hidden[s.id]?'is-hidden':''} ${seen?'seen':''}" data-row="${s.id}">
      <label class="cmp-cell" title="Сравнить"><input type="checkbox" data-cmp="${s.id}" ${work.compare.includes(s.id)?'checked':''} aria-label="Сравнить ${esc(s.name)}"><span class="only-m">Сравнить</span></label>
      ${tile(sc.total)}
      <div style="min-width:0">${img?`<img class="thumb" src="${esc(safeUrl(img.src))}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">`:''}<button class="nm" data-open="${s.id}">${esc(s.name)}</button>${seen?`<span class="seen-b" title="Вы открывали карточку"><svg class="i" viewBox="0 0 24 24"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>Просмотрено ${seenAgo(seen)}</span>`:''}<div class="meta">${sub}</div>
        ${live?`<div class="meta">${esc(s.products.slice(0,4).join(' · '))}</div>`:''}
        <div class="tags">${tags}</div>
        <ul class="why">${sc.reasons.map(([c,t])=>`<li class="${c}">${esc(t)}</li>`).join('')}${sc.reasons.length>3?`<li class="more-r">+${sc.reasons.length-3} в карточке</li>`:''}</ul></div>
      <div class="cell"><span class="cell-l">Мин. заказ</span>${moqC}</div>
      <div class="cell"><span class="cell-l">Цена</span>${priceC}</div>
      <div class="cell"><span class="cell-l">${live?'Рейтинг и график':'Доставка'}</span>${live?c5live:esc(s.d[2])}</div>
      <div class="acts"><button class="btn sm primary" data-write="${s.id}"><svg class="i" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>Написать</button><button class="btn sm ${stt?'on':''}" data-shortlist="${s.id}" title="${stt?'Убрать из избранного':'Добавить в избранное'}" aria-label="${stt?'В избранном: '+STATUSES[stt]:'В избранное'}">${stt?'<span class="ico-m">'+'<svg class=\"i\" viewBox=\"0 0 24 24\"><path d=\"M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z\"/></svg>'+'</span><span class="lbl">✓ '+STATUSES[stt]+'</span>':'<svg class="i" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg><span class="lbl">В избранное</span>'}</button><button class="btn sm hide-m" data-open="${s.id}"><svg class="i" viewBox="0 0 24 24"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>Карточка</button>${work.hidden[s.id]?`<button class="btn sm" data-unhide="${s.id}">Вернуть в выдачу</button>`:`<button class="btn sm" data-hide="${s.id}" title="Скрыть из выдачи" aria-label="Скрыть из выдачи"><svg class="i" viewBox="0 0 24 24"><path d="M3 3l18 18"/><path d="M10.6 6.1A9.9 9.9 0 0 1 12 6c5 0 9 6 9 6a17 17 0 0 1-2.8 3.3M6.6 6.6C4.3 8.1 3 12 3 12s4 6 9 6c1.4 0 2.7-.4 3.9-1"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg><span class="lbl">Скрыть</span></button>`}</div>
    </div>`}).join('');
  more.innerHTML=live&&L.hasMore?`<button class="btn soft" id="loadMore" ${L.loading?'disabled':''}>${L.loading?'Загружаем…':'Загрузить ещё из 2ГИС'}</button>`:(live&&L.error?`<div class="notice err">${esc(L.error)}</div>`:'');
}

function renderHidden(){
  const n=Object.keys(work.hidden).length,el=document.getElementById('hidBox');
  el.innerHTML=n?`Скрыто: ${n} <button class="linkbtn" data-showhidden>${showHidden?'Не показывать':'Показать'}</button><button class="linkbtn" data-unhideall>Вернуть все</button>`:'';
}
// ---------- подсказка по шагам ----------
const searched=()=>st.source==='live'?liveQueries().length>0:Boolean(st.cat||st.text);
function guideState(){
  const pr=work.progress;
  const done={search:searched(),open:!!pr.opened,write:!!pr.wrote||Object.keys(work.offers).length>0,fav:Object.keys(work.status).length>0};
  const steps=[
    ['search','Введите товар','Например, «мука высшего сорта». Город выбирается справа от поля.','Попробовать «мука»','g-ex'],
    ['open','Откройте лучшую карточку','Плитка совпадения подскажет лидеров. В карточке — позиция, данные с сайта, цена и MOQ.','Открыть лучшую','g-open'],
    ['write','Запросите КП','Напишите поставщику из карточки по шаблону, а ответ внесите кнопкой «Внести из ответа».','Написать лучшей','g-write'],
    ['fav','Выберите поставщика','Добавьте в избранное, двигайте по статусам и отметьте постоянного.','Открыть избранное','g-fav']];
  const cur=steps.findIndex(x=>!done[x[0]]);
  return {steps,done,cur};
}
function renderGuide(){
  const el=document.getElementById('guide');if(!el)return;
  const g=guideState(),has=searched();
  document.getElementById('work').hidden=!has;document.getElementById('cmpFoot').hidden=!has;
  if(has&&work.progress.guideHidden){el.innerHTML='';return}
  if(!has){
    el.innerHTML=`<div class="guide-head"><span class="fh">Как работать с поиском</span></div><div class="guide">${g.steps.map(([k,t,d,c,a],i)=>{const cls=g.done[k]?'done':i===g.cur?'cur':'';return `<div class="gstep ${cls}"><span class="gn">${g.done[k]?'✓':i+1}</span><b>${t}</b><p>${d}</p>${i===g.cur?`<button type="button" class="btn sm ${i===0?'primary':''}" data-guide="${a}" ${i>0&&!has?'disabled':''}>${c}</button>`:''}</div>`}).join('')}</div>`;
    return}
  el.innerHTML=`<div class="gstrip">${g.steps.map(([k,t,d,c,a],i)=>{const cls=g.done[k]?'done':i===g.cur?'cur':'';return `${i?'<span class="sep">›</span>':''}<span class="gs ${cls}"><span class="gn">${g.done[k]?'✓':i+1}</span>${t}</span>`}).join('')}${g.cur>=0?`<button type="button" class="btn sm primary" data-guide="${g.steps[g.cur][4]}" style="margin-left:8px">${g.steps[g.cur][3]}</button>`:'<span class="okc" style="margin-left:8px">Готово — поставщик выбран</span>'}<button type="button" class="gx" data-guide="g-hide" aria-label="Скрыть подсказку">×</button></div>`;
}
function renderCounts(){
  renderGuide();
  renderHidden();
  const ids=Object.keys(work.status).filter(getS);
  const c=k=>ids.filter(i=>work.status[i]===k).length;
  document.getElementById('cCount').textContent=work.compare.length;
  document.getElementById('sCount').textContent=ids.length-c('rejected')-c('approved')-c('reserve');
  document.getElementById('kWork').textContent=ids.length-c('rejected')-c('approved')-c('reserve');
  document.getElementById('kWait').textContent=c('contacted')+c('waiting');
  document.getElementById('kOffer').textContent=c('offer');
  document.getElementById('kMine').textContent=c('approved');document.getElementById('mCount').textContent=c('approved')+c('reserve');
  const n=work.compare.length,f=document.getElementById('footLbl'),g=document.getElementById('cmpGo');
  f.textContent='Выбрано для сравнения: '+n;f.classList.toggle('has',n>0);
  g.classList.toggle('primary',n>=2);g.style.pointerEvents=n>=2?'':'none';g.style.opacity=n>=2?'':'.45';
  document.getElementById('cmpClear').hidden=!n;
}

// ---------- сравнение ----------
function renderCompare(){
  const box=document.getElementById('cmp'),list=work.compare.map(getS).filter(Boolean);
  if(list.length<2){box.innerHTML=`<div class="empty"><b>Отметьте хотя бы двух поставщиков</b><span>Галочка слева в строке выдачи. Можно до четырёх.</span><a class="btn primary" href="#search">К поиску</a></div>`;return}
  const sc=list.map(score);
  const best=(vals,dir)=>{const v=vals.map((x,i)=>[x,i]).filter(x=>x[0]!=null);if(v.length<2)return -1;v.sort((a,b)=>dir*(a[0]-b[0]));return v[0][0]===v[1][0]?-1:v[0][1]};
  const row=(l,cells,b=-1)=>`<tr><th scope="row">${l}</th>${cells.map((c,i)=>`<td class="${i===b?'best':''}">${c}</td>`).join('')}</tr>`;
  const dash='<span class="q">—</span>',ask='<span class="q">запросить в КП</span>';
  const anyLive=list.some(s=>s.live),anyDemo=list.some(s=>!s.live);
  const reqDocs=st.docs.length?st.docs:[...new Set(list.flatMap(s=>Object.keys(s.docs||{})))];
  box.innerHTML=`<div class="tbl-wrap"><table class="cmp"><thead><tr><th></th>${list.map(s=>`<th><button class="nm" data-open="${s.id}">${esc(s.name)}</button><div class="hint">${esc(s.type)} · ${esc(s.city)}${s.live?' · 2ГИС':''}</div><button class="copy" style="margin:6px 0 0" data-cmp-rm="${s.id}">Убрать</button></th>`).join('')}</tr></thead><tbody>
    ${row('Совпадение',sc.map(x=>tile(x.total)),best(sc.map(x=>x.total),-1))}
    ${anyLive?row('Рейтинг 2ГИС',list.map(s=>s.live?(s.rating!=null?`★ ${String(s.rating).replace('.',',')} <span class="hint">· ${s.reviews} ${plural(s.reviews,'оценка','оценки','оценок')}</span>`:'<span class="q">нет оценок</span>'):dash),best(list.map(s=>s.live&&s.rating!=null?s.rating:null),-1)):''}
    ${anyLive?row('Филиалы',list.map(s=>s.live?s.branches:dash),best(list.map(s=>s.live?s.branches:null),-1)):''}
    ${row('Адрес',list.map(s=>s.live?esc(s.fullAddress):esc(s.city)))}
    ${anyLive?row('Режим работы',list.map(s=>s.live?(esc(s.scheduleText)||'<span class="q">не указан</span>'):dash)):''}
    ${row('Цена',list.map(s=>s.live?ask:(s.price?`${priceTxt(s)}<div class="hint">${esc(s.price[2])}</div>`:'<span class="q">по запросу</span>')),best(list.map(s=>s.price?s.price[0]:null),1))}
    ${row('Мин. заказ',list.map(s=>s.live?ask:`${fmt(s.moq[0])} ${s.moq[1]}`),best(list.map(s=>s.moq?s.moq[0]:null),1))}
    ${anyDemo?row('Доставка',list.map(s=>s.live?ask:esc(s.d[3]))):''}
    ${anyDemo?row('Оплата',list.map(s=>s.live?ask:esc(s.pay))):''}
    ${reqDocs.map(k=>row(DOCS[k],list.map(s=>{if(s.live)return ask;const d=docState(s,k);return d==='miss'?'<span class="bc">✕ нет</span>':d==='warn'?`<span class="wc">! ${until(s.docs[k])}</span>`:`<span class="okc">✓ ${until(s.docs[k])}</span>`}))).join('')}
    ${row('Источник',list.map(s=>s.live?`<a href="${s.url}" target="_blank" rel="noopener">Карточка в 2ГИС</a>`:`${s.verified?'Подтверждено':'Авто'} · ${ago(s.upd)}`))}
    ${row('Статус',list.map(s=>work.status[s.id]?STATUSES[work.status[s.id]]:`<button class="btn sm" data-shortlist="${s.id}"><svg class="i" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>В избранное</button>`))}
  </tbody></table></div>`;
}

// ---------- избранное ----------
function setStatus(id,v){
  const s=getS(id);if(!s)return;remember(s);const prev=work.status[id];
  if(v)work.status[id]=v;else delete work.status[id];save();
  renderCounts();if(currentView()==='shortlist')renderShortlist();if(currentView()==='mine')renderMine();if(currentView()==='search')renderList();
  const msg=v==='approved'?`${s.name} — постоянный поставщик. Он во вкладке «Мои поставщики»`:v==='reserve'?`${s.name} — резервный поставщик`:(v?'Статус: '+STATUSES[v]:'Убрано из избранного');
  toast(msg,()=>{if(prev)work.status[id]=prev;else delete work.status[id];save();renderCounts();if(currentView()==='shortlist')renderShortlist();if(currentView()==='mine')renderMine();if(currentView()==='search')renderList()});
}
function renderShortlist(){
  const ids=Object.keys(work.status).filter(getS);
  const c=k=>ids.filter(i=>work.status[i]===k).length;
  document.getElementById('sumBox').innerHTML=`<div><b>${ids.length-c('rejected')-c('approved')-c('reserve')}</b>в работе</div><div><b>${c('contacted')+c('waiting')}</b>ждут ответа</div><div><b>${c('offer')}</b>КП получено</div><div><b>${c('approved')+c('reserve')}</b>выбрано</div>`;
  const hints={candidate:'Добавьте из выдачи',contacted:'Написали поставщику',waiting:'Ждём ответ',offer:'Сравните условия',approved:'Перетащите сюда выбранного',reserve:'Запасной вариант',rejected:'Не подошёл'};
  document.getElementById('board').innerHTML=Object.entries(STATUSES).map(([k,v])=>{
    const cards=ids.filter(i=>work.status[i]===k).map(getS);
    return `<div class="col c-${k}" data-col="${k}"><h3>${v}<span class="cnt">${cards.length}</span></h3>${cards.map(s=>{const n=score(s).total,[cl]=band(n),of=offerOf(s);return `<div class="kc" draggable="true" data-card="${s.id}">
      <button class="nm" data-open="${s.id}">${esc(s.name)}</button>
      <div class="ln"><span>${esc(CATS[s.cat]||'')} · ${esc(s.city)}${s.live?' · 2ГИС':''}</span><span class="mini ${cl}">${n}%</span></div>
      ${of.price||of.moq?`<div class="ln"><span>${of.price?fmt(of.price[0])+' '+of.price[1]:'цена —'}</span><span>${of.moq?'от '+fmt(of.moq[0])+' '+of.moq[1]:''}</span></div>`:''}
      ${work.notes[s.id]?`<div class="note">${esc(work.notes[s.id].slice(0,90))}${work.notes[s.id].length>90?'…':''}</div>`:''}
      ${k==='offer'?`<div class="kact"><button class="btn sm primary" data-move="${s.id}" data-to="approved">Сделать постоянным</button><button class="btn sm" data-move="${s.id}" data-to="reserve">В резерв</button></div>`:''}
      <select data-status="${s.id}" aria-label="Статус">${Object.entries(STATUSES).map(([sk,sv])=>`<option value="${sk}" ${sk===k?'selected':''}>${sv}</option>`).join('')}<option value="">Убрать из избранного</option></select></div>`}).join('')||`<div class="dz">${hints[k]}</div>`}</div>`}).join('');
}

// ---------- мои поставщики ----------
function renderMine(){
  const ids=Object.keys(work.status).filter(i=>CHOSEN.includes(work.status[i])&&getS(i));
  const byCat={};ids.forEach(i=>{const s=getS(i);(byCat[s.cat||'other']=byCat[s.cat||'other']||[]).push(s)});
  const ap=ids.filter(i=>work.status[i]==='approved').length;
  const covered=Object.keys(CATS).filter(k=>(byCat[k]||[]).some(s=>work.status[s.id]==='approved')).length;
  document.getElementById('mineSum').innerHTML=`<div><b>${ap}</b>постоянных</div><div><b>${ids.length-ap}</b>резервных</div><div><b>${covered} из ${Object.keys(CATS).length}</b>категорий закрыто</div>`;
  const order=[...Object.keys(CATS).filter(k=>byCat[k]),...Object.keys(CATS).filter(k=>!byCat[k])];
  document.getElementById('mineList').innerHTML=order.map(k=>{
    const list=(byCat[k]||[]).sort((a,b)=>(work.status[a.id]==='approved'?0:1)-(work.status[b.id]==='approved'?0:1));
    const hasAp=list.some(s=>work.status[s.id]==='approved');
    const subsOf=s=>s.sub&&SUB[s.sub]?SUB[s.sub].name:(work.offers[s.id]?.sub&&SUB[work.offers[s.id].sub]?SUB[work.offers[s.id].sub].name:'');
    return `<div class="mcat"><div class="mcat-h"><h3>${CATS[k]}</h3><span class="cnt">${list.length}</span>${hasAp?'':`<span class="tag" style="background:var(--a-bg);color:var(--a-ink);border-color:transparent">нет постоянного поставщика</span>`}<span style="margin-left:auto"></span><button class="btn sm" data-findcat="${k}">Найти поставщиков</button></div>
      ${list.length?list.map(s=>{const of=offerOf(s),st2=work.status[s.id],last=((work.msgs||{})[s.id]||[]).slice(-1)[0];return `<div class="mrow">
        <div style="min-width:0"><button class="nm" data-open="${s.id}">${esc(s.name)}</button><div class="meta">${esc(subsOf(s)||s.products.slice(0,2).join(' · '))} · ${esc(s.city)}</div></div>
        <span class="badge ${st2}">${STATUSES[st2]}</span>
        <div><div class="hint">Цена</div>${of.price?`<b class="num">${fmt(of.price[0])} ${of.price[1]}</b>`:'<span class="q">нет данных</span>'}</div>
        <div><div class="hint">Мин. заказ</div>${of.moq?`<b class="num">${fmt(of.moq[0])} ${of.moq[1]}</b>`:'<span class="q">нет данных</span>'}</div>
        <div><div class="hint">Связь</div>${last?`${new Date(last.at).toLocaleDateString('ru-RU')} · ${CH[last.ch]}`:'<span class="q">не писали</span>'}${contactOf(s).email||contactOf(s).phone?`<div class="hint">${esc(contactOf(s).email||contactOf(s).phone)}</div>`:''}</div>
        <div class="acts2"><button class="btn sm primary" data-write="${s.id}">Написать</button><select data-status="${s.id}" aria-label="Статус" style="border:1px solid var(--line);border-radius:4px;padding:5px 6px">${Object.entries(STATUSES).map(([sk,sv])=>`<option value="${sk}" ${sk===st2?'selected':''}>${sv}</option>`).join('')}</select></div>
      </div>`}).join(''):`<div class="mempty">Пока никого. Найдите поставщиков и после КП перенесите лучшего в «Постоянный».</div>`}
    </div>`}).join('');
}
// ---------- карточка ----------
const TPL={rfq:'Запрос КП',price:'Цены и MOQ',docs:'Документы'};
function tplText(kind,s){
  const me=work.me||{},nm=me.name||'[ваше имя]',org=me.org||'[название заведения]',ph=me.phone||'[телефон]';
  const vol=st.vol?`${fmt(st.vol)} ${st.unit} в месяц`:'[объём] в месяц';
  const reg=st.region?REGION_IN[st.region]:'[город]';
  const docs=(st.docs.length?st.docs:Object.keys(s.docs||{})).map(k=>DOCS[k]).join(', ')||'декларация соответствия';
  const what=(s.live?(st.text||(st.subs.length?st.subs.map(k=>SUB[k].name).join(', '):'')||CATS[st.cat]||'продукция'):s.products[0]).toLowerCase();
  const hello=s.person&&!s.person.startsWith('Отдел')?`Здравствуйте, ${s.person.split(' ')[0]}!`:'Здравствуйте!';
  const sign=`\n\nС уважением,\n${nm}\n${org}\n${ph}`;
  if(kind==='price')return {subj:`Цены и минимальный заказ: ${what}`,text:`${hello}\n\nМеня зовут ${nm}, я отвечаю за закупки в «${org}». Рассматриваем вас как поставщика: ${what}.\n\nПодскажите, пожалуйста:\n— актуальные цены (пришлите прайс, если есть);\n— минимальный объём заказа;\n— скидки от объёма. Наш объём — около ${vol}, доставка в ${reg}.${sign}`};
  if(kind==='docs')return {subj:`Документы на продукцию: ${what}`,text:`${hello}\n\nМеня зовут ${nm}, я отвечаю за закупки в «${org}». Перед первой поставкой просим прислать копии документов на ${what}:\n— ${docs.split(', ').join(';\n— ')}.\n\nТакже подскажите, оформляете ли ветеринарные сопроводительные документы, если это требуется.${sign}`};
  return {subj:`Запрос КП: ${what}, доставка в ${reg}`,text:`${hello}\n\nМеня зовут ${nm}, я отвечаю за закупки в «${org}».\nИщем поставщика: ${what}, доставка в ${reg}.\nПланируемый объём: ${vol}.\n\nПодскажите, пожалуйста:\n— актуальный прайс и минимальный объём заказа;\n— график и стоимость доставки;\n— условия оплаты, возможна ли отсрочка;\n— копии документов: ${docs}.\n\nБудем благодарны за коммерческое предложение.${sign}`};
}
function rfq(s){const t=tplText('rfq',s);return t.subj+'\n\n'+t.text}
const CH={email:'Почта',wa:'WhatsApp',copy:'Скопировать'};
let comp={id:null,ch:'email'};
const contactOf=s=>{const c=(work.contacts||{})[s.id]||{},e=enrAny(s)||{};return {email:c.email||s.email||(e.emails||[])[0]||'',phone:c.phone||s.phone||(e.phones||[])[0]||''}};
const draftOf=s=>{const d=(work.drafts||{})[s.id];if(d)return d;const t=tplText('rfq',s);return {tpl:'rfq',subj:t.subj,text:t.text}};
function composeHTML(s){
  const d=draftOf(s),c=contactOf(s),ch=comp.ch,me=work.me||{};
  const toVal=ch==='email'?c.email:c.phone;
  const noContact=s.live&&!s.email&&!s.phone&&!toVal;
  const hist=((work.msgs||{})[s.id]||[]).slice().reverse();
  return `<h3>Написать поставщику</h3>
    <div class="chan" role="group" aria-label="Канал">${Object.entries(CH).map(([k,v])=>`<button type="button" data-ch="${k}" aria-pressed="${k===ch}">${v}</button>`).join('')}</div>
    <div class="tpls">Шаблон:${Object.entries(TPL).map(([k,v])=>`<button type="button" data-tpl="${k}" aria-pressed="${d.tpl===k}">${v}</button>`).join('')}</div>
    ${ch!=='copy'?`<div class="fld"><label for="cTo">${ch==='email'?'Почта поставщика':'Телефон для WhatsApp'}</label><input id="cTo" type="${ch==='email'?'email':'tel'}" value="${esc(toVal)}" placeholder="${ch==='email'?'sales@company.ru':'+7 900 000-00-00'}" autocomplete="off">
      ${noContact?`<div class="hint">2ГИС не передал контакты на текущем ключе. <a href="${s.url}" target="_blank" rel="noopener">Откройте карточку в 2ГИС</a>, скопируйте ${ch==='email'?'почту':'телефон'} сюда — сохраним в карточке поставщика.</div>`:''}</div>`:''}
    ${ch==='email'?`<div class="fld"><label for="cSubj">Тема</label><input id="cSubj" value="${esc(d.subj)}"></div>`:''}
    <div class="fld"><label for="cBody">Сообщение</label><textarea id="cBody">${esc(d.text)}</textarea></div>
    <details class="sig" ${me.name?'':'open'}><summary>Подпись: ${esc(me.name||'не заполнена')}${me.org?' · '+esc(me.org):''}</summary>
      <div class="grid3"><div class="fld"><label for="meName">Имя</label><input id="meName" data-me="name" value="${esc(me.name||'')}" placeholder="Анна Петрова"></div>
      <div class="fld"><label for="meOrg">Заведение</label><input id="meOrg" data-me="org" value="${esc(me.org||'')}" placeholder="Кафе на Арбате"></div>
      <div class="fld"><label for="mePhone">Телефон</label><input id="mePhone" data-me="phone" value="${esc(me.phone||'')}" placeholder="+7 900 000-00-00"></div></div>
      <div class="hint">Подставится во все шаблоны. Нажмите на шаблон ещё раз, чтобы обновить текст.</div></details>
    <div class="err" id="cErr" hidden></div>
    <div class="send-row">
      ${ch==='copy'?`<button class="btn primary" type="button" id="sendBtn">Скопировать сообщение</button>`
        :`<a class="btn primary" id="sendBtn" href="#" ${ch==='wa'?'target="_blank" rel="noopener"':''}>${ch==='email'?'Отправить из почты':'Открыть в WhatsApp'}</a>`}
      <span class="hint">${ch==='email'?'Откроется ваша почтовая программа с готовым письмом.':ch==='wa'?'Откроется чат WhatsApp с готовым текстом.':'Для формы на сайте поставщика или чата в 2ГИС.'}</span>
    </div>
    ${hist.length?`<div class="hist"><div class="fh">История · ${hist.length}</div>${hist.map(m=>`<details><summary>${new Date(m.at).toLocaleString('ru-RU',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})} · ${CH[m.ch]}${m.to?' → '+esc(m.to):''} · ${esc(TPL[m.tpl]||'')}</summary><pre>${esc((m.subj?m.subj+'\n\n':'')+m.text)}</pre></details>`).join('')}</div>`:''}`;
}
function sendState(){
  const s=getS(comp.id);if(!s)return {};
  const to=(document.getElementById('cTo')?.value||'').trim(),subj=document.getElementById('cSubj')?.value||'',text=document.getElementById('cBody')?.value||'';
  let ok=true,err='',href='#';
  if(comp.ch==='email'){ok=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to);err=to?'Проверьте адрес почты':'Укажите почту поставщика';href=`mailto:${to}?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(text)}`}
  else if(comp.ch==='wa'){let dg=to.replace(/\D/g,'');if(dg.length===11&&dg[0]==='8')dg='7'+dg.slice(1);ok=dg.length>=10;err=to?'Проверьте номер телефона':'Укажите телефон поставщика';href=`https://wa.me/${dg}?text=${encodeURIComponent(text)}`}
  if(!text.trim()){ok=false;err='Напишите сообщение'}
  return {s,to,subj,text,ok,err,href};
}
function updateSend(){
  const b=document.getElementById('sendBtn');if(!b)return;const x=sendState();
  if(b.tagName==='A'){b.href=x.ok?x.href:'#';b.setAttribute('aria-disabled',String(!x.ok))}
  document.getElementById('cTo')?.classList.remove('bad');
}
function saveDraft(){
  const s=getS(comp.id);if(!s)return;work.drafts=work.drafts||{};
  const prev=draftOf(s);
  work.drafts[s.id]={tpl:prev.tpl,subj:document.getElementById('cSubj')?.value??prev.subj,text:document.getElementById('cBody')?.value??prev.text};
  const to=document.getElementById('cTo');
  if(to&&to.value.trim()){work.contacts=work.contacts||{};const c=work.contacts[s.id]||{};c[comp.ch==='email'?'email':'phone']=to.value.trim();work.contacts[s.id]=c}
  remember(s);save();
}
function renderCompose(){const el=document.getElementById('composeSec');const s=getS(comp.id);if(el&&s){el.innerHTML=composeHTML(s);updateSend()}}
function logSend(x){
  work.progress.wrote=true;
  work.msgs=work.msgs||{};(work.msgs[x.s.id]=work.msgs[x.s.id]||[]).push({at:Date.now(),ch:comp.ch,to:x.to,subj:comp.ch==='email'?x.subj:'',text:x.text,tpl:draftOf(x.s).tpl});
  const cur=work.status[x.s.id];if(!cur||cur==='candidate'){work.status[x.s.id]='contacted'}
  remember(x.s);save();renderCounts();if(currentView()==='search')renderList();
  const sel=document.querySelector(`.da [data-status="${x.s.id}"]`);if(sel)sel.value=work.status[x.s.id];
  setTimeout(renderCompose,300);
}
function posHTML(s){
  const pm=prodMatch(s);if(!pm)return '';
  const rows=[['Совпадение',pm.found?`<span class="okc">✓ ${esc(pm.where.join('; '))}</span>`:'<span class="wc">в карточке 2ГИС не упоминается — уточните в запросе</span>']];
  if(s.live){rows.push(['Рубрики 2ГИС',esc((s.rubrics||[]).map(r=>r.name).join(', '))]);
    const ats=(s.attributes||[]).filter(a=>!/оплат|наличн|расчёт|qr/i.test(a));if(ats.length)rows.push(['Ассортимент в 2ГИС',esc(ats.slice(0,8).join(', '))]);
    rows.push(['Оплата',(s.attributes||[]).filter(a=>/оплат|наличн|расчёт/i.test(a)).map(esc).join(', ')||'<span class="q">не указана</span>'])}
  else rows.push(['Ассортимент',esc(s.products.join(', '))]);
  return `<div class="sec"><h3>Позиция: «${esc(pm.term)}»</h3><div class="pos">${rows.map(([a,b])=>`<div class="pl"><span>${a}</span><span>${b}</span></div>`).join('')}</div></div>`;
}
function keyHTML(s,form){
  const of=offerOf(s),bm=bench(s),o=work.offers[s.id]||{};
  const box=(lbl,val,sub,has)=>`<div class="kbox ${has?'has':'miss'}"><span class="kl">${lbl}</span><span class="kv2 num">${val}</span><span class="ks">${sub}</span></div>`;
  return `<h3>Минимальный заказ и цена</h3>
  <div class="key2">${box('Мин. заказ',of.moq?`${fmt(of.moq[0])} ${of.moq[1]}`:'нет данных',of.moq?esc(of.src):(st.vol?`ваш объём: ${fmt(st.vol)} ${st.unit}/мес`:'запросите у поставщика'),!!of.moq)}
  ${box('Цена',of.price?`${fmt(of.price[0])} ${of.price[1]}`:'нет данных',of.price?esc(of.price[2]||of.src):(bm?`ориентир по вашим КП: ${fmt(bm.min)}${bm.max>bm.min?'–'+fmt(bm.max):''} ${bm.u}`:'запросите у поставщика'),!!of.price)}</div>
  ${of.mine?`<div class="hint">Внесено ${new Date(of.at).toLocaleString('ru-RU',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})} · ${esc(of.src)}${of.delivery?' · доставка: '+esc(of.delivery):''}${of.pay?' · оплата: '+esc(of.pay):''}</div>`:''}
  ${s.live&&!of.mine?`<div class="hint">В 2ГИС этих данных нет. Запросите их письмом, а ответ поставщика внесите сюда — оценка пересчитается, а цена станет ориентиром для других поставщиков этой категории.</div>`:''}
  <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn sm primary" data-ask="${s.id}">Запросить цену и MOQ</button><button class="btn sm" data-offerform="${s.id}">${of.mine?'Изменить данные':'Внести из ответа'}</button></div>
  ${form?`<form class="offer-form" id="offerForm">
    <div class="grid3"><div class="fld"><label for="oPrice">Цена</label><input id="oPrice" type="number" step="0.01" min="0" value="${o.price??''}" placeholder="34"></div>
    <div class="fld"><label for="oPriceU">Единица</label><select id="oPriceU">${['₽/кг','₽/шт','₽/л','₽/уп'].map(u=>`<option ${(o.priceUnit||(st.unit==='шт'?'₽/шт':'₽/кг'))===u?'selected':''}>${u}</option>`).join('')}</select></div>
    <div class="fld"><label for="oNote">За что цена</label><input id="oNote" value="${esc(o.note||'')}" placeholder="мука в/с, мешок 50 кг"></div></div>
    <div class="grid3"><div class="fld"><label for="oMoq">Мин. заказ</label><input id="oMoq" type="number" min="0" value="${o.moq??''}" placeholder="500"></div>
    <div class="fld"><label for="oMoqU">Единица</label><select id="oMoqU">${['кг','шт','л'].map(u=>`<option ${(o.moqUnit||st.unit)===u?'selected':''}>${u}</option>`).join('')}</select></div>
    <div class="fld"><label for="oSrc">Откуда</label><select id="oSrc">${Object.entries(OSRC).filter(([k])=>k!=='supplier').map(([k,v])=>`<option value="${k}" ${(o.src||'kp')===k?'selected':''}>${v}</option>`).join('')}</select></div></div>
    <div class="grid3"><div class="fld"><label for="oDel">Доставка</label><input id="oDel" value="${esc(o.delivery||'')}" placeholder="своя, 2 дня, бесплатно от 1 т"></div>
    <div class="fld"><label for="oPay">Оплата</label><input id="oPay" value="${esc(o.pay||'')}" placeholder="отсрочка 14 дней"></div></div>
    <div class="err" id="oErr" hidden></div>
    <div style="display:flex;gap:8px"><button class="btn sm primary" type="submit">Сохранить</button><button class="btn sm" type="button" data-offercancel="${s.id}">Отмена</button>${of.mine?`<button class="btn sm" type="button" data-offerdel="${s.id}">Удалить</button>`:''}</div>
  </form>`:''}`;
}
function egrHTML(s,state){
  const eg=work.egrul[s.id];
  if(eg)return `<h3>Проверка по ЕГРЮЛ</h3><div class="egr"><div class="it"><b>${esc(eg.name)}</b>
    <span>ИНН ${esc(eg.inn)} · ОГРН ${esc(eg.ogrn)}${eg.kpp?' · КПП '+esc(eg.kpp):''}</span>
    <span>${eg.closed?`<span class="st-cl">Деятельность прекращена ${esc(eg.closed)}</span>`:`<span class="st-act">Действует</span>`} · зарегистрировано ${esc(eg.registered||'—')}${eg.region?' · '+esc(eg.region):''}</span>
    ${eg.head?`<span class="hint">${esc(eg.head)}</span>`:''}</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn sm" data-egrfind="${s.id}">Выбрать другое юрлицо</button><span class="hint">Источник: ЕГРЮЛ ФНС, бесплатно</span></div></div>`;
  const q=(s.brand||s.name).replace(/,.*$/,'').replace(/[«»"]/g,'').trim();
  if(!state)return `<h3>Проверка по ЕГРЮЛ</h3><p class="hint" style="margin:0">Найдём юрлицо в открытом реестре ФНС: ИНН, дата регистрации, руководитель, не ликвидирована ли компания.</p>
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center"><button class="btn sm" data-egrfind="${s.id}">Найти «${esc(q)}» в ЕГРЮЛ</button></div>`;
  if(state.loading)return `<h3>Проверка по ЕГРЮЛ</h3><div class="skel" style="height:60px"></div>`;
  if(state.error)return `<h3>Проверка по ЕГРЮЛ</h3><div class="notice warn">Реестр ФНС не ответил нашему серверу: он принимает запросы только из России. Проверьте компанию вручную на сайте ФНС, поиск по названию «${esc(q)}».</div><div style="display:flex;gap:8px;flex-wrap:wrap"><a class="btn sm" href="https://egrul.nalog.ru/index.html" target="_blank" rel="noopener">Открыть ЕГРЮЛ ↗</a><button class="btn sm" data-copy="${esc(q)}">Скопировать название</button><button class="btn sm" data-egrfind="${s.id}">Повторить</button></div>`;
  return `<h3>Проверка по ЕГРЮЛ · «${esc(state.query)}»</h3><div class="hint">Найдено ${state.total}. Выберите юрлицо поставщика — сверьте регион и название.</div>
    <div class="egr">${state.items.map((x,i)=>`<div class="it"><b>${esc(x.short)}</b><span>ИНН ${esc(x.inn)} · ${esc(x.region||'')} · с ${esc(x.registered||'—')} ${x.closed?`<span class="st-cl">· прекращена ${esc(x.closed)}</span>`:''}</span>${x.head?`<span class="hint">${esc(x.head)}</span>`:''}<div><button class="btn sm" data-egrpick="${i}">Это поставщик</button></div></div>`).join('')||'<span class="hint">Ничего не найдено</span>'}</div>`;
}
let egrState=null;
async function egrFind(id){
  const s=getS(id),q=(s.brand||s.name).replace(/,.*$/,'').replace(/[«»"]/g,'').trim(),el=document.getElementById('egrSec');
  el.innerHTML=egrHTML(s,{loading:true});
  try{const r=await fetch('/api/egrul?q='+encodeURIComponent(q));const d=await r.json();if(!r.ok)throw new Error(d.error||'Ошибка');egrState={id,...d};el.innerHTML=egrHTML(s,egrState)}
  catch(e){el.innerHTML=egrHTML(s,{error:(e.message||'ЕГРЮЛ не ответил')+(L.avail?'':'. Проверка работает в развёрнутой версии')})}
}
function openDrawer(id,toCompose){
  const s=getS(id);if(!s)return;remember(s);if(!work.progress.opened){work.progress.opened=true;save();renderGuide()}if(!work.viewed[s.id]){work.viewed[s.id]=Date.now();save();setTimeout(()=>{if(currentView()==='search')renderList()},0)}else{work.viewed[s.id]=Date.now();save()}if(s.live&&!enrOf(s))setTimeout(()=>enrichOne(s.id),50);
  const sc=score(s),dr=document.getElementById('drawer');
  const sel=`<select data-status="${s.id}" aria-label="Статус"><option value="">Не в избранном</option>${Object.entries(STATUSES).map(([k,v])=>`<option value="${k}" ${work.status[s.id]===k?'selected':''}>${v}</option>`).join('')}</select>`;
  const contactRow=(label,val)=>val?`<dt>${label}</dt><dd><span class="num" style="user-select:all">${esc(val)}</span><button class="copy" data-copy="${esc(val)}">Копировать</button></dd>`:'';
  const contacts=s.live
    ?`${(()=>{const en=enrAny(s)||{},ph=s.phone||(en.phones||[])[0]||'',em=s.email||(en.emails||[])[0]||'',site=s.site||(en.site||'');return contactRow('Телефон',ph)+contactRow('Почта',em)+(site?`<dt>Сайт</dt><dd><a href="${esc(safeUrl(site))}" target="_blank" rel="noopener">${esc(site.replace(/^https?:\/\//,''))}</a>${en.site&&!s.site?' <span class="hint">найден через Яндекс</span>':''}</dd>`:'')+(!ph&&!em?`<dt>Телефон, сайт</dt><dd><a href="${s.url}" target="_blank" rel="noopener">Открыть карточку в 2ГИС</a><div class="hint">Контакты ещё не найдены — ищем на сайте компании</div></dd>`:`<dt>2ГИС</dt><dd><a href="${s.url}" target="_blank" rel="noopener">Карточка организации</a></dd>`)})()}
      <dt>Адрес</dt><dd>${esc(s.fullAddress)}${s.addressComment?`<div class="hint">${esc(s.addressComment)}</div>`:''}</dd>`
    :`<dt>Контактное лицо</dt><dd>${esc(s.person)||'<span class="q">не указано</span>'}</dd>${contactRow('Телефон',s.phone)}${contactRow('Почта',s.email)}<dt>Сайт</dt><dd><span class="num">${s.site}</span> <span class="hint">демо-адрес</span></dd>`;
  const terms=s.live
    ?`<dt>Рубрики</dt><dd>${(s.rubrics||[]).map(r=>esc(r.name)+(r.primary?' <span class="tag ok">основная</span>':'')).join(', ')}</dd>
      <dt>Режим работы</dt><dd>${s.schedule&&!s.schedule.is24x7&&Object.keys(s.schedule.days).length?['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].filter(d=>s.schedule.days[d]).map(d=>`${d} ${esc(s.schedule.days[d])}`).join('<br>'):(esc(s.scheduleText)||'<span class="q">не указан</span>')}</dd>
      <dt>Рейтинг</dt><dd>${s.rating!=null?`★ ${String(s.rating).replace('.',',')} · ${s.reviews} ${plural(s.reviews,'оценка','оценки','оценок')}`:'<span class="q">нет оценок</span>'}</dd>
      <dt>Филиалов</dt><dd>${s.branches}</dd>
      <dt>Мин. заказ, цена</dt><dd class="q">нет в 2ГИС — в запросе КП</dd>
      <dt>Доставка, оплата</dt><dd class="q">нет в 2ГИС — в запросе КП</dd>`
    :`<dt>Ассортимент</dt><dd>${esc(s.products.join(', '))}</dd><dt>Мин. заказ</dt><dd>${fmt(s.moq[0])} ${s.moq[1]}</dd>
      <dt>Цена</dt><dd>${s.price?`${priceTxt(s)} <span class="hint">· ${esc(s.price[2])}</span>`:'<span class="q">по запросу</span>'}</dd>
      <dt>Доставка</dt><dd>${esc(s.d[3])}${s.d[1]?' · холодовая цепь':''}</dd>
      <dt>Регион работы</dt><dd>${s.served.includes('all')?'Вся Россия':s.served.map(r=>REGIONS[r]).join(', ')}</dd><dt>Оплата</dt><dd>${esc(s.pay)}</dd>`;
  const docs=s.live
    ?`<ul class="dlist">${(st.docs.length?st.docs:['decl']).map(k=>`<li><span>${DOCS[k]}</span><span class="wc">запросить</span></li>`).join('')}</ul><div class="hint">Следующий шаг интеграции: проверка по ИНН в реестре деклараций ЕАЭС.</div>`
    :`<ul class="dlist">${Object.keys(s.docs).map(k=>{const d=docState(s,k);return `<li><span>${DOCS[k]}${st.docs.includes(k)?' <span class="tag blue">нужен вам</span>':''}</span><span class="${d==='ok'?'okc':d==='warn'?'wc':'bc'}">${d==='miss'?'просрочен':(d==='warn'?'! истекает ':'✓ ')+until(s.docs[k])}</span></li>`}).join('')}${st.docs.filter(k=>!s.docs[k]).map(k=>`<li><span>${DOCS[k]} <span class="tag blue">нужен вам</span></span><span class="bc">✕ не найден</span></li>`).join('')}</ul>`;
  const srcs=s.live
    ?`<ul class="dlist"><li><span>2ГИС, Places API</span><span class="hint">получено ${L.fetchedAt?L.fetchedAt.toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'}):'сегодня'}</span></li></ul><a href="${s.url}" target="_blank" rel="noopener" style="font-size:13px">Открыть организацию в 2ГИС ↗</a>`
    :`<ul class="dlist">${s.src.map(k=>`<li><span>${SRC[k]}</span><span class="hint">${ago(s.upd)}</span></li>`).join('')}</ul>`;
  dr.innerHTML=`
  <div class="dh">${tile(sc.total)}<div style="min-width:0"><h2>${esc(s.name)}</h2><div class="hint">${esc(s.type)} · ${esc(s.city)}${s.since?' · с '+s.since+' г.':''}${s.live?' · 2ГИС':''}</div></div><button class="x" data-close aria-label="Закрыть">×</button></div>
  <div class="da">${sel}<label class="check"><input type="checkbox" data-cmp="${s.id}" ${work.compare.includes(s.id)?'checked':''}> Сравнить</label><button class="btn sm primary" data-jump="composeSec" style="margin-left:auto"><svg class="i" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>Написать</button></div>
  <div class="db">
    ${posHTML(s)}
    ${s.live?`<div class="sec" id="siteSec">${siteHTML(s)}</div>`:''}
    <div class="sec" id="keySec">${keyHTML(s)}</div>
    <div class="sec"><h3>Контакты</h3><dl class="kv">${contacts}</dl></div>
    <div class="sec compose" id="composeSec"></div>
    <div class="sec"><h3>${s.live?'Профиль и условия':'Условия'}</h3><dl class="kv">${terms}</dl></div>
    <div class="sec"><h3>Документы и сертификаты</h3>${docs}</div>
    <div class="sec"><h3>Почему ${sc.total}%</h3>
      <div class="bars">${Object.keys(sc.w).map(k=>`<div class="bar"><span>${sc.labels[k]}</span><div class="tr"><div class="fl" style="width:${Math.round(sc.parts[k]*100)}%"></div></div><span class="v">${Math.round(sc.parts[k]*sc.w[k])} / ${sc.w[k]}</span></div>`).join('')}</div>
      <ul class="why">${sc.reasons.map(([c,t])=>`<li class="${c}">${esc(t)}</li>`).join('')}</ul></div>
    <div class="sec"><h3>Источник данных</h3>${srcs}</div>
    <div class="sec" id="egrSec">${egrHTML(s)}</div>
    <div class="sec"><h3><label for="note-${s.id}">Заметки</label></h3><textarea id="note-${s.id}" data-note="${s.id}" placeholder="Например: звонил 21.10, обещали прайс до пятницы">${esc(work.notes[s.id]||'')}</textarea><div class="hint">Сохраняются автоматически.</div></div>
  </div>`;
  dr.hidden=false;document.getElementById('backdrop').hidden=false;dr.scrollTop=0;
  if(comp.id!==s.id)comp={id:s.id,ch:(contactOf(s).email||!contactOf(s).phone)?'email':'wa'};renderCompose();
  if(toCompose){const c=document.getElementById('composeSec');dr.scrollTop=c.offsetTop-120;setTimeout(()=>document.getElementById('cTo')&&!document.getElementById('cTo').value?document.getElementById('cTo').focus():document.getElementById('cBody')?.focus(),50)}else dr.querySelector('.x').focus();
}
function closeDrawer(){document.getElementById('drawer').hidden=true;document.getElementById('backdrop').hidden=true}


// ---------- навигация ----------
const VIEWS=['search','compare','shortlist','mine'],TITLES={search:'Поиск поставщиков',compare:'Сравнение поставщиков',shortlist:'Избранное',mine:'Мои поставщики'},CR={search:'Поиск',compare:'Сравнение',shortlist:'Избранное',mine:'Мои поставщики'};
const currentView=()=>{const h=location.hash.slice(1);return VIEWS.includes(h)?h:'search'};
function show(){
  const v=currentView();
  VIEWS.forEach(x=>document.getElementById('v-'+x).hidden=x!==v);
  document.querySelectorAll('.tabs a').forEach(a=>{if(a.dataset.view===v)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});
  document.querySelectorAll('.side .sub').forEach(a=>a.classList.toggle('on',a.dataset.sub===v));
  document.getElementById('pageTitle').textContent=TITLES[v];document.getElementById('crumbLast').textContent=CR[v];
  if(v==='search')renderList();if(v==='compare')renderCompare();if(v==='shortlist')renderShortlist();if(v==='mine')renderMine();
  renderCounts();
}
function refresh(){renderParsed();renderList();renderCounts();renderStamp();if(currentView()!=='search')show()}
function refreshAll(){renderFilters();refresh()}
const liveRerun=()=>{renderParsed();runLive(true)};

// ---------- события ----------
document.getElementById('askForm').addEventListener('submit',e=>{
  e.preventDefault();const q=document.getElementById('q').value.trim();if(!q){document.getElementById('q').focus();return}
  work.progress.searched=true;save();
  const p=parse(q);
  st.cat=p.cat||'';st.region=p.region||st.region||(st.source==='live'?'msk':'');st.vol=p.vol||0;if(p.unit)st.unit=p.unit;st.docs=p.docs;st.text=p.text;st.subs=p.subs||[];if(st.cat)expanded.add(st.cat);
  renderFilters();
  if(st.source==='live')liveRerun();else refresh();
  if(!p.cat&&!p.region&&!p.vol&&st.source!=='live')toast('Не нашёл категорию или город, уточните фильтрами');
});
document.addEventListener('click',e=>{
  const t=e.target.closest('#fApply,#fClose,#fRating button,[data-guide],[data-enrich],[data-move],[data-findcat],[data-exp],[data-ask],[data-offerform],[data-offercancel],[data-offerdel],[data-egrfind],[data-egrpick],[data-hide],[data-unhide],[data-showhidden],[data-unhideall],#qClear,[data-clearall],[data-write],[data-ch],[data-tpl],#sendBtn,[data-ex],[data-unchip],[data-open],[data-shortlist],[data-close],[data-copy],[data-copyrfq],[data-sent],[data-cmp-rm],[data-jump],[data-src],[data-p],#fReset,#backdrop,#loadMore,#toggleFilters,#refresh,#cmpClear,#burger,.side a');
  if(!t)return;
  if(t.dataset.guide){const a=t.dataset.guide,first=()=>document.querySelector('#list .row');
    if(a==='g-ex'){document.getElementById('q').value='Мука высшего сорта';document.getElementById('askForm').requestSubmit()}
    else if(a==='g-open'){const r=first();if(r)openDrawer(r.querySelector('[data-open]').dataset.open);else toast('Сначала дождитесь результатов поиска')}
    else if(a==='g-write'){const r=first();if(r)openDrawer(r.querySelector('[data-write]').dataset.write,true)}
    else if(a==='g-fav'){location.hash='shortlist'}
    else if(a==='g-hide'){work.progress.guideHidden=true;save();renderGuide()}
    return}
  if(t.dataset.enrich){enrichOne(t.dataset.enrich,!!t.dataset.force);return}
  if(t.dataset.move){setStatus(t.dataset.move,t.dataset.to);return}
  if(t.dataset.findcat){const k=t.dataset.findcat;st.cat=k;st.subs=[];st.text='';expanded.add(k);document.getElementById('q').value='';location.hash='search';renderFilters();if(st.source==='live')liveRerun();else refresh();return}
  if(t.dataset.exp){const k=t.dataset.exp;if(countOf('cat',k)===0)return;expanded.has(k)?expanded.delete(k):expanded.add(k);renderFilters();return}
  if(t.dataset.ask){const id=t.dataset.ask,s=getS(id);remember(s);const x=tplText('price',s);work.drafts=work.drafts||{};work.drafts[id]={tpl:'price',subj:x.subj,text:x.text};save();if(document.getElementById('drawer').hidden||comp.id!==id)openDrawer(id,true);else{renderCompose();const c=document.getElementById('composeSec');document.getElementById('drawer').scrollTop=c.offsetTop-120}return}
  if(t.dataset.offerform){const s=getS(t.dataset.offerform);document.getElementById('keySec').innerHTML=keyHTML(s,true);document.getElementById('oPrice').focus();return}
  if(t.dataset.offercancel){document.getElementById('keySec').innerHTML=keyHTML(getS(t.dataset.offercancel));return}
  if(t.dataset.offerdel){const id=t.dataset.offerdel;delete work.offers[id];save();openDrawer(id);renderList();toast('Данные удалены');return}
  if(t.dataset.egrfind){egrFind(t.dataset.egrfind);return}
  if(t.dataset.egrpick){const x=egrState.items[+t.dataset.egrpick],id=egrState.id,s=getS(id);remember(s);work.egrul[id]=x;save();document.getElementById('egrSec').innerHTML=egrHTML(s);renderList();toast(x.closed?'Внимание: компания ликвидирована':'Юрлицо привязано: ИНН '+x.inn);return}
  if(t.dataset.hide){const id=t.dataset.hide,s=getS(id);remember(s);work.hidden[id]={name:s.name,at:Date.now()};work.compare=work.compare.filter(i=>i!==id);save();renderList();renderCounts();toast('Скрыто: '+s.name,()=>{delete work.hidden[id];save();renderList();renderCounts()});return}
  if(t.dataset.unhide){delete work.hidden[t.dataset.unhide];save();renderList();renderCounts();return}
  if(t.dataset.showhidden!==undefined){showHidden=!showHidden;renderList();renderCounts();return}
  if(t.dataset.unhideall!==undefined){const prev={...work.hidden};work.hidden={};showHidden=false;save();renderList();renderCounts();toast('Все компании возвращены в выдачу',()=>{work.hidden=prev;save();renderList();renderCounts()});return}
  if(t.dataset.write){openDrawer(t.dataset.write,true);return}
  if(t.dataset.ch){saveDraft();comp.ch=t.dataset.ch;renderCompose();return}
  if(t.dataset.tpl){const s=getS(comp.id);saveDraft();const x=tplText(t.dataset.tpl,s);work.drafts[s.id]={tpl:t.dataset.tpl,subj:x.subj,text:x.text};save();renderCompose();return}
  if(t.id==='sendBtn'){const x=sendState();
    if(comp.ch==='copy'){copyText((x.subj?x.subj+'\n\n':'')+x.text,t);logSend(x);toast('Скопировано. Статус: Написал');return}
    if(!x.ok){e.preventDefault();const er=document.getElementById('cErr');er.textContent=x.err;er.hidden=false;document.getElementById('cTo')?.classList.add('bad');return}
    t.href=x.href;saveDraft();logSend(x);toast(comp.ch==='email'?'Письмо открыто в почте. Статус: Написал':'Открыли WhatsApp. Статус: Написал');return}
  if(t.matches('.side a')){document.getElementById('side').classList.remove('open');return}
  if(t.id==='burger'){document.getElementById('side').classList.toggle('open');return}
  if(t.id==='backdrop'||t.dataset.close!==undefined){closeDrawer();return}
  if(t.id==='toggleFilters'){showFilters=!showFilters;renderFilters();document.body.classList.toggle('sheet-open',showFilters&&innerWidth<=600);return}
  if(t.id==='qClear'||t.dataset.clearall!==undefined){clearQuery();return}
  if(t.id==='loadMore'){runLive(false);return}
  if(t.id==='cmpClear'){work.compare=[];save();renderList();renderCounts();return}
  if(t.dataset.src){if(t.disabled)return;st.source=t.dataset.src;st.types=[];if(st.source==='live'&&!st.region)st.region='msk';if(st.source==='live'&&!st.cat&&!st.text)st.cat='flour';renderSource();renderFilters();renderParsed();if(st.source==='live')runLive(true);else refresh();return}
  if(t.dataset.ex){document.getElementById('q').value=t.dataset.ex;document.getElementById('askForm').requestSubmit();return}
  if(t.dataset.unchip){const k=t.dataset.unchip;if(k==='cat'){st.cat='';st.subs=[]}else if(k.startsWith('sub:')){st.subs=st.subs.filter(x=>'sub:'+x!==k);st.text=''}else if(k==='region')st.region=st.source==='live'?'msk':'';else if(k==='vol')st.vol=0;else if(k==='text')st.text='';else st.docs=st.docs.filter(d=>'doc:'+d!==k);renderFilters();if(st.source==='live'&&(['cat','text','region'].includes(k)||k.startsWith('sub:')))liveRerun();else refresh();return}
  if(t.dataset.open){openDrawer(t.dataset.open);return}
  if(t.dataset.shortlist){const id=t.dataset.shortlist,s=getS(id);if(work.status[id]){delete work.status[id];toast('Убрано из избранного')}else{remember(s);work.status[id]='candidate';toast('В избранноее: '+s.name)}save();renderList();renderCounts();if(currentView()==='compare')renderCompare();return}
  if(t.dataset.copy){copyText(t.dataset.copy,t);return}
  if(t.dataset.copyrfq){copyText(rfq(getS(t.dataset.copyrfq)),t);return}
  if(t.dataset.sent){const id=t.dataset.sent;remember(getS(id));work.status[id]='contacted';save();openDrawer(id);renderList();renderCounts();toast('Статус: Написал');return}
  if(t.dataset.cmpRm){work.compare=work.compare.filter(i=>i!==t.dataset.cmpRm);save();renderCompare();renderCounts();return}
  if(t.dataset.jump){document.getElementById(t.dataset.jump).scrollIntoView({behavior:'smooth',block:'start'});return}
  if(t.dataset.p){st.preset=t.dataset.p;renderFilters();refresh();return}
  if(t.id==='fReset'){Object.assign(st,{vol:0,docs:[],types:[],onlyRegion:false,verified:false,priceKnown:false,minRating:0,noRetail:false,cashless:false,withReviews:false,weekend:false});renderFilters();refresh();return}
  if(t.id==='fClose'||t.id==='fApply'){showFilters=false;renderFilters();document.body.classList.remove('sheet-open');if(t.id==='fApply')document.getElementById('resTitle').scrollIntoView({block:'start'});return}
  if(t.dataset.r!==undefined&&t.closest('#fRating')){st.minRating=+t.dataset.r||0;renderFilters();renderList();renderCounts();return}
});
document.addEventListener('click',e=>{
  const row=e.target.closest('[data-row]');if(!row)return;
  if(e.target.closest('button,a,input,label,select,textarea,.acts'))return;
  if(window.getSelection&&String(window.getSelection()).length)return;
  openDrawer(row.dataset.row);
});
document.addEventListener('submit',e=>{
  if(e.target.dataset&&e.target.dataset.siteform){e.preventDefault();const id=e.target.dataset.siteform,v=document.getElementById('siteUrl').value.trim();if(!/^https?:\/\/[^\s.]+\./.test(v)){toast('Вставьте адрес сайта, начиная с https://');return}work.sites[id]=v;save();enrichOne(id,true);return}
  if(e.target.id!=='offerForm')return;e.preventDefault();
  const id=comp.id,s=getS(id),g=k=>document.getElementById(k).value.trim();
  const price=g('oPrice')?+g('oPrice').replace(',','.'):null,moq=g('oMoq')?+g('oMoq'):null;
  if(price==null&&moq==null){const er=document.getElementById('oErr');er.textContent='Укажите цену или минимальный заказ';er.hidden=false;return}
  remember(s);work.offers[id]={price,priceUnit:g('oPriceU'),note:g('oNote'),moq,moqUnit:g('oMoqU'),src:g('oSrc'),delivery:g('oDel'),pay:g('oPay'),at:Date.now(),cat:s.cat,sub:s.sub||st.subs[0]||null};
  const cur=work.status[id];if(!cur||['candidate','contacted','waiting'].includes(cur))work.status[id]='offer';
  save();openDrawer(id);renderList();renderCounts();toast('Сохранено. Статус: КП получено');
});
document.addEventListener('change',e=>{
  const t=e.target,live=st.source==='live';
  if(t.name==='cat'){st.cat=t.value;st.text='';st.subs=[];if(t.value)expanded.add(t.value);if(live)liveRerun();else refresh()}
  else if(t.id==='fRegion'){st.region=t.value;renderFilters();if(live)liveRerun();else refresh()}
  else if(t.id==='fUnit'){st.unit=t.value;refresh()}
  else if(t.id==='fOnlyRegion'){st.onlyRegion=t.checked;refresh()}
  else if(t.id==='fVerified'){st.verified=t.checked;refresh()}
  else if(t.id==='fPrice'){st.priceKnown=t.checked;refresh()}
  else if(['fNoRetail','fCashless','fReviews','fWeekend'].includes(t.id)){st[{fNoRetail:'noRetail',fCashless:'cashless',fReviews:'withReviews',fWeekend:'weekend'}[t.id]]=t.checked;renderFilters();renderList();renderCounts()}
  else if(t.id==='sort'){st.sort=t.value;renderList()}
  else if(t.dataset.doc){st.docs=t.checked?[...st.docs,t.dataset.doc]:st.docs.filter(d=>d!==t.dataset.doc);refresh()}
  else if(t.dataset.sub){const sk=t.dataset.sub,c=SUB[sk].cat;if(st.cat!==c){st.cat=c;st.subs=[]}st.subs=t.checked?[...st.subs,sk]:st.subs.filter(x=>x!==sk);st.text='';renderFilters();if(live)liveRerun();else refresh()}
  else if(t.dataset.type){st.types=t.checked?[...st.types,t.dataset.type]:st.types.filter(d=>d!==t.dataset.type);refresh()}
  else if(t.dataset.cmp){const id=t.dataset.cmp;
    if(t.checked){if(work.compare.length>=4){t.checked=false;toast('Сравнивать можно до 4 поставщиков');return}remember(getS(id));work.compare.push(id)}else work.compare=work.compare.filter(i=>i!==id);
    save();renderCounts();document.querySelectorAll(`[data-cmp="${id}"]`).forEach(x=>x.checked=work.compare.includes(id))}
  else if(t.dataset.status){setStatus(t.dataset.status,t.value);const ds=document.querySelector(`.da [data-status="${t.dataset.status}"]`);if(ds&&ds!==t)ds.value=t.value}
});
document.addEventListener('input',e=>{
  const t=e.target;
  if(t.id==='q'){document.getElementById('qClear').hidden=!t.value;return}
  if(t.id==='fVol'){st.vol=+t.value||0;renderParsed();renderList()}
  if(t.id==='cTo'||t.id==='cSubj'||t.id==='cBody'){document.getElementById('cErr').hidden=true;saveDraft();updateSend();return}
  if(t.dataset.me){work.me=work.me||{};work.me[t.dataset.me]=t.value.trim();save();const sm=document.querySelector('.sig summary');if(sm)sm.textContent='Подпись: '+(work.me.name||'не заполнена')+(work.me.org?' · '+work.me.org:'');return}
  if(t.dataset.note){const id=t.dataset.note;remember(getS(id));if(t.value.trim())work.notes[id]=t.value;else delete work.notes[id];save()}
});
let dragId=null;
document.addEventListener('dragstart',e=>{const c=e.target.closest&&e.target.closest('[data-card]');if(!c)return;dragId=c.dataset.card;c.classList.add('dragging');try{e.dataTransfer.setData('text/plain',dragId);e.dataTransfer.effectAllowed='move'}catch(_){}});
document.addEventListener('dragend',e=>{document.querySelectorAll('.dragging').forEach(x=>x.classList.remove('dragging'));document.querySelectorAll('.col.drop').forEach(x=>x.classList.remove('drop'));dragId=null});
document.addEventListener('dragover',e=>{const col=e.target.closest&&e.target.closest('[data-col]');if(!col||!dragId)return;e.preventDefault();document.querySelectorAll('.col.drop').forEach(x=>x!==col&&x.classList.remove('drop'));col.classList.add('drop')});
document.addEventListener('drop',e=>{const col=e.target.closest&&e.target.closest('[data-col]');if(!col||!dragId)return;e.preventDefault();const id=dragId;dragId=null;if(work.status[id]!==col.dataset.col)setStatus(id,col.dataset.col);else renderShortlist()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!document.getElementById('drawer').hidden)closeDrawer()});
window.addEventListener('hashchange',()=>{closeDrawer();show();window.scrollTo(0,0)});

// ---------- старт ----------
st.text='';
renderSource();renderFilters();renderParsed();show();renderStamp();
checkLive();

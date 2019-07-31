IDRegistry.genItemID("forgottenKnowledge");
Item.createItem("forgottenKnowledge","Forgotten Knowledge", {name: "book", meta: 0}, {stack:1});
Recipes.addShapeless({id:ItemID.forgottenKnowledge, count: 1, data: 0}, [{id: ItemID.starPiece, data: 0}, {id: 340, data: 0}]);

ModAPI.addAPICallback("GuideAPI", function(api){
    const GuideAPI = api.GuideAPI;
    const GuideHelper = api.GuideHelper;
    const PageControllers = api.PageControllers;

    GuideAPI.registerGuide("forgottenKnowledge", {
        item: ItemID.forgottenKnowledge, 
        debug: false, 
            textures: { 
            background: "book", 
            nextLink: "next_page", 
            preLink: "pre_page", 
            close: "cancel", 
        }, 
        pages: {
            "default": {
                nextLink: "quickStart",
                left: {
                    controller: PageControllers.BASIC_PAGE,
                    elements: [
                        {text: "XM Magic", size: 30},
                        {text:"XM(Exotic Matter) некоторые называют ее вис, некоторые аурой, мы же привыкли называть ее XM - это энергия окружающая и пронизывающая все в мире. Обуздав ее можно сотворить немыслимые вещи... ", size: 18}
                    ]
                },
                
                right: {
                    controller: PageControllers.BASIC_PAGE,
                    elements: [
                        {text: "Начало", size: 25, link: "quickStart"},
                        {text: "Добыча", size: 25, link: "digging"},
                        //{text: "Способы контроля", size: 25, link: "control"},
                        {text: "Новый металл", size: 25, link: "starBlock"},
                        {text: "Фокусировка!", size: 25, link: "simpleFocusing"},
                        {text: "Носимые предметы", size: 25, link: "baubles"},
                        {text: "Скрытая информация", size: 25, link: "IV"},
                        {text: "Куда его девать?", size: 25, link: "Charger"},
                        {text: "Время для upgrade!", size: 25, link: "tier2"},
                        {text: "Преобразование", size: 25, link: "transformer"},
                        {text: "Восстановление", size: 25, link: "restore"},
                        {text: "Печь?", size: 25, link: "furnace"},
                        {text: "Беспроводная передача", size: 25, link: "wireless"},
                        {text: "Инструменты из ночных слитков", size: 25, link: "dark"},
                        {text: "Режимы потребления XM", size: 25, link: "modes"}
                        
                    ]
                }
            },
            "quickStart": {
                nextLink: "digging",
                preLink: "default",
                
                left: {
                    controller: PageControllers.BASIC_PAGE,
                    elements: [
                        {text: "Основы", size: 30},
                        {text:"Так как XM содержится во всем - ее добыча не представляет трудностей, но с хранением в больших колличествах есть большие проблемы. Её  можно лишь временно сконцентрировать внутри чего либо.", size: 18}
                    ]
                },
                
                right: {
                    controller: PageControllers.ITEM_GRID_PAGE,
                    columns: 3,
                    item_size: 100,
                    items: [{id:BlockID.starOre, data:0},{id:ItemID.starPiece, data:0},{id:BlockID.starBlock, data:0}],
                    elements: [
                        {text: "Ресурсы", size: 25, link: "quickStart"},
                        {text: "Часто XM произвольно концентрируется внутри блоков и, когда ее колличество превышает допустимое - блок становится физическим проявлением этой энергии, при попытке его сломать- выпадает кусок, слабо концентрирующий XM", size: 18}
                        
                    ]
                }
            },
            "digging": {
                nextLink: "starBlock",
                preLink: "quickStart",
                
                left: {
                    controller: PageControllers.BASIC_PAGE,
                    elements: [
                        {text: "Добыча", size: 30},
                        {text:"XM, которая находится в мире можно высосать и использовать. Будьте аккуратны! Эту энергию легко достать, но чрезвычайно сложно поместить обратно. Старайтесь не допускать иссякания энергии, но если все же случилось, то готовьтесь к плохим последствиям и постарайтесь как можно быстрее уйти подальше.", size: 18}
                    ]
                },
                
                right: {
                    controller: PageControllers.ITEM_GRID_PAGE,
                    columns: 2,
                    item_size: 100,
                    items: [{id:BlockID.XMCollector, data:0},{id:BlockID.starIngotBlock, data:0}],
                    elements: [
                        {text: "Концентратор", size: 25, link: "quickStart"},
                        {text: "Безжалостно высасывает XM из чанка, не контролирует скорость и объем высасывания. Если энергия не потребляется другими механизмами, то блок безвозвартно сублимирует её в себе. Если это не контролировать, то блок превратся в нечто другое, но, во что?", size: 18}
                        
                    ]
                }
            },
            "baubles": {
                nextLink: "IV",
                preLink: "simpleFocusing",
                
                left: {
                    controller: PageControllers.BASIC_PAGE,
                    elements: [
                        {text: "Обереги, кольца и прочее барахло", size: 30},
                        {text:"Без их использования игра превратся в мучения и постояннную миграцию.", size: 18}
                    ]
                },
                
                right: {
                    controller: PageControllers.ITEM_GRID_PAGE,
                    columns: 3,
                    item_size: 100,
                    items: [{id:ItemID.mindBelt, data:0},{id:ItemID.starRing, data:0},{id:ItemID.chargingMedal, data:0}],
                    elements: [
                        {text: "Пояс разума", size: 25, link: "quickStart"},
                        {text: "Позволяет разумнее расходавать сконцентрированную в теле XM. А если покороче, то пояс дает скидку 50% на любое использование XM ИГРОКОМ.", size: 18},
                        {text: "Медальен зарядки", size: 25, link: "quickStart"},
                        {text: "Позволяет чинить предметы, извлекая XM из носителя. Для починки в игроке должна быть сконцентрирована XM и предмет, созданный из XM проводимого материала должен быть у ИГРОКА в руке.", size: 18},
                        {text: "Звездное кольцо", size: 25, link: "quickStart"},
                        {text: "Самый полезный предмет начинающего игрока. Немного повышает максимальное колличество XM, которое может концентрировать ИГРОК.", size: 18}                      
                    ]
                }
            },
            "simpleFocusing": {
                nextLink: "baubles",
                preLink: "starBlock",
                
                left: {
                    controller: PageControllers.BASIC_PAGE,
                    elements: [
                        {text: "Фокусировка!", size: 30},
                        {text:"XM можно сконцентрировать внутри живого существа, для безопастности окружающих лучше концентрировать ее внутри себя. ОСТОРОЖНО, неподготовленное тело может не выдержать эту силу!(но вы можете попробовать...) Перед концентрацией рекомендуется подготовить свое тело или просто обзавестись каким нибудь предметом,который поможет вам перенести такое. Но если вам все же удасться, то постарайтесь не медлить, ведь она удержать ее надолго почти невозможно.", size: 18}
                    ]
                },
                
                right: {
                    controller: PageControllers.ITEM_GRID_PAGE,
                    columns: 1,
                    item_size: 100,
                    items: [{id:ItemID.simplStarFocus, data:0}],
                    elements: [
                        {text: "Сделаем это!", size: 30},
                        {text: "Раз уж вы все же решились, то попробуйте применить механизм, обычно используемый в блоках. Остается надеяться на то,что вас не разорвет на части...", size: 18},
                    ]
                }
            },
            "starBlock": {
                nextLink: "simpleFocusing",
                preLink: "digging",
                
                left: {
                    controller: PageControllers.ITEM_GRID_PAGE,
                    columns: 2,
                    item_size: 100,
                    items:[{id: BlockID.starBlock, data:0},{id: ItemID.starIngot, data:0}],
                    elements: [
                        {text: "Странный материал", size: 30},
                        {text:"Перенасыщение XM блоком превело к образованию странного метала, он подобен тем кускам, которые  вы уже привыкли использовать, но исеет большую концентрацию XM. Возможно удасться придать предметам, сделанным из него новые свойства.", size: 18}
                    ]
                },
                
                right: {
                    controller: PageControllers.ITEM_GRID_PAGE,
                    columns: 5,
                    item_size: 100,
                    items: [{id:ItemID.starSword, data:0},{id:ItemID.starShovel, data:0},{id:ItemID.starPickaxe, data:0},{id:ItemID.starAxe, data:0},{id:ItemID.starHoe, data:0}],
                    elements: [
                        {text: "Они уже здесь!", size: 30},
                        {text: "После нескольких эксперементов вам удалось создать эту сверкающую пятерку, несмотря на их хрупкость, они способны воссоздавать себя. Они окзались наровне с железными инструментами, а порой даже лучше.", size: 18},
                    ]
                }
            },
            "IV": {
                nextLink: "Charger",
                preLink: "baubles",
                
                left: {
                    controller: PageControllers.BASIC_PAGE,
                    elements: [
                        {text: "Скрытые данные", size: 30},
                        {text:"Взаимодействуя с XM не забывайте о том, что каждое ваше действие отражается как на вас, так и на мире. И не всегда это вляение приносит пользу...", size: 18}
                    ]
                },
                
                right: {
                    controller: PageControllers.ITEM_GRID_PAGE,
                    columns: 1,
                    item_size: 100,
                    items: [{id:ItemID.collectingRobe, data:0}],
                    elements: [
                        {text: "Много непонятных слов", size: 30},
                        {text: "Каждый носимый предмет или действие по-разному влияет на вас и мир. Предметы и действия способны влиять на: вместимость вашего тела, вместимость чанка, силу использования предметов, скидку на их использование, защиту и отравление XM. Вам стоит запомнить, что нахождение XM в организме не остается незамеченным. После каждого втягивания в себя XM ваш организм будет накапливать смертоносный яд, способы извлечения которого еще неизвестны...", size: 18},
                    ]
                }
            },
            "Charger": {
                nextLink: "tier2",
                preLink: "IV",
                
                left: {
                    controller: PageControllers.BASIC_PAGE,
                    elements: [
                        {text: "Преобразование", size: 30},
                        {text:"Перенасыщая определенные предметы вы можете полностью изменить их природу", size: 18}
                    ]
                },
                
                right: {
                    controller: PageControllers.ITEM_GRID_PAGE,
                    columns: 3,
                    item_size: 100,
                    items: [{id:BlockID.charger, data:0},{id:ItemID.assemblerTool,data:0},{id:BlockID.assembler,data:0}],
                    elements: [
                        {text: "Зарядник и преобразователь", size: 30},
                        {text: "Подведите к заряднику XM и он начнет концентрировать XM в виде сгустка сверху, затем присоедините его к преобразователю с помощью инструмента и положите в преобразователь необходимый предмет, после достижения в заряднике необходимого уровня заряда он передаст его в предмет и тотизменит свои свойства.", size: 18},
                    ]
                }
            },
            "tier2": {
                nextLink: "transformer",
                preLink: "Charger",
                
                left: {
                    controller: PageControllers.BASIC_PAGE,
                    elements: [
                        {text: "Быстрее, выше, сильнее!", size: 30},
                        {text:"Пропитав обычные XM слитки вы сделали их на уровень выше!", size: 18}
                    ]
                },
                
                right: {
                    controller: PageControllers.ITEM_GRID_PAGE,
                    columns: 3,
                    item_size: 100,
                    items: [{id:BlockID.starIngotBlockTier2, data:0},{id:ItemID.starIngotTier2,data:0},{id:ItemID.swordTier2,data:0}],
                    elements: [
                        {text: "Лучше!", size: 30},
                        {text: "Пусть вам и пришлось потратить немного XM, но это того стоило! Предметы, созданные из второго уровня имеют новые, ранее недоступные способности! Особенно изменился меч, он стал не только сильнее и прочнее, но и замещает тело убитого врага на тело носителя меча(телепортирует)", size: 18},
                    ]
                }
            },
            "transformer": {
                nextLink: "restore",
                preLink: "tier2",
                
                left: {
                    controller: PageControllers.BASIC_PAGE,
                    elements: [
                        {text: "Одно в другое", size: 30},
                        {text:"С помощью этого устройства, дополненного специальными линзами вы можете изменять слитки не меняя их уровень", size: 18}
                    ]
                },
                
                right: {
                    controller: PageControllers.ITEM_GRID_PAGE,
                    columns: 3,
                    item_size: 100,
                    items: [{id:BlockID.transformer, data:0},{id:ItemID.lensDark,data:0},{id:ItemID.darkIngot,data:0}],
                    elements: [
                        {text: "XM Transformer", size: 30},
                        {text: "Это устройство более стабильная верия преобразователя и теперь он не требует зарядников, но требует больше XM и спецаильные линзы. Так же на получаемый материал вляет время суток, погода, линза и удача...", size: 18},
                    ]
                }
            },
            "restore": {
                nextLink: "furnace",
                preLink: "transformer",
                
                left: {
                    controller: PageControllers.BASIC_PAGE,
                    elements: [
                        {text: "Восстановление", size: 30},
                        {text:"С помощью этого устройствавы можете восполнить XM в атмосфере", size: 18}
                    ]
                },
                
                right: {
                    controller: PageControllers.ITEM_GRID_PAGE,
                    columns: 1,
                    item_size: 100,
                    items: [{id:BlockID.generator, data:0}],
                    elements: [
                        {text: "Восстановитель", size: 30},
                        {text: "Устройство поедает саженцы вокруг себя и преобразует их в XM", size: 18},
                    ]
                }
            },
            
            "furnace": {
                nextLink: "wireless",
                preLink: "restore",
                
                left: {
                    controller: PageControllers.BASIC_PAGE,
                    elements: [
                        {text: "Вот так печь..", size: 30},
                        {text:"Плавит быстро, жрет много", size: 18}
                    ]
                },
                
                right: {
                    controller: PageControllers.ITEM_GRID_PAGE,
                    columns: 1,
                    item_size: 100,
                    items: [{id:BlockID.starFurnace, data:0}],
                    elements: [
                        {text: "Звездная печь", size: 30},
                        {text: "Используйте на свой страх и риск! Не забывайте о последствиях...", size: 18},
                    ]
                }
            },
            "wireless": {
                nextLink: "dark",
                preLink: "furnace",
                
                left: {
                    controller: PageControllers.BASIC_PAGE,
                    elements: [
                        {text: "Без проводов!", size: 30},
                        {text:"Данное устройство позволит удобно переносить XM по воздуху на большие расстояния. Помета автора: кликайте в присяде оправляющим по принимающему", size: 18}
                    ]
                },
                
                right: {
                    controller: PageControllers.ITEM_GRID_PAGE,
                    columns: 2,
                    item_size: 100,
                    items: [{id:BlockID.transmitter, data:0},{id:BlockID.transmitter, data:1}],
                    elements: [
                        {text: "Беспроводной передатчик", size: 30},
                        {text: "Кликните первым по второму что бы привязать. Нажмите по нему в присяде, что бы поменять режим на отдачу(на красный)", size: 18},
                    ]
                }
            },
            "dark": {
                nextLink: "modes",
                preLink: "wireless",
                
                left: {
                    controller: PageControllers.BASIC_PAGE,
                    elements: [
                        {text: "Странный течный слиток", size: 30},
                        {text:"Этот слиток, полученный при совмещении новых ресурсов, линзы и ночи способен на странные вещи.", size: 18}
                    ]
                },
                
                right: {
                    controller: PageControllers.ITEM_GRID_PAGE,
                    columns: 2,
                    item_size: 100,
                    items: [{id:ItemID.darkIngot, data:0},{id:ItemID.swordDark, data:0}],
                    elements: [
                        {text: "Инструменты самой ночи", size: 30},
                        {text: "При совмещении с обычными материалами удалось создать только меч, но этот меч способен создавать странный черный луч, забирая и окрашивая XM из атмосферы.", size: 18},
                    ]
                }
            },
             "modes": {
                nextLink: "quickStart",
                preLink: "dark",
                
                left: {
                    controller: PageControllers.BASIC_PAGE,
                    elements: [
                        {text: "Режимы потребления XM", size: 30},
                        {text:"Исследуя взаимодействие XM и организма вам удалось открыть способы кратковременного увеличения эффективности тела.", size: 18}
                    ]
                },
                
                right: {
                    controller: PageControllers.ITEM_GRID_PAGE,
                    columns: 1,
                    item_size: 100,
                    items: [{id:ItemID.XMunlocker, data:0}],
                    elements: [
                        {text: "XMunlocker", size: 30},
                        {text: "Этот режим способен кратковременно, но очень сильно увеличить эффективность использования XM, но вместе с этим усилится его расход и урон телоу. Имеет несколько стадий. После достижения последней-вы умрете", size: 18},
                    ]
                }
            }
            
            ////
        }
    });
});

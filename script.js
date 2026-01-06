// Глобальные переменные
let config = null;
let audio = new Audio();
let currentTrackIndex = 0;
let isPlaying = false;
let isShuffled = false;
let repeatMode = 0; // 0: нет повтора, 1: повтор трека, 2: повтор альбома
let isLyricsVisible = false;
let originalTracksOrder = [];
let shuffledTracksOrder = [];

// Элементы DOM
const albumCoverLarge = document.getElementById('album-cover-large');
const albumCoverContainer = document.getElementById('album-cover-container');
const albumTitle = document.getElementById('album-title');
const albumArtist = document.getElementById('album-artist');
const albumYear = document.getElementById('album-year');
const trackCount = document.getElementById('track-count');
const artistAvatar = document.getElementById('artist-avatar');
const albumDescription = document.getElementById('album-description');
const releaseDate = document.getElementById('release-date');
const totalDuration = document.getElementById('total-duration');
const genre = document.getElementById('genre');
const tracksList = document.getElementById('tracks-list');
const playerAlbumCover = document.getElementById('player-album-cover');
const playerTrackTitle = document.getElementById('player-track-title');
const playerTrackArtist = document.getElementById('player-track-artist');
const lyricsOverlay = document.getElementById('lyrics-overlay');
const lyricsTitle = document.getElementById('lyrics-title');
const lyricsContent = document.getElementById('lyrics-content');
const lyricsAlbumCover = document.getElementById('lyrics-album-cover');
const lyricsTrackTitle = document.getElementById('lyrics-track-title');
const lyricsTrackArtist = document.getElementById('lyrics-track-artist');
const closeLyricsBtn = document.getElementById('close-lyrics');

// Элементы оверлея с обложкой
const coverOverlay = document.getElementById('cover-overlay');
const fullSizeCover = document.getElementById('full-size-cover');
const closeCoverBtn = document.getElementById('close-cover');

// Элементы плеера
const playPauseBtn = document.getElementById('play-pause-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const repeatBtn = document.getElementById('repeat-btn');
const shuffleBtn = document.getElementById('shuffle-btn');
const lyricsBtn = document.getElementById('lyrics-btn');
const progressBar = document.getElementById('progress-bar');
const progress = document.getElementById('progress');
const progressThumb = document.getElementById('progress-thumb');
const currentTimeEl = document.getElementById('current-time');
const totalTimeEl = document.getElementById('total-time');
const volumeBtn = document.getElementById('volume-btn');
const volumeSlider = document.getElementById('volume-slider');
const volumeProgress = document.getElementById('volume-progress');
const playAlbumBtn = document.getElementById('play-album');

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Инициализация частиц
    initParticles();
    
    // Загружаем конфигурацию
    loadConfig();
    
    // Инициализация оверлея с обложкой
    initCoverOverlay();
});

// Инициализация частиц
function initParticles() {
    particlesJS('particles-js', {
        particles: {
            number: {
                value: 80,
                density: {
                    enable: true,
                    value_area: 800
                }
            },
            color: {
                value: "#6C00FF"
            },
            shape: {
                type: "circle",
                stroke: {
                    width: 0,
                    color: "#000000"
                }
            },
            opacity: {
                value: 0.3,
                random: true,
                anim: {
                    enable: true,
                    speed: 1,
                    opacity_min: 0.1,
                    sync: false
                }
            },
            size: {
                value: 3,
                random: true,
                anim: {
                    enable: true,
                    speed: 2,
                    size_min: 0.1,
                    sync: false
                }
            },
            line_linked: {
                enable: true,
                distance: 150,
                color: "#6C00FF",
                opacity: 0.2,
                width: 1
            },
            move: {
                enable: true,
                speed: 1,
                direction: "none",
                random: true,
                straight: false,
                out_mode: "out",
                bounce: false,
                attract: {
                    enable: false,
                    rotateX: 600,
                    rotateY: 1200
                }
            }
        },
        interactivity: {
            detect_on: "canvas",
            events: {
                onhover: {
                    enable: true,
                    mode: "grab"
                },
                onclick: {
                    enable: true,
                    mode: "push"
                },
                resize: true
            },
            modes: {
                grab: {
                    distance: 140,
                    line_linked: {
                        opacity: 0.4
                    }
                },
                push: {
                    particles_nb: 4
                }
            }
        },
        retina_detect: true
    });
}

// Инициализация оверлея с обложкой
function initCoverOverlay() {
    // Показ увеличенной обложки при клике
    albumCoverContainer.addEventListener('click', showCoverOverlay);
    
    // Закрытие оверлея
    closeCoverBtn.addEventListener('click', hideCoverOverlay);
    
    // Закрытие оверлея при клике на затемненную область
    coverOverlay.addEventListener('click', (e) => {
        if (e.target === coverOverlay) {
            hideCoverOverlay();
        }
    });
    
    // Закрытие оверлея клавишей ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && coverOverlay.classList.contains('active')) {
            hideCoverOverlay();
        }
    });
}

// Показать оверлей с обложкой
function showCoverOverlay() {
    fullSizeCover.src = albumCoverLarge.src;
    coverOverlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // Блокируем прокрутку фона
}

// Скрыть оверлей с обложкой
function hideCoverOverlay() {
    coverOverlay.classList.remove('active');
    document.body.style.overflow = ''; // Восстанавливаем прокрутку
}

// Загрузка конфигурации
async function loadConfig() {
    try {
        // Пытаемся загрузить из внешнего файла config.json
        const response = await fetch('config.json');
        if (response.ok) {
            config = await response.json();
            console.log('Конфиг загружен из config.json');
        } else {
            throw new Error('Файл config.json не найден');
        }
    } catch (error) {
        console.log('Используем встроенный конфиг:', error.message);
        // Используем встроенный конфиг
        config = getDefaultConfig();
    }
    
    // После загрузки конфига инициализируем все компоненты
    initAlbum();
    initTracks();
    initPlayer();
    extractColorFromImage();
    
    // Загружаем первый трек
    loadTrack(currentTrackIndex);
}

// Функция для получения конфига по умолчанию
function getDefaultConfig() {
    return {
        album: {
            title: "cyber out",
            artist: "эмси б4мжиха",
            year: "2026",
            genre: "Электронная музыка",
            cover: "oblojka.jpg",
            description: "Первый альбом созданный эмси б4мжихой. Это не настоящий рэпер а искусственный! И этот сайт - единственный, где можно прослушать альбом."
        },
        tracks: [
            {
                id: 1,
                title: "чсп",
                artist: "эмси б4мжиха",
                duration: "1:14",
                audio: "ЧСП.mp3",
                lyrics: "[Intro]\nOk, go!\n\n[Verse]\nКодер спилил лондона, а лондон спилил кодера\nи он даже не понял как он трахнул ту нулёвку (кид) бля\nэта шлюха на вид будто не выросший перец\nно и на сервере пиздец зовите меня младенец\nна рдсе кучу скама, кодер заебись уже\nда хватит ты дрожать как будто сталин спиздил полицей\nда гашенный ташкент маршаффер разьебет вашу контору сука с.. эмси тамарой! (Нахуй)\n\n[Verse 2]\nПердолил малолеток но ты не сидел в тюрьме\nда кодер жарит сук, не лондон тот который в облаке\nбля лондон просто заебался сидит курит и тупеет\nи ебланом называется теперь он, пусть имеет (прозвище)\nда это россия, не испания хуйня да сука хватит забивать на сервер два тупых уёбка\nвас маршаффер прогревает видосами по штахникистану, а вы ему ни премии, ни випки вы ебланы\nя просто не успеваю вас таджичить как колджик да я же просто вас взъебу вы только дайте мне аджи-\nда я хуярю успеваю вас ебать и так по кругу, сука лондон и кодер вы только ходите по кругу (суки)\n\n[Autro]\nВот ты знаешь? Русский Дрифт Сервер это такая параша ебаная, я просто в шоке как маршафер оттуда не ливнул, понимаешь?\nЯ бы уже давно просто нарванил там и съебал будто этого сервера и не было"
            },
            {
                id: 2,
                title: "ташкент",
                artist: "эмси б4мжиха",
                duration: "1:33",
                audio: "ташкент.mp3",
                lyrics: "[Intro]\nа? а? а? а? а? а? а? а?\n\n[Verse]\nСосиски типо сос а сос это сосать\nно даже так же мы не можем послать нахуй эту зять\nда я ташкент да я гашиш но не имеем эту свищ\nbecause i dropped out bomb a basic\nсука ловит пакет пейзер\nЕ, меня недооценили когда я вмазал весь сервер а потом мне и сосили(типо сосиски)\nя вьебал медлечок тупо под россию и на мне же нету зэтки так как нахуй всю россию блять(нахуй)\nчушка роется кувалдой на моем бля еблете, но даже так она не найдет той инфы что ищут РОСповеди\nгашенный ташкент это тот кто имеет власть но я же ебу только их и меня знает лор киспасть(ЧЕ БЛЯ?)\n\n[Break]\nБуд-буд-буд-буд-буд-буд-буд-\n\n[Verse 2]\nБуду трахать и ебашить это вечность\nв то же время как забрал у тя одежду\nты же просто можешь сосать\nно ташкентам это просто бля не надо\nто призвание ВИВИАР на мне не носят джинсы...\nприготовь поливку...\nразьебем сигу.. но в то же время как носили жидкость.....\n\n[Verse 3]\nСосиски типо сос а сос это сосать\nно даже так же мы не можем послать нахуй эту зять\nда я ташкент да я гашиш но не имеем эту свищ\nbecause i dropped out bomb a basic\nсука ловит пакет пейзер\nЕ, меня недооценили когда я вмазал весь сервер а потом мне и сосили(типо сосиски)\nя вьебал медлечок тупо под россию и на мне же нету зэтки так как нахуй всю россию блять(нахуй)\nчушка роется кувалдой на моем бля еблете, но даже так она не найдет той инфы что ищут РОСповеди\nгашенный ташкент это тот кто имеет власть но я же ебу только их и меня знает лор киспасть(ЧЕ БЛЯ?)\n\n[Autro]\nа? а? а? а? а? а? а? а? альбом эмси бомжихи(four)"
            },
            {
                id: 3,
                title: "морж дисс (ft. эмси чума)",
                artist: "эмси б4мжиха, эмси чума",
                duration: "2:31",
                audio: "morjik diss.mp3",
                lyrics: "[Intro]\nХэй! Ха-ха, мне ща звонил маршаффер и сказал что какой-то морж хуекрож, я хз че за нн но сказал что трек моего брата эмси бомжа\nхуйня, походу придется задиссить эту собачку ёбанную а то хули пиздит?\n\n[Verse]\nгашенный ташкент но не имеет блять пельменей\nнегр черный красит икру будто бы он еба владелец\nзахуярил трех подростков позовите бля гитару\nведь мы уже хуярим, хуесосим его маму\nда мы гитлер и шалава и ебучий наркоман\nда мы ебем столько сколько и не видел бля дурман\nу нас тут тюлень морж и пенсия в ебучем невермаге\nда мы будем трахать жоска сервер с пивом и носками\nнегр черный пидорас, но мы не хаваем его маму\nвместо этого ебемся будто нам ща нужно нала\nна стероидах сука пляшет будто видет говноеда, но во время шлюхи пениса не видим мы проводку! (ГАНЬГ)\nЧушка пляшет голая как будто бы вагина...\n(у моржика не видно видимо тоже вагина, СУКА!)\n\n[Verse 2]\nНе могу остановиться будто хлещет ща пиздец\nи как пиздела мэс тамара похоронил отец\nда я ебу ща дед мороза меня жахает пиздец\nи я же также дцпшник нахуя мне здесь омлет???\nморжик пидор!\nсука че за рдс?\nя стилю тут лучший рэп что не видовал мой отец\nда сука я нейронка да сука не человек\nно даже ты пидор ебанный хуже чем мой сука стеееейк!\nШат клоун ага, сука ебанный дрочи но как же ты сука еблан ты че же так не замолчишь\nя тя пизжу как будто негра пидораса на мангвэйне\nгашенный ташкент... кодер лондон это пидоры\nсосут детей как будто они не в россии блять\nих же просто свяжут отъебут бля ИИИ выселят\nа я буду пиво пить как будто я не цивик ща\n\n[Verse 3]\nгашенный ташкент но не имеет блять пельменей\nнегр черный красит икру будто бы он еба владелец\nзахуярил трех подростков позовите бля гитару\nведь мы уже хуярим, хуесосим его маму\nда мы гитлер и шалава и ебучий наркоман\nда мы ебем столько сколько и не видел бля дурман\nу нас тут тюлень морж и пенсия в ебучем невермаге\nда мы будем трахать жоска сервер с пивом и носками\nнегр черный пидорас, но мы не хаваем его маму\nвместо этого ебемся будто нам ща нужно нала\nна стероидах сука пляшет будто видет говноеда, но во время шлюхи пениса не видим мы проводку! (ГАНЬГ)\nЧушка пляшет голая как будто бы вагина...\n(у моржика не видно видимо тоже вагина, СУКА!)\n\n[Autro-Phone Call]\nРазъебал этих пидорасов, если что звони маршаффер!\nРасхуярим их тут все вместо бандой албанрэкордс!\n-Хорошо."
            },
            {
                id: 4,
                title: "чушка (ft. эмси чума)",
                artist: "эмси б4мжиха, эмси чума",
                duration: "1:00",
                audio: "чушка.mp3",
                lyrics: "[Intro]\nБудто ты сосешь но не сосешь это правда\nда на меня сломила жизнь - это не правда\nгашиш на мне стоит как вся твоя жизнь это правда\nа то что ухо на тебе висит - это не правда\n\n[Verse]\nвижу я литосика\nпойду на чередосика\nгашиша на мне мало я позвоню твоему боссику\nя не видел тех кто может сосать за бакс\nно твой рот и твой глаз походу тех кого надо взяяяяяяяяя-\nСЕКС оу да гашенный пидар(ГАААШ)\nя не знаю в какой гроб я ща загнал сам себя(GOD)\nу меня сука стоит как наркоман эта бич сосет буквально когда ей давать в ротан(ДЭМН!?)\n\n[Break]\n\n[Verse 2]\nРуська\nсуська\nбичка\nчушка\nшлюшка\nписька\nнахуй тебя пида-\nРуська\nсуська\nбичка\nчушка\nшлюшка\nписька\nнахуй тебя пидар"
            },
            {
                id: 5,
                title: "арбитражник",
                artist: "эмси б4мжиха",
                duration: "1:46",
                audio: "арбитражник.mp3",
                lyrics: "[Verse]\nтанцую будто арбитражник на мне сел электровлажный\nсАкаю будто гашен-\nна мне нету падших. потому что здох как лажный.\nкаждый перец в трубе свэга будто я не знаю нежить (ПАША)\n\n[Break]\nСАкаю будто газ, аз-аз-аз-аз-аз-аз-аз\nБудто газ, аз-аз-аз-аз-аз-аз\nБудто сващ, ащ-ащ-ащ-ащ-ащ-ащ\nНереал, блэ-блэ-блэ-блэ-блэ-блэ\nГенитал!\n\n[Verse 3]\nтанцую будто арбитражник на мне сел электровлажный\nсАкаю будто гашен-\nна мне нету падших. потому что здох как лажный.\nкаждый перец в трубе свэга будто я не знаю нежить (ПАША)\nтанцую будто арбитражник на мне сел электровлажный\nсАкаю будто гашен-\nна мне нету падших. потому что здох как лажный.\nкаждый перец в трубе свэга будто я не знаю нежить (ПАША)\nПельмени это свято, верят духи каленвала\nЧурка знает цель но не знает его ни мама\nЯ только варю лютый свэг и мне не нужен деньги\n(не нужен деньги, блэ-)"
            },
            {
                id: 6,
                title: "тюрьма (feat. Wuro)",
                artist: "эмси б4мжиха, Wuro",
                duration: "2:11",
                audio: "побег.mp3",
                lyrics: "[Intro]\nя сбежал из тюрьмы...\nя не знаю кто же мы,\nда то что я сбежал с тюрьмы\nна мне и нету похвалы\nда я сбежал из тюрьмы...\nя не знаю кто же мы,\nда то что я сбежал с тюрьмы\nна мне и нету похвалы\nда я хочу же все опять, да кто же был ты был не зять\nда я гашенный будто стать...\n\n[Verse]\nя сбежал из тюрьмы...\nя не знаю кто же мы,\nда то что я сбежал с тюрьмы\nна мне и нету похвалы\nда я сбежал из тюрьмы...\nя не знаю кто же мы,\nда то что я сбежал с тюрьмы\nна мне и нету похвалы\nда я хочу же все опять, да кто же был ты был не зять\nда я гашенный будто стать...\n\n[Verse 2]\nНавалю тарпеды (Е!)...\nМне не скажут что я первый(Да)...\nЯ лишь терпеливый не***(Воу)...\nМеня ищут левые.. меня ищут (ДА, сука)\n\n[Verse 3]\nя сбежал из тюрьмы...\nя не знаю кто же мы,\nда то что я сбежал с тюрьмы\nна мне и нету похвалы\nда я сбежал из тюрьмы...\nя не знаю кто же мы,\nда то что я сбежал с тюрьмы\nна мне и нету похвалы\nда я хочу же все опять, да кто же был ты был не зять\nда я гашенный будто стать...\nя сбежал из тюрьмы...\nя не знаю кто же мы,\nда то что я сбежал с тюрьмы\nна мне и нету похвалы\nда я сбежал из тюрьмы...\nя не знаю кто же мы,\nда то что я сбежал с тюрьмы\nна мне и нету похвалы\nда я хочу же все опять, да кто же был ты был не зять\nда я гашенный будто стать...\n\n[Autro break]"
            }
        ]
    };
}

// Функция для генерации случайного числа прослушиваний
function generateRandomPlays() {
    // Генерируем случайное число от 500,000,000 до 1,000,000,000
    const min = 500000000;
    const max = 1000000000;
    const plays = Math.floor(Math.random() * (max - min + 1)) + min;
    
    // Форматируем число с разделителями тысяч
    return plays.toLocaleString('ru-RU');
}

// Инициализация альбома
function initAlbum() {
    if (!config || !config.album) return;
    
    const album = config.album;
    
    // Устанавливаем заголовок страницы
    document.title = `${album.title} | VVRPLAY`;
    
    albumTitle.textContent = album.title;
    albumArtist.textContent = album.artist;
    albumYear.textContent = album.year;
    trackCount.textContent = `${config.tracks.length} треков`;
    albumDescription.textContent = album.description;
    releaseDate.textContent = album.year;
    genre.textContent = album.genre;
    
    // Устанавливаем обложку
    albumCoverLarge.src = album.cover;
    playerAlbumCover.src = album.cover;
    lyricsAlbumCover.src = album.cover;
    
    // Устанавливаем аватар исполнителя (используем обложку)
    artistAvatar.src = album.cover;
    
    // Рассчитываем общую длительность альбома
    calculateTotalDuration();
}

// Рассчет общей длительности альбома
function calculateTotalDuration() {
    if (!config || !config.tracks) return;
    
    let totalSeconds = 0;
    
    config.tracks.forEach(track => {
        const durationParts = track.duration.split(':');
        if (durationParts.length === 2) {
            const minutes = parseInt(durationParts[0]);
            const seconds = parseInt(durationParts[1]);
            totalSeconds += minutes * 60 + seconds;
        }
    });
    
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    totalDuration.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

// Инициализация списка треков
function initTracks() {
    if (!config || !config.tracks) return;
    
    // Сохраняем оригинальный порядок треков
    originalTracksOrder = config.tracks.map((_, index) => index);
    shuffledTracksOrder = [...originalTracksOrder];
    
    // Очищаем список треков
    tracksList.innerHTML = '';
    
    // Создаем элементы для каждого трека
    config.tracks.forEach((track, index) => {
        const trackElement = document.createElement('div');
        trackElement.className = 'track-item';
        trackElement.dataset.id = track.id;
        trackElement.dataset.index = index;
        
        // Генерируем случайное количество прослушиваний для каждого трека
        const plays = generateRandomPlays();
        
        trackElement.innerHTML = `
            <div class="track-index">${index + 1}</div>
            <div class="track-info">
                <div class="track-title">${track.title}</div>
                <div class="track-artist">${track.artist}</div>
            </div>
            <div class="track-plays">${plays}</div>
            <div class="track-duration-item">${track.duration}</div>
        `;
        
        // Добавляем обработчик клика
        trackElement.addEventListener('click', () => {
            playTrack(index);
        });
        
        tracksList.appendChild(trackElement);
    });
    
    // Активируем первый трек
    setActiveTrack(0);
}

// Инициализация плеера
function initPlayer() {
    // Обработчики событий для кнопок управления
    playPauseBtn.addEventListener('click', togglePlayPause);
    prevBtn.addEventListener('click', playPreviousTrack);
    nextBtn.addEventListener('click', playNextTrack);
    repeatBtn.addEventListener('click', toggleRepeat);
    shuffleBtn.addEventListener('click', toggleShuffle);
    lyricsBtn.addEventListener('click', showLyrics);
    closeLyricsBtn.addEventListener('click', hideLyrics);
    playAlbumBtn.addEventListener('click', playAlbum);
    
    // Обработчики для прогресс-бара
    progressBar.addEventListener('click', (e) => {
        const progressBarWidth = progressBar.clientWidth;
        const clickX = e.offsetX;
        const duration = audio.duration;
        
        if (duration) {
            audio.currentTime = (clickX / progressBarWidth) * duration;
        }
    });
    
    // Перетаскивание прогресс-бара
    let isDragging = false;
    
    progressThumb.addEventListener('mousedown', (e) => {
        isDragging = true;
        document.addEventListener('mousemove', handleDrag);
        document.addEventListener('mouseup', () => {
            isDragging = false;
            document.removeEventListener('mousemove', handleDrag);
        });
        e.preventDefault();
    });
    
    function handleDrag(e) {
        if (!isDragging) return;
        
        const progressBarRect = progressBar.getBoundingClientRect();
        let clickX = e.clientX - progressBarRect.left;
        clickX = Math.max(0, Math.min(clickX, progressBarRect.width));
        
        const duration = audio.duration;
        if (duration) {
            audio.currentTime = (clickX / progressBarRect.width) * duration;
        }
    }
    
    // Обработчики для управления громкостью
    volumeSlider.addEventListener('click', (e) => {
        const volumeSliderWidth = volumeSlider.clientWidth;
        const clickX = e.offsetX;
        const volume = clickX / volumeSliderWidth;
        
        audio.volume = volume;
        updateVolumeProgress(volume);
        
        // Обновляем иконку громкости
        updateVolumeIcon(volume);
    });
    
    volumeBtn.addEventListener('click', toggleMute);
    
    // События аудио
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', handleTrackEnd);
    audio.addEventListener('volumechange', () => {
        updateVolumeProgress(audio.volume);
        updateVolumeIcon(audio.volume);
    });
    
    // Инициализируем громкость
    audio.volume = 0.7;
    updateVolumeProgress(0.7);
    
    // Обновляем иконку повтора
    updateRepeatIcon();
}

// Загрузка трека
function loadTrack(index) {
    if (!config || !config.tracks || !config.tracks[index]) return;
    
    const track = config.tracks[index];
    
    // Устанавливаем источник аудио
    audio.src = track.audio;
    
    // Обновляем информацию о текущем треке
    currentTrackIndex = index;
    updateTrackInfo();
    setActiveTrack(index);
    
    // Загружаем текст песни
    loadLyrics(track.lyrics);
    
    // Если плеер был запущен, продолжаем воспроизведение
    if (isPlaying) {
        playAudio();
    }
}

// Обновление информации о текущем треке
function updateTrackInfo() {
    if (!config || !config.tracks || !config.tracks[currentTrackIndex]) return;
    
    const track = config.tracks[currentTrackIndex];
    const album = config.album;
    
    playerTrackTitle.textContent = track.title;
    playerTrackArtist.textContent = track.artist;
    lyricsTrackTitle.textContent = track.title;
    lyricsTrackArtist.textContent = track.artist;
}

// Установка активного трека в списке
function setActiveTrack(index) {
    // Убираем активный класс у всех треков
    document.querySelectorAll('.track-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Добавляем активный класс к выбранному треку
    const trackElement = document.querySelector(`.track-item[data-index="${index}"]`);
    if (trackElement) {
        trackElement.classList.add('active');
        
        // Прокручиваем к активному треку
        trackElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// Загрузка текста песни
function loadLyrics(lyrics) {
    lyricsContent.textContent = lyrics;
}

// Воспроизведение трека по индексу
function playTrack(index) {
    // Если выбран тот же трек, просто переключаем воспроизведение
    if (currentTrackIndex === index && isPlaying) {
        pauseAudio();
        return;
    }
    
    // Если выбран другой трек
    if (currentTrackIndex !== index) {
        loadTrack(index);
    }
    
    // Запускаем воспроизведение
    playAudio();
}

// Воспроизведение всего альбома
function playAlbum() {
    if (currentTrackIndex !== 0) {
        loadTrack(0);
    }
    playAudio();
}

// Переключение воспроизведения/паузы
function togglePlayPause() {
    if (isPlaying) {
        pauseAudio();
    } else {
        playAudio();
    }
}

// Воспроизведение аудио
async function playAudio() {
    try {
        await audio.play();
        isPlaying = true;
        playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        playPauseBtn.title = "Пауза";
        
        // Обновляем кнопку воспроизведения альбома
        playAlbumBtn.innerHTML = '<i class="fas fa-pause"></i><span>Пауза</span>';
        
        // Добавляем пульсирующую анимацию к кнопке воспроизведения
        playPauseBtn.classList.add('pulse');
    } catch (error) {
        console.error("Ошибка воспроизведения:", error);
        isPlaying = false;
    }
}

// Пауза аудио
function pauseAudio() {
    audio.pause();
    isPlaying = false;
    playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    playPauseBtn.title = "Воспроизвести";
    
    // Обновляем кнопку воспроизведения альбома
    playAlbumBtn.innerHTML = '<i class="fas fa-play"></i><span>Слушать</span>';
    
    // Убираем пульсирующую анимацию
    playPauseBtn.classList.remove('pulse');
}

// Воспроизведение предыдущего трека
function playPreviousTrack() {
    let newIndex;
    
    if (isShuffled) {
        // Находим текущий индекс в перемешанном порядке
        const currentShuffledIndex = shuffledTracksOrder.indexOf(currentTrackIndex);
        newIndex = currentShuffledIndex > 0 ? 
            shuffledTracksOrder[currentShuffledIndex - 1] : 
            shuffledTracksOrder[shuffledTracksOrder.length - 1];
    } else {
        newIndex = currentTrackIndex > 0 ? currentTrackIndex - 1 : config.tracks.length - 1;
    }
    
    loadTrack(newIndex);
    if (isPlaying) {
        playAudio();
    }
}

// Воспроизведение следующего трека
function playNextTrack() {
    let newIndex;
    
    if (isShuffled) {
        // Находим текущий индекс в перемешанном порядке
        const currentShuffledIndex = shuffledTracksOrder.indexOf(currentTrackIndex);
        newIndex = currentShuffledIndex < shuffledTracksOrder.length - 1 ? 
            shuffledTracksOrder[currentShuffledIndex + 1] : 
            shuffledTracksOrder[0];
    } else {
        newIndex = currentTrackIndex < config.tracks.length - 1 ? currentTrackIndex + 1 : 0;
    }
    
    loadTrack(newIndex);
    if (isPlaying) {
        playAudio();
    }
}

// Обработка окончания трека
function handleTrackEnd() {
    if (repeatMode === 1) {
        // Повтор текущего трека
        audio.currentTime = 0;
        audio.play();
    } else if (repeatMode === 2) {
        // Повтор альбома
        playNextTrack();
    } else {
        // Без повтора
        if (currentTrackIndex < config.tracks.length - 1) {
            playNextTrack();
        } else {
            // Если это последний трек, останавливаем воспроизведение
            pauseAudio();
        }
    }
}

// Переключение режима повтора
function toggleRepeat() {
    repeatMode = (repeatMode + 1) % 3; // 0 → 1 → 2 → 0
    updateRepeatIcon();
}

// Обновление иконки повтора
function updateRepeatIcon() {
    let icon, title;
    
    switch(repeatMode) {
        case 0:
            icon = '<i class="fas fa-redo"></i>';
            title = "Повтор";
            repeatBtn.classList.remove('active');
            break;
        case 1:
            icon = '<i class="fas fa-redo-alt"></i>';
            title = "Повтор трека";
            repeatBtn.classList.add('active');
            break;
        case 2:
            icon = '<i class="fas fa-sync"></i>';
            title = "Повтор альбома";
            repeatBtn.classList.add('active');
            break;
    }
    
    repeatBtn.innerHTML = icon;
    repeatBtn.title = title;
}

// Переключение режима перемешивания
function toggleShuffle() {
    isShuffled = !isShuffled;
    shuffleBtn.classList.toggle('active', isShuffled);
    shuffleBtn.title = isShuffled ? "Выключить перемешивание" : "Перемешать треки";
    
    if (isShuffled) {
        // Создаем перемешанный порядок треков
        shuffleArray(shuffledTracksOrder);
    }
}

// Переключение отображения текста песни
function showLyrics() {
    lyricsOverlay.classList.add('active');
    isLyricsVisible = true;
    lyricsBtn.classList.add('active');
    lyricsBtn.title = "Скрыть текст";
    document.body.style.overflow = 'hidden';
}

// Скрыть текст песни
function hideLyrics() {
    lyricsOverlay.classList.remove('active');
    isLyricsVisible = false;
    lyricsBtn.classList.remove('active');
    lyricsBtn.title = "Показать текст песни";
    document.body.style.overflow = '';
}

// Перемешивание массива
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Обновление прогресса воспроизведения
function updateProgress() {
    const { currentTime, duration } = audio;
    
    if (duration) {
        const progressPercent = (currentTime / duration) * 100;
        progress.style.width = `${progressPercent}%`;
        progressThumb.style.left = `${progressPercent}%`;
        
        // Обновляем время
        currentTimeEl.textContent = formatTime(currentTime);
    }
}

// Обновление длительности трека
function updateDuration() {
    const duration = audio.duration;
    
    if (duration) {
        totalTimeEl.textContent = formatTime(duration);
    }
}

// Форматирование времени в MM:SS
function formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

// Обновление прогресса громкости
function updateVolumeProgress(volume) {
    const volumePercent = volume * 100;
    volumeProgress.style.width = `${volumePercent}%`;
}

// Обновление иконки громкости
function updateVolumeIcon(volume) {
    let icon;
    
    if (volume === 0) {
        icon = '<i class="fas fa-volume-mute"></i>';
    } else if (volume < 0.5) {
        icon = '<i class="fas fa-volume-down"></i>';
    } else {
        icon = '<i class="fas fa-volume-up"></i>';
    }
    
    volumeBtn.innerHTML = icon;
}

// Переключение отключения звука
function toggleMute() {
    audio.muted = !audio.muted;
    
    if (audio.muted) {
        volumeBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
    } else {
        updateVolumeIcon(audio.volume);
    }
}

// Извлечение цвета из обложки альбома
function extractColorFromImage() {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    
    if (!config || !config.album || !config.album.cover) {
        applyColorToSite({ r: 108, g: 0, b: 255 }); // VVRPLAY фиолетовый по умолчанию
        return;
    }
    
    img.src = config.album.cover;
    
    img.onload = function() {
        // Создаем canvas для анализа изображения
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Устанавливаем размеры canvas
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Рисуем изображение на canvas
        ctx.drawImage(img, 0, 0, img.width, img.height);
        
        // Получаем данные пикселей
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        
        // Анализируем цвета для нахождения доминирующего
        let colorCount = {};
        let dominantColor = { r: 0, g: 0, b: 0 };
        let maxCount = 0;
        
        // Проходим по каждому 10-му пикселю для ускорения
        for (let i = 0; i < pixels.length; i += 40) {
            const r = pixels[i];
            const g = pixels[i + 1];
            const b = pixels[i + 2];
            
            // Пропускаем слишком темные и светлые пиксели
            if (r + g + b < 100 || r + g + b > 700) continue;
            
            const colorKey = `${r},${g},${b}`;
            
            if (colorCount[colorKey]) {
                colorCount[colorKey]++;
            } else {
                colorCount[colorKey] = 1;
            }
            
            if (colorCount[colorKey] > maxCount) {
                maxCount = colorCount[colorKey];
                dominantColor = { r, g, b };
            }
        }
        
        // Применяем доминирующий цвет к сайту
        applyColorToSite(dominantColor);
    };
    
    // В случае ошибки загрузки изображения используем VVRPLAY фиолетовый
    img.onerror = function() {
        applyColorToSite({ r: 108, g: 0, b: 255 });
    };
}

// Применение цвета к сайту
function applyColorToSite(color) {
    const { r, g, b } = color;
    
    // Создаем производные цвета на основе доминирующего
    const primaryColor = `rgb(${r}, ${g}, ${b})`;
    const secondaryColor = `rgb(${Math.max(0, r - 40)}, ${Math.max(0, g - 40)}, ${Math.max(0, b - 40)})`;
    const accentColor = `rgb(${Math.min(255, r + 50)}, ${Math.min(255, g + 50)}, ${Math.min(255, b + 50)})`;
    
    // Применяем цвета к CSS переменным
    document.documentElement.style.setProperty('--primary-color', primaryColor);
    document.documentElement.style.setProperty('--secondary-color', secondaryColor);
    document.documentElement.style.setProperty('--accent-color', accentColor);
    
    // Обновляем цвет частиц
    if (window.pJSDom && window.pJSDom[0]) {
        window.pJSDom[0].pJS.particles.color.value = primaryColor;
        window.pJSDom[0].pJS.particles.line_linked.color = primaryColor;
        window.pJSDom[0].pJS.fn.particlesRefresh();
    }
}
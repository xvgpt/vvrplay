const config1 = {
    "album": {
        "title": "cyber out",
        "artist": "эмси б4мжиха",
        "year": "2026",
        "genre": "Электронная музыка",
        "cover": "oblojka.jpg",
        "description": "Первый альбом созданный эмси б4мжихой. Это не настоящий рэпер а искусственный! И этот сайт - единственный, где можно прослушать альбом."
    },
    "tracks": [ /* ... полный список из предыдущей версии ... */ ]
};

const config2 = {
    "album": {
        "title": "NADEZHDA 2026",
        "artist": "эмси б4мжиха",
        "year": "2026",
        "genre": "Хип-Хоп / Rap",
        "cover": "oblojka2.jpg",
        "description": "Второй альбом созданный эмси б4мжихой. Тут наш AI рэпер решил выдать интересное *космическое* звучание. Заряжайте свои космо-лёты и погнали!"
    },
    "tracks": [ /* ... полный список из предыдущей версии ... */ ]
};

// Массив всех альбомов
const albumsData = [
    {
        album: config1.album,
        tracks: config1.tracks
    },
    {
        album: config2.album,
        tracks: config2.tracks
    },
    {
        album: {
            title: "NFS Carbon RapVol.1",
            artist: "Wuro, эмси б4мжиха, эмси чума",
            year: "2026",
            genre: "Хип-Хоп / Rap, Электронная музыка",
            cover: "oblojka3nfs.jpg",
            description: "Думаю вы и сами всё знаете."
        },
        tracks: [ /* ... полный список из предыдущей версии ... */ ]
    }
];

let currentAlbumData = null;
let currentTrackIndex = 0;
let isPlaying = false;
let repeatMode = false;
let shuffleMode = false;
let isMuted = false;
let previousVolume = 0.7;
const audio = new Audio();
let visualizerCtx = null;

// Инициализация
function init() {
    renderHomePage();
    setupAudioEvents();
    audio.volume = 0.7;
    setupVisualizer();
    createParticles();
    initMobilePlayer(); // инициализация мобильного плеера
}

// ... все предыдущие функции (renderHomePage, openAlbum, playTrack, togglePlay и т.д.) остаются без изменений ...

// ====== НОВЫЙ КОД: МОБИЛЬНЫЙ ПЛЕЕР (СВОРАЧИВАНИЕ/РАЗВОРАЧИВАНИЕ) ======
function initMobilePlayer() {
    const player = document.getElementById('player');
    const dragHandle = document.querySelector('.player-drag-handle');

    // Устанавливаем начальное состояние в зависимости от ширины экрана
    function updatePlayerState() {
        if (window.innerWidth <= 768) {
            player.classList.remove('expanded'); // на мобильных по умолчанию свёрнут
        } else {
            player.classList.add('expanded'); // на ПК всегда развёрнут
        }
    }
    updatePlayerState();
    window.addEventListener('resize', updatePlayerState);

    // Обработчик клика на drag-handle (только на мобильных)
    if (dragHandle) {
        dragHandle.addEventListener('click', (e) => {
            e.stopPropagation();
            player.classList.toggle('expanded');
        });
    }

    // Обработка свайпа вверх/вниз
    let touchStartY = 0;
    player.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
    }, { passive: true });

    player.addEventListener('touchmove', (e) => {
        if (!touchStartY) return;
        const touchY = e.touches[0].clientY;
        const diff = touchStartY - touchY; // положительное при движении вверх

        if (diff > 30) { // свайп вверх – развернуть
            player.classList.add('expanded');
            touchStartY = 0;
        } else if (diff < -30) { // свайп вниз – свернуть
            player.classList.remove('expanded');
            touchStartY = 0;
        }
    }, { passive: true });

    player.addEventListener('touchend', () => {
        touchStartY = 0;
    });
}

// Все остальные функции (goBack, playAlbum, prevTrack, nextTrack, toggleShuffle, toggleRepeat, toggleMute, changeVolume, seek, showLyrics, closeLyrics, openZoom, closeZoom, calculateAlbumDuration, formatTime, setupAudioEvents, drawVisualizer, createParticles) остаются точно такими же, как в предыдущей полной версии.
// (Для экономии места они не дублируются, но в реальном файле они должны присутствовать)

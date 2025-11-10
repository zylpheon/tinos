apps.wallpapers = {
    title: 'Wallpapers',
    icon: './images/icons//wallpapers.ico',
    windowClass: 'wallpapers-window',
    contentClass: 'wallpapers-content',
    getContent: function () {
        const wallpapers = [
            '1.jpg',
            '2.jpg',
            '3.jpg',
            '4.jpg'
        ];
        let html = '<h2>Choose Wallpaper</h2><div class="wallpaper-grid">';
        wallpapers.forEach((wallpaper, index) => {
            html += `
                <div class="wallpaper-item" data-wallpaper="images/wallpapers/${wallpaper}">
                    <img src="images/wallpapers/${wallpaper}" alt="Wallpaper ${index + 1}">
                    <span>Wallpaper ${index + 1}</span>
                </div>
            `;
        });
        html += '</div>';
        return html;
    },
    init: function (windowElement) {
        const wallpaperItems = windowElement.querySelectorAll('.wallpaper-item');
        const desktop = document.getElementById('desktop');
        wallpaperItems.forEach(item => {
            item.addEventListener('click', function () {
                const wallpaperPath = this.getAttribute('data-wallpaper');
                desktop.style.backgroundImage = `url('${wallpaperPath}')`;
                wallpaperItems.forEach(w => w.classList.remove('selected'));
                this.classList.add('selected');
            });
        });
    }
};
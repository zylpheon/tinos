apps.certificates = {
    title: 'Certificates',
    icon: './images/icons/certificates.ico',
    windowClass: 'certificates-window',
    contentClass: 'certificates-content',
    getContent: function () {
        const certificates = [
            { id: 1, name: 'Machine Learning for Beginners', file: 'sertif10.webp' },
            { id: 2, name: 'Intermediate Web Development', file: 'sertif9.webp' },
            { id: 3, name: 'Financial Literacy 101', file: 'sertif8.webp' },
            { id: 4, name: 'Programming with Python', file: 'sertif7.webp' },
            { id: 5, name: 'Basics of Data Visualization', file: 'sertif6.webp' },
            { id: 6, name: 'Web Development Fundamentals', file: 'sertif5.webp' },
            { id: 7, name: 'JavaScript Programming Basics', file: 'sertif4.webp' },
            { id: 8, name: 'Create Front-End Web for Beginners', file: 'sertif3.webp' },
            { id: 9, name: 'AI Basics', file: 'sertif2.webp' },
            { id: 10, name: 'Basics of Web Programming', file: 'sertif1.webp' }
        ];
        let html = '<h2>My Certificates</h2><div class="certificates-grid">';
        certificates.forEach((cert) => {
            html += `
                <div class="certificate-item" data-cert="./images/certificates/${cert.file}">
                    <img src="./images/certificates/${cert.file}" alt="${cert.name}">
                    <span>${cert.name}</span>
                </div>
            `;
        });
        html += '</div>';
        html += '<div id="certificate-modal" class="certificate-modal hidden"><div class="modal-content"><span class="modal-close">&times;</span><img src="" alt="Certificate"></div></div>';
        return html;
    },
    init: function (windowElement) {
        const certificateItems = windowElement.querySelectorAll('.certificate-item');
        const modal = windowElement.querySelector('#certificate-modal');
        const modalImg = modal.querySelector('img');
        const closeBtn = modal.querySelector('.modal-close');

        certificateItems.forEach(item => {
            item.addEventListener('click', function () {
                const certPath = this.getAttribute('data-cert');
                modalImg.src = certPath;
                modal.classList.remove('hidden');
            });
        });
        closeBtn.addEventListener('click', function () {
            modal.classList.add('hidden');
        });
        modal.addEventListener('click', function (e) {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });
    }
};
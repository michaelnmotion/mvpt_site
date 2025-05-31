document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.tab-button');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetId = tab.getAttribute('data-tab'); // Get the data-tab value

            // Deactivate all tabs and content
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));

            // Activate clicked tab
            tab.classList.add('active');

            // Activate corresponding content
            const targetContent = document.getElementById(targetId); // Use the data-tab value as ID
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
});
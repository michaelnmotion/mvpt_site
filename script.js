document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.tab-button');
    const contents = document.querySelectorAll('.tab-content');
    const burger = document.getElementById('burger-menu');
    const mainNav = document.getElementById('main-nav');

    // Tab switching functionality
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetId = tab.getAttribute('data-tab');

            // Deactivate all tabs and content
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));

            // Activate clicked tab and corresponding content
            tab.classList.add('active');
            const targetContent = document.getElementById(targetId);
            if (targetContent) {
                targetContent.classList.add('active');
            }

            // If mobile nav is open, close it
            if (mainNav && mainNav.classList.contains('mobile-active')) {
                mainNav.classList.remove('mobile-active');
                if (burger) {
                    burger.classList.remove('open');
                    burger.setAttribute('aria-expanded', 'false');
                }
            }
        });
    });

    // Burger menu toggle
    if (burger && mainNav) {
        burger.addEventListener('click', () => {
            mainNav.classList.toggle('mobile-active');
            burger.classList.toggle('open');
            const isExpanded = mainNav.classList.contains('mobile-active');
            burger.setAttribute('aria-expanded', isExpanded.toString());
        });
    }

    // Testimonial Carousel
    const slider = document.querySelector('.testimonial-slider');
    if (slider && slider.children.length > 0) {
        const slides = Array.from(slider.children);
        const numOriginalSlides = slides.length;

        // Clone slides for seamless effect
        slides.forEach(slide => {
            const clone = slide.cloneNode(true);
            clone.setAttribute('aria-hidden', 'true');
            slider.appendChild(clone);
        });

        // Calculate total width and set animation
        // Ensure styles are loaded and item width is available
        // Use a small timeout or requestAnimationFrame if offsetWidth is 0 initially
        requestAnimationFrame(() => {
            if (numOriginalSlides > 0) {
                const firstSlide = slides[0];
                const slideStyle = getComputedStyle(firstSlide);
                const slideWidth = firstSlide.offsetWidth;
                const slideMarginRight = parseFloat(slideStyle.marginRight);
                const totalSlideWidthIncludingMargin = slideWidth + slideMarginRight;
                
                const totalWidthOriginalContent = totalSlideWidthIncludingMargin * numOriginalSlides;

                // Set the slider's width to accommodate all original and cloned slides
                // For the translateX(-50%) to work correctly with a continuous loop of original items,
                // the animation effectively moves the 'original content block'.
                slider.style.width = (totalWidthOriginalContent * 2) + 'px';
                
                // Set animation duration based on total width of original content to maintain consistent speed
                const speed = 40; // pixels per second, adjust for desired speed
                const animationDuration = (totalWidthOriginalContent / speed);
                
                // Apply the animation only if duration is positive
                if (animationDuration > 0) {
                    slider.style.animation = `continuous-slide ${animationDuration}s linear infinite`;
                } else {
                     // Fallback or no animation if calculation is off (e.g. no slides, no width)
                    console.warn("Testimonial slider animation duration is not positive. Animation not applied.");
                }
            }
        });
    } else if (slider) {
        // console.log("No testimonial slides found to animate.");
    }
});
document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.tab-button');
    const contents = document.querySelectorAll('.tab-content');
    const burger = document.getElementById('burger-menu');
    const mainNav = document.getElementById('main-nav');
    const header = document.querySelector('header'); // Get the header element

    // --- NEW: Sticky Header on Scroll ---
    const handleScroll = () => {
        if (window.scrollY > 20) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };

    // Attach the scroll event listener
    if (header) {
        window.addEventListener('scroll', handleScroll);
    }
    
    // --- Existing Tab functionality ---
    if (tabs.length > 0 && contents.length > 0) {
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetId = tab.getAttribute('data-tab');

                tabs.forEach(t => t.classList.remove('active'));
                contents.forEach(c => c.classList.remove('active'));

                tab.classList.add('active');
                const targetContent = document.getElementById(targetId);
                if (targetContent) {
                    targetContent.classList.add('active');
                }

                if (mainNav && mainNav.classList.contains('mobile-active')) {
                    mainNav.classList.remove('mobile-active');
                    if (burger) {
                        burger.classList.remove('open');
                        burger.setAttribute('aria-expanded', 'false');
                    }
                }
                 // Scroll to top of main content on tab click
                window.scrollTo({ top: header.offsetHeight, behavior: 'smooth' });
            });
        });
    }

    // --- Existing Burger menu toggle ---
    if (burger && mainNav) {
        burger.addEventListener('click', () => {
            mainNav.classList.toggle('mobile-active');
            burger.classList.toggle('open');
            const isExpanded = mainNav.classList.contains('mobile-active');
            burger.setAttribute('aria-expanded', isExpanded.toString());
        });
    }

    // --- Existing Testimonial Carousel Logic (Unchanged) ---
    const testimonialSection = document.getElementById('testimonials-home');
    if (testimonialSection) {
        const slider = testimonialSection.querySelector('.testimonial-slider');
        const prevButton = testimonialSection.querySelector('.carousel-button.prev');
        const nextButton = testimonialSection.querySelector('.carousel-button.next');
        
        let currentIndex = 0;
        let originalSlideNodes = [];
        let currentMode = null; 
        const mobileBreakpoint = 767;

        function storeOriginalSlides() {
            if (slider && slider.children.length > 0 && originalSlideNodes.length === 0) {
                Array.from(slider.children).forEach(child => {
                    const clone = child.cloneNode(true);
                    clone.style.width = '';
                    clone.style.flexShrink = '';
                    clone.style.marginRight = '';
                    originalSlideNodes.push(clone);
                });
            }
        }

        function resetSliderToOriginals() {
            if (!slider) return;
            slider.innerHTML = ''; 
            originalSlideNodes.forEach(node => {
                slider.appendChild(node.cloneNode(true));
            });
            slider.style.animation = '';
            slider.style.transform = '';
            slider.style.width = '';
            slider.style.transition = '';
        }
        
        function setupClickableCarousel() {
            if (!slider || !prevButton || !nextButton || originalSlideNodes.length === 0) {
                if(prevButton) prevButton.style.display = 'none';
                if(nextButton) nextButton.style.display = 'none';
                return;
            }
            
            resetSliderToOriginals();
            const slides = Array.from(slider.children);

            if (slides.length <= 1) {
                prevButton.style.display = 'none';
                nextButton.style.display = 'none';
                slider.style.width = '100%';
                if (slides.length === 1) slides[0].style.width = '100%';
                return;
            } else {
                prevButton.style.display = 'block';
                nextButton.style.display = 'block';
            }

            slider.style.display = 'flex';
            slider.style.overflow = 'visible';
            slider.style.transition = 'transform 0.4s ease-in-out';

            const containerWidth = slider.parentElement.offsetWidth;
            slider.style.width = `${slides.length * containerWidth}px`;
            
            slides.forEach(slide => {
                slide.style.width = `${containerWidth}px`;
                slide.style.flexShrink = '0';
                slide.style.marginRight = '0';
            });

            currentIndex = 0;
            updateClickableCarouselTransform(false);

            nextButton.onclick = () => {
                currentIndex = (currentIndex + 1) % slides.length;
                updateClickableCarouselTransform();
            };

            prevButton.onclick = () => {
                currentIndex = (currentIndex - 1 + slides.length) % slides.length;
                updateClickableCarouselTransform();
            };
        }

        function updateClickableCarouselTransform(animate = true) {
            if (!slider || originalSlideNodes.length === 0) return;
            const containerWidth = slider.parentElement.offsetWidth;
            const slides = Array.from(slider.children);
            slider.style.width = `${slides.length * containerWidth}px`;
            slides.forEach(slide => {
                slide.style.width = `${containerWidth}px`;
            });

            if (!animate) slider.style.transition = 'none';
            slider.style.transform = `translateX(-${currentIndex * containerWidth}px)`;
            if (!animate) {
                slider.offsetHeight; 
                slider.style.transition = 'transform 0.4s ease-in-out';
            }
        }

        function setupContinuousCarousel() {
            if (!slider || originalSlideNodes.length === 0) return;

            resetSliderToOriginals();
            const baseSlides = Array.from(slider.children);

            if (baseSlides.length === 0) return;

            if(prevButton) prevButton.style.display = 'none';
            if(nextButton) nextButton.style.display = 'none';
            
            baseSlides.forEach(slide => {
                slide.style.width = '';
                slide.style.flexShrink = '';
                slide.style.marginRight = '';
            });

            baseSlides.forEach(slide => {
                const clone = slide.cloneNode(true);
                clone.setAttribute('aria-hidden', 'true');
                clone.classList.add('testimonial-slide-clone');
                slider.appendChild(clone);
            });

            requestAnimationFrame(() => {
                if (baseSlides.length > 0) {
                    const firstSlide = baseSlides[0];
                    firstSlide.style.width = '';
                    
                    const slideStyle = getComputedStyle(firstSlide);
                    const itemWidth = firstSlide.offsetWidth; 
                    const itemMarginRight = parseFloat(slideStyle.marginRight) || 0;
                    
                    if (itemWidth === 0 && baseSlides.length > 0) {
                        return;
                    }

                    const totalItemWidthIncludingMargin = itemWidth + itemMarginRight;
                    const totalWidthOriginalContent = totalItemWidthIncludingMargin * baseSlides.length;

                    if (totalWidthOriginalContent > 0) {
                        slider.style.width = `${totalWidthOriginalContent * 2}px`;
                        const speed = 40;
                        const animationDuration = Math.max(1, totalWidthOriginalContent / speed);
                        
                        slider.style.animation = `continuous-slide ${animationDuration}s linear infinite`;
                    } else {
                        slider.style.animation = 'none';
                        slider.style.width = '100%';
                    }
                }
            });
        }

        function handleCarouselMode() {
            const newMode = window.innerWidth <= mobileBreakpoint ? 'mobile' : 'desktop';
            
            if (newMode !== currentMode) {
                currentMode = newMode;
                if (currentMode === 'mobile') {
                    setupClickableCarousel();
                } else {
                    setupContinuousCarousel();
                }
            } else {
                if (currentMode === 'mobile') {
                    updateClickableCarouselTransform(false);
                } else {
                    setupContinuousCarousel();
                }
            }
        }
        
        if (slider) {
             storeOriginalSlides();
             if (originalSlideNodes.length > 0) {
                handleCarouselMode();

                let resizeTimer;
                window.addEventListener('resize', () => {
                    clearTimeout(resizeTimer);
                    resizeTimer = setTimeout(handleCarouselMode, 250);
                });
             } else {
                if(prevButton) prevButton.style.display = 'none';
                if(nextButton) nextButton.style.display = 'none';
             }
        }
    }
});
document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.tab-button');
    const contents = document.querySelectorAll('.tab-content');
    const burger = document.getElementById('burger-menu');
    const mainNav = document.getElementById('main-nav');

    // Tab switching functionality
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
            });
        });
    }

    // Burger menu toggle
    if (burger && mainNav) {
        burger.addEventListener('click', () => {
            mainNav.classList.toggle('mobile-active');
            burger.classList.toggle('open');
            const isExpanded = mainNav.classList.contains('mobile-active');
            burger.setAttribute('aria-expanded', isExpanded.toString());
        });
    }

    // Testimonial Carousel Logic
    const testimonialSection = document.getElementById('testimonials-home');
    if (testimonialSection) {
        const slider = testimonialSection.querySelector('.testimonial-slider');
        const prevButton = testimonialSection.querySelector('.carousel-button.prev');
        const nextButton = testimonialSection.querySelector('.carousel-button.next');
        
        let currentIndex = 0;
        let originalSlideNodes = []; // To store clones of the original slide LI elements
        let currentMode = null; // 'desktop' or 'mobile'
        const mobileBreakpoint = 767; // Max width for mobile view

        function storeOriginalSlides() {
            if (slider && slider.children.length > 0 && originalSlideNodes.length === 0) {
                Array.from(slider.children).forEach(child => {
                    const clone = child.cloneNode(true);
                    // Remove any inline styles that might have been added by previous JS runs if HTML is static
                    clone.style.width = '';
                    clone.style.flexShrink = '';
                    clone.style.marginRight = '';
                    originalSlideNodes.push(clone);
                });
            }
        }

        function resetSliderToOriginals() {
            if (!slider) return;
            slider.innerHTML = ''; // Clear current slides (and clones)
            originalSlideNodes.forEach(node => {
                slider.appendChild(node.cloneNode(true)); // Add fresh copies of originals
            });
            slider.style.animation = ''; // Ensure no CSS animation persists
            slider.style.transform = ''; // Clear any JS transform
            slider.style.width = ''; // Clear inline width
            slider.style.transition = ''; // Clear JS transition
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
                slider.style.width = '100%'; // Ensure single slide takes up space
                if (slides.length === 1) slides[0].style.width = '100%'; // The single slide is full width
                return;
            } else {
                prevButton.style.display = 'block';
                nextButton.style.display = 'block';
            }

            slider.style.display = 'flex';
            slider.style.overflow = 'visible'; // Let parent container do the hiding
            slider.style.transition = 'transform 0.4s ease-in-out';

            const containerWidth = slider.parentElement.offsetWidth;
            slider.style.width = `${slides.length * containerWidth}px`;
            
            slides.forEach(slide => {
                slide.style.width = `${containerWidth}px`;
                slide.style.flexShrink = '0';
                slide.style.marginRight = '0'; // Ensure no extra spacing
            });

            currentIndex = 0;
            updateClickableCarouselTransform(false); // No animation on initial setup

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
            const containerWidth = slider.parentElement.offsetWidth; // Recalculate in case of resize
             // Update slide widths if container width changed
            const slides = Array.from(slider.children);
            slider.style.width = `${slides.length * containerWidth}px`;
            slides.forEach(slide => {
                slide.style.width = `${containerWidth}px`;
            });

            if (!animate) slider.style.transition = 'none'; // Disable animation for instant set
            slider.style.transform = `translateX(-${currentIndex * containerWidth}px)`;
            if (!animate) {
                // Force reflow to apply transform immediately then re-enable animation
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
            
            // Restore original slide styling (width, margin) for continuous scroll from CSS
            baseSlides.forEach(slide => {
                slide.style.width = ''; // Let CSS rule for .testimonial-slider li apply (e.g., 300px)
                slide.style.flexShrink = '';
                slide.style.marginRight = ''; // Let CSS rule apply
            });

            // Clone slides for seamless effect
            baseSlides.forEach(slide => {
                const clone = slide.cloneNode(true);
                clone.setAttribute('aria-hidden', 'true');
                clone.classList.add('testimonial-slide-clone');
                slider.appendChild(clone);
            });

            requestAnimationFrame(() => {
                if (baseSlides.length > 0) {
                    const firstSlide = baseSlides[0];
                    // Ensure CSS has applied for desktop mode before measuring
                    firstSlide.style.width = ''; // Clears inline style, allowing CSS to dictate width
                    
                    const slideStyle = getComputedStyle(firstSlide);
                    const itemWidth = firstSlide.offsetWidth; 
                    const itemMarginRight = parseFloat(slideStyle.marginRight) || 0;
                    
                    if (itemWidth === 0 && baseSlides.length > 0) {
                        // Fallback or warning if itemWidth is not correctly calculated
                        // console.warn("Item width for continuous scroll is 0. Animation might not work.");
                        return;
                    }

                    const totalItemWidthIncludingMargin = itemWidth + itemMarginRight;
                    const totalWidthOriginalContent = totalItemWidthIncludingMargin * baseSlides.length;

                    if (totalWidthOriginalContent > 0) {
                        slider.style.width = `${totalWidthOriginalContent * 2}px`;
                        const speed = 40; // pixels per second
                        const animationDuration = Math.max(1, totalWidthOriginalContent / speed); // Ensure duration is positive
                        
                        slider.style.animation = `continuous-slide ${animationDuration}s linear infinite`;
                    } else {
                        slider.style.animation = 'none';
                        slider.style.width = '100%'; // Or 'auto'
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
            } else { // Mode hasn't changed, but resize happened
                if (currentMode === 'mobile') {
                    // Re-calculate for clickable if container size changed
                    updateClickableCarouselTransform(false); // Update positions without animation
                } else {
                    // Re-calculate for continuous if container size changed (animation speed might need update)
                    setupContinuousCarousel();
                }
            }
        }
        
        if (slider) { // Ensure slider element exists
             storeOriginalSlides(); // Store initial HTML of slides
             if (originalSlideNodes.length > 0) {
                handleCarouselMode(); // Determine mode and set up

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
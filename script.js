document.addEventListener('DOMContentLoaded', () => {
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

    // Promo Bar
    const promoBar = document.getElementById('promo-bar');
    const closeBtn = document.getElementById('close-promo');

    if (promoBar && closeBtn) {
        if (localStorage.getItem('promoClosed') !== 'true') {
            promoBar.classList.add('enabled');
        }

        closeBtn.addEventListener('click', () => {
            promoBar.classList.remove('enabled');
            localStorage.setItem('promoClosed', 'true');
        });
    }

    // Attach the scroll event listener (now independent of the promo bar)
    if (header) {
        window.addEventListener('scroll', handleScroll);
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
// --- NEW: Asynchronous Form Submission Logic ---
    const handleFormSubmit = (event) => {
        event.preventDefault(); // Prevent the default form submission (page redirect)
        const form = event.target;
        const formData = new FormData(form);
        const submitButton = form.querySelector('button[type="submit"]');

        // Disable button and show a "sending" state
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = 'Submitting...';
        }

        fetch(form.action, {
            method: form.method,
            body: formData,
            headers: {
                'Accept': 'application/json' // Requesting a JSON response if available
            }
        })
        .then(response => {
            if (response.ok) {
                // On success, create and display the success message
                const successMessageContainer = document.createElement('div');
                successMessageContainer.className = 'form-submission-message';
                successMessageContainer.innerHTML = `
                    <h3>Thank You!</h3>
                    <p>Your enquiry has been sent successfully. I will get back to you shortly.</p>
                `;
                // Replace the form's parent section with the success message
                const formSection = form.closest('section');
                if (formSection) {
                    formSection.parentNode.replaceChild(successMessageContainer, formSection);
                } else {
                    // Fallback if the form is not in a section
                    form.parentNode.replaceChild(successMessageContainer, form);
                }
                // >>> ADD THE FOLLOWING CODE HERE <<<
                // This pushes the custom event to the dataLayer for GTM to pick up
                if (window.dataLayer) {
                    window.dataLayer.push({
                        'event': 'form_submit_success',
                        'form_name': 'enquiry_contact_form', // Custom parameter for GTM
                        // You can add more data here if your GTM tags need it, e.g.:
                        // 'email_address': data.email,
                        // 'first_name': data.firstName,
                        // 'last_name': data.lastName
                    });
                    console.log('dataLayer event: form_submit_success pushed.');
                } else {
                    console.warn('dataLayer not found. Event not pushed.');
                }
                // >>> END OF CODE TO ADD <<<

            } else {
                // On failure, alert the user and re-enable the form
                response.json().then(data => {
                    console.error("Form submission error:", data);
                    alert('Sorry, there was an error submitting your form. Please try again or contact me directly.');
                    if (submitButton) {
                        submitButton.disabled = false;
                        submitButton.textContent = 'Submit Enquiry';
                    }
                });
            }
        })
        .catch(error => {
            // Handle network errors
            console.error('Network error:', error);
            alert('A network error occurred. Please check your connection and try again.');
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = 'Submit Enquiry';
            }
        });
    };

    // Attach the submit event listener to all forms on the page that have the class 'enquiry-form'
    const enquiryForms = document.querySelectorAll('.enquiry-form');
    if (enquiryForms.length > 0) {
        enquiryForms.forEach(form => {
            form.addEventListener('submit', handleFormSubmit);
        });
    }
});

// --- FAQ Dropdown Logic ---
const faqQuestions = document.querySelectorAll('.faq-question');

faqQuestions.forEach((button) => {
  button.addEventListener('click', () => {
    const expanded = button.getAttribute('aria-expanded') === 'true';
    // Close all others (optional, accordion style)
    faqQuestions.forEach(btn => {
      btn.setAttribute('aria-expanded', 'false');
      btn.nextElementSibling.style.maxHeight = null;
      btn.querySelector('.faq-icon').textContent = '+';
    });

    // Toggle clicked one
    if (!expanded) {
      button.setAttribute('aria-expanded', 'true');
      const answer = button.nextElementSibling;
      answer.style.maxHeight = answer.scrollHeight + 'px';
      button.querySelector('.faq-icon').textContent = '−';
    }
  });
});

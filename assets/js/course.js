/*
 * Initialize spliders
 */

const course = document.querySelector('.js-course');  
if (course) {
  const text = course.querySelector('.js-course-text');
  const img = course.querySelector('.js-course-img');
  const paginationContainer = course.querySelector('.js-course-page');
  const prevBtn = course.querySelector('.splide__arrow--prev');
  const nextBtn = course.querySelector('.splide__arrow--next');

  if (text && img) {
    const textSplider = new Splide(text, {
      type: 'fade',
      perPage: 1,
      focus: 'center',
      rewind: true,
      arrows: false, 
      classes: {
        arrow: 'splide__arrow course-splide__arrow',
        prev: 'splide__arrow--prev course-splide__arrow--prev',
        next: 'splide__arrow--next course-splide__arrow--next',
        pagination: 'splide__pagination course-splide__text-pagination',
        page : 'splide__pagination__page course-splide__text-page'
      }
    });

    const imgSplider = new Splide(img, {
      perPage: 2,
      pagination: false,
      arrows: false,
      isNavigation: true,
      gap: 10,
      omitEnd: true,
    });

    textSplider.on('mounted', function () {
      const pagination = text.querySelector('.splide__pagination');
      if (pagination) {
        paginationContainer.appendChild(pagination);
      }
    });
    
    textSplider.sync(imgSplider);
    textSplider.mount();
    imgSplider.mount();

    prevBtn.addEventListener('click', () => textSplider.go('<'));
    nextBtn.addEventListener('click', () => textSplider.go('>'));
  }
}

const layout = document.querySelector('.js-course-layout');  
if (layout) {
  const con = layout.querySelector('.js-course-con');
  const nav = layout.querySelector('.js-course-nav');

  if (con && nav) {
    const navItems = nav.querySelectorAll('.splide__slide');
    const navCount = navItems.length;
    const navHeight = navItems[0].offsetHeight;
    const height = navHeight * navCount;

    const conSplider = new Splide(con, {
      type: 'fade',
      perPage: 1,
      focus: 'center',
      rewind: true,
      arrows: false,
      pagination: false,
      drag: false,
    });

    const navSplider = new Splide(nav, {
      direction: 'ttb',
      height: height,
      perPage: navCount,
      pagination: false,
      arrows: false,
      isNavigation: true,
      gap: 0,
      drag: false,
    });

    conSplider.on('mounted', function () {
      const pagination = con.querySelector('.splide__pagination');
      if (pagination) {
        paginationContainer.appendChild(pagination);
      }
    });
    
    conSplider.sync(navSplider);
    conSplider.mount();
    navSplider.mount();
  }
}

/*
 * Video interactive modal
*/
const units = document.querySelectorAll('.js-course-unit');

if (units.length > 0) {
  units.forEach(unit => {
    const videoEl = unit.querySelector('.js-course-vid');
    const modal = unit.querySelector('.js-course-mod');
    const blocks = modal.querySelectorAll('.js-course-mod-block');

    const player = videojs(videoEl, {
      controlBar: {
        fullscreenToggle: false,
        pictureInPictureToggle: false
      }
    });

    player.ready(() => {
      const track = player.addTextTrack('metadata', 'Cues', 'en');
      track.mode = 'hidden';

      const cueMap = Array.from(blocks).map((block, index) => ({
        time: parseFloat(block.dataset.cue),
        index
      }));

      cueMap.forEach(({ time, index }) => {
        track.addCue(new VTTCue(time, time + 0.5, String(index)));
      });

      track.addEventListener('cuechange', () => {
        const cue = track.activeCues[0];
        if (!cue) return;

        const index = parseInt(cue.text, 10);
        const block = blocks[index];

        blocks.forEach(b => b.classList.remove('show'));
        block.classList.add('show');
        modal.classList.remove('hide');
        player.pause();

        bindAnswerButtons(block, index);
      });

      player.on('loadedmetadata', () => {
        const progressEl = player.el().querySelector('.vjs-progress-holder');
        if (!progressEl) return;

        cueMap.forEach(({ time }, i) => {
          const marker = document.createElement('div');
          marker.className = 'vjs-custom-marker';
          marker.style.left = `${(time / player.duration()) * 100}%`;
          marker.title = `Question ${i + 1}`;
          marker.onclick = () => player.currentTime(time);
          progressEl.appendChild(marker);
        });
      });

      function bindAnswerButtons(block, index) {
        const buttons = block.querySelectorAll('button');
        const target = block.getAttribute('data-target');

        buttons.forEach(btn => {
          btn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();

            const isCorrect = btn.dataset.correct === 'true';

            if (isCorrect) {
              modal.classList.add('hide');
              blocks.forEach(b => b.classList.remove('show'));
              player.play();

              const key = unit.querySelector('#'+target);
              if (key) {
                key.classList.add('active');
                const info = key.querySelector('.course-vid__pts-info');
                const wrap = key.querySelector('.course-vid__pts-wrap');
                if (info && wrap) {
                  info.style.maxHeight = `${wrap.offsetHeight + 15}px`;
                }
              }
            } else {
              btn.classList.add('incorrect');
              btn.disabled = true;
            }
          };
        });
      }
    });
  });
}

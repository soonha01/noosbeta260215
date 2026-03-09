import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SolarExplorer.css';
import SpaceTravel from './SpaceTravel';

const ENTRY_BURST_DURATION_MS = 2100;
const BUTTON_APPEAR_DELAY_MS = 4000;
const PLANET_NAME_BY_ID = {
  mercury: 'Mercury',
  venus: 'Venus',
  earth: 'Earth',
  mars: 'Mars',
  jupiter: 'Jupiter',
  saturn: 'Saturn',
  uranus: 'Uranus',
  neptune: 'Neptune',
  pluto: 'Pluto'
};
const MODAL_BACKDROP_BASE_STYLE = Object.freeze({
  position: 'fixed',
  inset: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: '#000000',
  zIndex: 9998,
  transition: 'opacity 1.35s ease',
});

const MODAL_CONTAINER_STYLE = Object.freeze({
  position: 'fixed',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999,
});

const MODAL_CARD_BASE_STYLE = Object.freeze({
  position: 'relative',
  width: '90%',
  maxWidth: '920px',
  height: '86vh',
  maxHeight: '720px',
  backgroundColor: 'rgba(0, 0, 0, 0.96)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '10px',
  overflow: 'hidden',
  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
  transition: 'opacity 1.35s ease, transform 1.35s ease, border-color 1.35s ease, box-shadow 1.35s ease',
});

const MODAL_CLOSE_BUTTON_STYLE = Object.freeze({
  position: 'absolute',
  top: '15px',
  right: '15px',
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  border: 'none',
  backgroundColor: 'rgba(255, 255, 255, 0.08)',
  color: '#f2f2f2',
  fontSize: '24px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 10000,
  transition: 'all 0.3s ease',
});

const SolarExplorer = ({ onPlanetSelect }) => {
  const navigate = useNavigate();
  const [showButton, setShowButton] = useState(false);
  const [selectedPlanet, setSelectedPlanet] = useState('Mars');
  const [showModal, setShowModal] = useState(false);
  const [modalPlanet, setModalPlanet] = useState(null);
  const [isModalExiting, setIsModalExiting] = useState(false);
  const [isPageExiting, setIsPageExiting] = useState(false);
  const [isEntryBurst, setIsEntryBurst] = useState(true);
  const [launchButtonTop, setLaunchButtonTop] = useState(null);
  const rootRef = useRef(null);
  const buttonRevealTimeoutRef = useRef(null);
  const entryBurstTimeoutRef = useRef(null);

  const scheduleButtonReveal = useCallback((delayMs = BUTTON_APPEAR_DELAY_MS) => {
    if (buttonRevealTimeoutRef.current) {
      clearTimeout(buttonRevealTimeoutRef.current);
    }

    setShowButton(false);
    buttonRevealTimeoutRef.current = setTimeout(() => {
      setShowButton(true);
      buttonRevealTimeoutRef.current = null;
    }, delayMs);
  }, []);

  const startSpaceTravel = useCallback((planet) => {
    if (typeof onPlanetSelect === 'function') {
      onPlanetSelect(planet);
    }

    try {
      setIsPageExiting(false);
      setIsModalExiting(false);
      setModalPlanet(planet);
      setShowModal(true);
    } catch (error) {
      console.error('Error in startSpaceTravel:', error);
      alert('오류가 발생했습니다: ' + error.message);
    }
  }, [onPlanetSelect]);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setModalPlanet(null);
    setIsModalExiting(false);
    setIsPageExiting(false);
  }, []);

  const handleEntryComplete = useCallback(({ planet, seat }) => {
    setShowModal(false);
    setModalPlanet(null);
    navigate(`/space-travel?planet=${encodeURIComponent(planet)}`, {
      state: { planet, seat },
    });
  }, [navigate]);

  const handleEntryFadeOutStart = useCallback(() => {
    setIsModalExiting(true);
    setIsPageExiting(true);
  }, []);

  const handleBackToMain = useCallback(() => {
    const basename = window.location.pathname.startsWith('/figadev') ? '/figadev' : '';
    window.location.href = `${basename}/?main=true`;
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const handlePlanetChange = (event) => {
      const target = event.target;
      if (!target || target.name !== 'planet') return;

      const planetId = target.id;
      if (planetId) {
        const nextPlanet = PLANET_NAME_BY_ID[planetId];
        if (nextPlanet) {
          setSelectedPlanet(nextPlanet);
        }
        scheduleButtonReveal();
      }
    };

    root.addEventListener('change', handlePlanetChange);
    scheduleButtonReveal();

    return () => {
      root.removeEventListener('change', handlePlanetChange);
      if (buttonRevealTimeoutRef.current) {
        clearTimeout(buttonRevealTimeoutRef.current);
        buttonRevealTimeoutRef.current = null;
      }
    };
  }, [scheduleButtonReveal]);

  useEffect(() => {
    entryBurstTimeoutRef.current = setTimeout(() => {
      setIsEntryBurst(false);
      entryBurstTimeoutRef.current = null;
    }, ENTRY_BURST_DURATION_MS);

    return () => {
      if (entryBurstTimeoutRef.current) {
        clearTimeout(entryBurstTimeoutRef.current);
        entryBurstTimeoutRef.current = null;
      }
    };
  }, []);

  const selectedPlanetSlug = selectedPlanet.toLowerCase();

  const updateLaunchButtonPosition = useCallback(() => {
    const root = rootRef.current;
    if (!root) return;

    const checkedPlanetId = root.querySelector('input[name="planet"]:checked')?.id;
    const activePlanetSlug = checkedPlanetId || selectedPlanetSlug;
    const selectedDescription = root.querySelector(
      `.solar .solar_systm .planet_description.${activePlanetSlug}`
    );

    if (!selectedDescription) return;

    const descriptionRect = selectedDescription.getBoundingClientRect();
    const nextTop = Math.round(descriptionRect.bottom + 16);

    setLaunchButtonTop((prev) => (prev === nextTop ? prev : nextTop));
  }, [selectedPlanetSlug]);

  useEffect(() => {
    let rafId = 0;
    let settleTimeoutId = 0;
    let intervalId = 0;
    let resizeObserver = null;

    const refreshPosition = () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      rafId = requestAnimationFrame(() => {
        updateLaunchButtonPosition();
      });
    };

    refreshPosition();
    settleTimeoutId = window.setTimeout(refreshPosition, 480);
    intervalId = window.setInterval(refreshPosition, 140);

    window.addEventListener('resize', refreshPosition);

    if (window.ResizeObserver && rootRef.current) {
      resizeObserver = new ResizeObserver(refreshPosition);
      resizeObserver.observe(rootRef.current);
    }

    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      if (settleTimeoutId) {
        window.clearTimeout(settleTimeoutId);
      }
      if (intervalId) {
        window.clearInterval(intervalId);
      }
      window.removeEventListener('resize', refreshPosition);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [isEntryBurst, selectedPlanetSlug, showButton, updateLaunchButtonPosition]);

  return (
    <div
      ref={rootRef}
      className={`solar-explorer-body ${isEntryBurst ? 'is-entry-burst' : ''} ${isPageExiting ? 'is-page-exiting' : ''}`}
    >
      <button
        type='button'
        className='main-return-button'
        onClick={handleBackToMain}
        aria-label='메인 페이지로 돌아가기'
      >
        <span className='main-return-button__icon' aria-hidden='true'>⌂</span>
        <span className='main-return-button__label'>홈으로 돌아가기</span>
      </button>

      <h1 className='logo'>
        Project: NOOS
        <span>Choose Our planet. And Explore.</span>
        <span className='korean-subtitle'>왼쪽에 있는 행성을 클릭하세요. 그리고 탐험하세요.</span>
      </h1>

      {/* Radio Inputs - 역순으로 배치 (Pluto부터 Mercury까지) */}
      <input className='planet9' id='pluto' type='radio' name='planet' />
      <label className='menu pluto' htmlFor='pluto'>
        <div className='preview'></div>
        <div className='info'>
          <h2>
            <div className='pip'></div>
            Pluto
          </h2>
          <h3>39.5 AU</h3>
        </div>
      </label>

      <input className='planet8' id='neptune' type='radio' name='planet' />
      <label className='menu neptune' htmlFor='neptune'>
        <div className='preview'></div>
        <div className='info'>
          <h2>
            <div className='pip'></div>
            Neptune
          </h2>
          <h3>30.06 AU</h3>
        </div>
      </label>

      <input className='planet7' id='uranus' type='radio' name='planet' />
      <label className='menu uranus' htmlFor='uranus'>
        <div className='preview'></div>
        <div className='info'>
          <h2>
            <div className='pip'></div>
            Uranus
          </h2>
          <h3>19.18 AU</h3>
        </div>
      </label>

      <input className='planet6' id='saturn' type='radio' name='planet' />
      <label className='menu saturn' htmlFor='saturn'>
        <div className='preview'></div>
        <div className='info'>
          <h2>
            <div className='pip'></div>
            Saturn
          </h2>
          <h3>9.539 AU</h3>
        </div>
      </label>

      <input className='planet5' id='jupiter' type='radio' name='planet' />
      <label className='jupiter menu' htmlFor='jupiter'>
        <div className='preview'></div>
        <div className='info'>
          <h2>
            <div className='pip'></div>
            Jupiter
          </h2>
          <h3>5.203 AU</h3>
        </div>
      </label>

      <input className='planet4' id='mars' type='radio' name='planet' defaultChecked />
      <label className='mars menu' htmlFor='mars'>
        <div className='preview'></div>
        <div className='info'>
          <h2>
            <div className='pip'></div>
            Mars
          </h2>
          <h3>1.524 AU</h3>
        </div>
      </label>

      <input className='planet3' id='earth' type='radio' name='planet' />
      <label className='earth menu' htmlFor='earth'>
        <div className='preview'></div>
        <div className='info'>
          <h2>
            <div className='pip'></div>
            Earth
          </h2>
          <h3>1 AU</h3>
        </div>
      </label>

      <input className='planet2' id='venus' type='radio' name='planet' />
      <label className='menu venus' htmlFor='venus'>
        <div className='preview'></div>
        <div className='info'>
          <h2>
            <div className='pip'></div>
            Venus
          </h2>
          <h3>0.723 AU</h3>
        </div>
      </label>

      <input className='planet1' id='mercury' type='radio' name='planet' />
      <label className='menu mercury' htmlFor='mercury'>
        <div className='preview'></div>
        <div className='info'>
          <h2>
            <div className='pip'></div>
            Mercury
          </h2>
          <h3>0.39 AU</h3>
        </div>
      </label>

      {/* Solar System - 3D 행성 표시 */}
      <div className='solar'>
        {/* Mercury */}
        <div className='solar_systm'>
          <div className='planet mercury'>
            <div className='planet_description mercury'>
              <h2>Planet</h2>
              <h1>Mercury</h1>
              <p>태양과 가장 가까운, 태양을 가장 빠르게 도는 행성. 하루를 점화하는 번개같은 집중을 상징하며, 아이디어와 실행을 한순간에 불꽃처럼 만들 수 있도록 도와줍니다.</p>
            </div>
            <div className='overlay'></div>
          </div>
        </div>

        {/* Venus */}
        <div className='solar_systm'>
          <div className='planet venus'>
            <div className='planet_description venus'>
              <h2>Planet</h2>
              <h1>Venus</h1>
              <p>구름에 가려진 감각의 행성. 온화한 비과 미묘한 대기가 깃든 곳. 영감이 새벽처럼 깨어나는 창조의 정원. 따뜻한 조명과 부드러운 음악을 당신에게 선사합니다.</p>
            </div>
            <div className='overlay'></div>
          </div>
        </div>

        {/* Earth */}
        <div className='solar_systm'>
          <div className='planet earth'>
            <div className='moon moon'>
              <h3>Moon</h3>
              <h2>Moon</h2>
            </div>
            <div className='m trajectory'></div>
            <div className='planet_description earth'>
              <h2>Planet</h2>
              <h1>Earth</h1>
              <p>균형과 현실의 중심. 푸른 바다와 초록 숲이 깃든 행성. 일과 학습의 기본 궤도, 차분한 안정속에서 집중을 할 수 있도록 도와줍니다.</p>
            </div>
            <div className='overlay'></div>
          </div>
        </div>

        {/* Mars */}
        <div className='solar_systm'>
          <div className='planet mars'>
            <div className='deimos moon'>
              <h3>Moon</h3>
              <h2>Deimos</h2>
            </div>
            <div className='d trajectory'></div>
            <div className='moon phoebos'>
              <h3>Moon</h3>
              <h2>Phoebos</h2>
            </div>
            <div className='p trajectory'></div>
            <div className='planet_description mars'>
              <h2>Planet</h2>
              <h1>Mars</h1>
              <p>붉은 도전의 행성. 모래 폭풍과 강렬한 바람이 부는 세계. 새로운 시도를 향해 돌파하는 에너지. 결단과 실행이 필요한 순간. 이곳으로 떠나보세요.</p>
            </div>
            <div className='overlay'></div>
          </div>
        </div>

        {/* Jupiter */}
        <div className='solar_systm'>
          <div className='planet jupiter'>
            <div className='lo moon'>
              <h3>Moon</h3>
              <h2>Io</h2>
            </div>
            <div className='europa moon'>
              <h3>Moon</h3>
              <h2>Europa</h2>
            </div>
            <div className='ganymede moon'>
              <h3>Moon</h3>
              <h2>Ganymede</h2>
            </div>
            <div className='lop trajectory'></div>
            <div className='eu trajectory'></div>
            <div className='ga trajectory'></div>
            <div className='planet_description jupiter'>
              <h2>Planet</h2>
              <h1>Jupiter</h1>
              <p>은하계 중 가장 큰 행성. 태양계의 모든 것을 대표하는 위대하고도 거대한 힘. 큰 결정과 팀을 이끄는 카리스마. 중대한 선택과 협업이 필요한 환경일때, 이 행성은 적합합니다.</p>
            </div>
            <div className='overlay'></div>
          </div>
        </div>

        {/* Saturn */}
        <div className='solar_systm'>
          <div className='planet saturn'>
            <div className='moon titan'>
              <h3>Moon</h3>
              <h2>Titan</h2>
            </div>
            <div className='dione moon'>
              <h3>Moon</h3>
              <h2>Dione</h2>
            </div>
            <div className='enceladus moon'>
              <h3>Moon</h3>
              <h2>Enceladus</h2>
            </div>
            <div className='ti trajectory'></div>
            <div className='di trajectory'></div>
            <div className='enc trajectory'></div>
            <div className='planet_description saturn'>
              <h2>Planet</h2>
              <h1>Saturn</h1>
              <p>고리위의 사색가. 영겁의 시간 속에서 고리를 두른 현자의 행성. 깊은 전략과 철학적 통찰, 연구의 아이디어를 제공합니다. 연구·기획·긴 사유의 시간을 위한 공간입니다.</p>
            </div>
            <div className='overlay'></div>
          </div>
        </div>

        {/* Uranus */}
        <div className='solar_systm'>
          <div className='planet uranus'>
            <div className='miranda moon'>
              <h3>Moon</h3>
              <h2>Miranda</h2>
            </div>
            <div className='ariel moon'>
              <h3>Moon</h3>
              <h2>Ariel</h2>
            </div>
            <div className='moon umbriel'>
              <h3>Moon</h3>
              <h2>Umbriel</h2>
            </div>
            <div className='mir trajectory'></div>
            <div className='ari trajectory'></div>
            <div className='trajectory umb'></div>
            <div className='planet_description uranus'>
              <h2>Planet</h2>
              <h1>Uranus</h1>
              <p>가장 첫번째로 과학자들에게 발견된 행성이자 기울어진 축을 가진 독특한 행성. 새로운 패러다임과 틀을 깨는 창조적 아이디어를 위한 무대입니다.</p>
            </div>
            <div className='overlay'></div>
          </div>
        </div>

        {/* Neptune */}
        <div className='solar_systm'>
          <div className='planet neptune'>
            <div className='moon triton'>
              <h3>Moon</h3>
              <h2>Triton</h2>
            </div>
            <div className='moon proteus'>
              <h3>Moon</h3>
              <h2>Proteus</h2>
            </div>
            <div className='moon nereid'>
              <h3>Moon</h3>
              <h2>Nereid</h2>
            </div>
            <div className='trajectory tri'></div>
            <div className='pro trajectory'></div>
            <div className='ner trajectory'></div>
            <div className='planet_description neptune'>
              <h2>Planet</h2>
              <h1>Neptune</h1>
              <p>깊은 푸른색의 대기와 강력한 폭풍을 가진 신비로운 행성. 푸른 빛 속으로 모든 소음이 사라지는 곳. 코딩·집중 독서·논문 작업 등 완전한 딥워크를 이끌어 줍니다.</p>
            </div>
            <div className='overlay'></div>
          </div>
        </div>

        {/* Pluto */}
        <div className='solar_systm'>
          <div className='planet pluto'>
            <div className='planet_description pluto'>
              <h2>Dwarf planet</h2>
              <h1>Pluto</h1>
              <p>우주의 끝, 내면의 쉼. 태양계의 가장 먼 곳, 조용한 침묵의 행성. 하루를 마무리하고 마음을 비우는 공간. 명상과 회복, 수면을 위한 마지막 정거장.</p>
            </div>
            <div className='overlay'></div>
          </div>
        </div>
      </div>

      <div
        className={`planet-action-global ${selectedPlanetSlug} ${showButton ? 'is-visible' : ''}`}
        style={launchButtonTop !== null ? { top: `${launchButtonTop}px` } : undefined}
      >
        <button type='button' className='planet-desc-launch' onClick={() => startSpaceTravel(selectedPlanet)}>
          이 행성으로 떠나기
        </button>
      </div>

      {/* Read More Panels - 원본 HTML에 있는 패널들 (옵션) */}
      {/* Mercury Panel */}
      <input className='read' id='readMercury' type='radio' name='mercuryRead' />
      <label className='closeBig' htmlFor='closeMercury'></label>
      <input className='read' id='closeMercury' type='radio' name='mercuryRead' />
      <div className='panel'>
        <h1>Mercury</h1>
        <p>Mercury is the closest planet to the sun. As such, it circles the sun faster than all the other planets, which is why Romans named it after their swift-footed messenger god.</p>
        <p>The Sumerians also knew of Mercury since at least 5,000 years ago. It was often associated with Nabu, the god of writing. Mercury was also given separate names for its appearance as both a morning star and as an evening star. Greek astronomers knew, however, that the two names referred to the same body, and Heraclitus, around 500 B.C., correctly thought that both Mercury and Venus orbited the sun, not Earth.</p>
        <img src='https://i2.wp.com/www.astronomytrek.com/wp-content/uploads/2012/11/mercury-1.jpg?fit=678%2C381&ssl=1' alt="Mercury" />
        <h2>A year on Mercury is just 88 days long.</h2>
        <p>One solar day (the time from noon to noon on the planet's surface) on Mercury lasts the equivalent of 176 Earth days while the sidereal day (the time for 1 rotation in relation to a fixed point) lasts 59 Earth days. Mercury is nearly tidally locked to the Sun and over time this has slowed the rotation of the planet to almost match its orbit around the Sun. Mercury also has the highest orbital eccentricity of all the planets with its distance from the Sun ranging from 46 to 70 million km.</p>
        <h2>Mercury is the smallest planet in the Solar System.</h2>
        <p>One of five planets visible with the naked eye a, Mercury is just 4,879 Kilometres across its equator, compared with 12,742 Kilometres for the Earth.</p>
        <h2>Mercury is the second densest planet.</h2>
        <p>Even though the planet is small, Mercury is very dense. Each cubic centimetre has a density of 5.4 grams, with only the Earth having a higher density. This is largely due to Mercury being composed mainly of heavy metals and rock.</p>
        <h2>Mercury has wrinkles.</h2>
        <p>As the iron core of the planet cooled and contracted, the surface of the planet became wrinkled. Scientist have named these wrinkles, Lobate Scarps. These Scarps can be up to a mile high and hundreds of miles long.</p>
        <br />
      </div>

      {/* 나머지 행성 패널들도 필요하면 추가 가능 (Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto) */}
      {/* 원본 HTML에 있는 패널 내용을 그대로 가져와서 사용할 수 있습니다 */}

      {showModal && (
        <>
          <div style={{
            ...MODAL_BACKDROP_BASE_STYLE,
            opacity: isModalExiting ? 0 : 1,
          }} />

          <div style={MODAL_CONTAINER_STYLE}>
            <div style={{
              ...MODAL_CARD_BASE_STYLE,
              opacity: isModalExiting ? 0 : 1,
              transform: isModalExiting ? 'translateY(10px) scale(0.992)' : 'translateY(0) scale(1)',
              animation: isModalExiting ? 'none' : 'slideUp 0.4s ease-out',
            }}>
              <button
                onClick={closeModal}
                className='solar-entry-modal-close'
                style={MODAL_CLOSE_BUTTON_STYLE}
              >
                ✕
              </button>

              <div style={{ width: '100%', height: '100%', overflow: 'auto' }}>
                <SpaceTravel
                  planet={modalPlanet}
                  onBack={closeModal}
                  entryOnly
                  onEntryFadeOutStart={handleEntryFadeOutStart}
                  onEntryComplete={handleEntryComplete}
                />
              </div>
            </div>
          </div>
        </>
      )}

    </div>
  );
};

export default React.memo(SolarExplorer);

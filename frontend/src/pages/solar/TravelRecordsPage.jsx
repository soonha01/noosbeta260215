import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock, ChevronRight, Map, Star, Timer } from 'lucide-react';
import styled from 'styled-components';
import {
  PLANET_MEDIA,
  TRAVEL_RECORDS_STORAGE_KEY,
} from '../../components/features/solar/travel/constants';
import { loadStorageJSON } from '../../components/features/solar/travel/storage';

const Page = styled.main`
  min-height: 100vh;
  box-sizing: border-box;
  padding: clamp(0.75rem, 2vw, 1.5rem);
  color: #fff;
  background:
    radial-gradient(circle at 12% 6%, rgba(127, 227, 255, 0.15), transparent 28%),
    radial-gradient(circle at 88% 12%, rgba(255, 209, 102, 0.13), transparent 28%),
    linear-gradient(120deg, rgba(0, 0, 0, 0.95), rgba(10, 12, 18, 0.9)),
    #020308;
  font-family: 'Pretendard Variable', 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
`;

const Shell = styled.div`
  width: min(100%, 1320px);
  margin: 0 auto;
  display: grid;
  gap: 0.75rem;
`;

const Header = styled.header`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 0.62rem;
  align-items: end;

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
    align-items: start;
  }
`;

const TitleBlock = styled.div`
  display: grid;
  gap: 0.28rem;
`;

const Kicker = styled.p`
  margin: 0;
  color: rgba(255, 255, 255, 0.56);
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.16em;
  text-transform: uppercase;
`;

const Title = styled.h1`
  margin: 0;
  font-size: clamp(34px, 6vw, 66px);
  line-height: 0.95;
  font-weight: 800;
  letter-spacing: 0;
`;

const NavActions = styled.nav`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.46rem;

  @media (max-width: 560px) {
    justify-content: flex-start;
  }
`;

const NavLink = styled(Link)`
  min-height: 38px;
  padding: 0 0.82rem;
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  font-size: 12px;
  font-weight: 850;
  backdrop-filter: blur(14px);
`;

const Overview = styled.section`
  min-height: 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.62rem;
  align-items: stretch;
  justify-content: stretch;

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

const Stat = styled.div`
  min-height: 62px;
  padding: 0.62rem 0.74rem;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 8px;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.095), rgba(255, 255, 255, 0.035)),
    rgba(0, 0, 0, 0.28);
  display: grid;
  align-content: space-between;
  gap: 0.45rem;
`;

const StatLabel = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.38rem;
  color: rgba(255, 255, 255, 0.58);
  font-size: 11px;
  font-weight: 900;
  text-transform: uppercase;
`;

const StatValue = styled.strong`
  color: #fff;
  font-size: clamp(18px, 2.6vw, 26px);
  line-height: 1;
`;

const RecordGrid = styled.section`
  min-height: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  gap: 0.75rem;
  align-items: stretch;
  justify-content: stretch;

  @media (max-width: 420px) {
    grid-template-columns: 1fr;
  }
`;

const RecordCard = styled(Link)`
  min-height: 216px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 8px;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.035)),
    rgba(0, 0, 0, 0.34);
  color: inherit;
  text-decoration: none;
  overflow: hidden;
  display: grid;
  grid-template-rows: 126px minmax(0, 1fr);
  transition: transform 160ms ease, border-color 160ms ease, background 160ms ease;

  &:hover {
    transform: translateY(-2px);
    border-color: rgba(255, 255, 255, 0.28);
    background:
      linear-gradient(135deg, rgba(255, 255, 255, 0.13), rgba(255, 255, 255, 0.045)),
      rgba(0, 0, 0, 0.38);
  }
`;

const PlanetHero = styled.div`
  position: relative;
  background:
    linear-gradient(180deg, rgba(0, 0, 0, 0.08), rgba(0, 0, 0, 0.56)),
    url(${({ $image }) => $image});
  background-size: cover;
  background-position: center;
`;

const PlanetBadge = styled.span`
  position: absolute;
  left: 0.72rem;
  bottom: 0.68rem;
  min-height: 30px;
  padding: 0 0.68rem;
  border: 1px solid rgba(255, 255, 255, 0.24);
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.42);
  display: inline-flex;
  align-items: center;
  color: #fff;
  font-size: 12px;
  font-weight: 900;
  backdrop-filter: blur(12px);
`;

const CardBody = styled.div`
  padding: 0.72rem;
  display: grid;
  gap: 0.46rem;
`;

const CardTop = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  align-items: flex-start;
`;

const DateText = styled.p`
  margin: 0;
  color: rgba(255, 255, 255, 0.62);
  font-size: 12px;
  font-weight: 850;
`;

const PlanetName = styled.h2`
  margin: 0.16rem 0 0;
  color: #fff;
  font-size: clamp(24px, 2.7vw, 32px);
  line-height: 1;
  letter-spacing: 0;
`;

const DetailHint = styled.span`
  min-height: 34px;
  padding: 0 0.66rem;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  gap: 0.28rem;
  color: rgba(255, 255, 255, 0.82);
  font-size: 11px;
  font-weight: 900;
  white-space: nowrap;
`;

const MetaText = styled.p`
  margin: 0;
  color: rgba(255, 255, 255, 0.72);
  font-size: 12px;
  line-height: 1.45;
`;

const ChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.34rem;
`;

const Chip = styled.span`
  min-height: 28px;
  padding: 0 0.56rem;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  display: inline-flex;
  align-items: center;
  gap: 0.28rem;
  color: rgba(255, 255, 255, 0.78);
  font-size: 11px;
  font-weight: 850;
`;

const Empty = styled.div`
  min-height: 220px;
  padding: 1.2rem;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.72);
  display: grid;
  align-content: center;
  line-height: 1.6;
`;

const formatDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '날짜 없음';

  return new Intl.DateTimeFormat('ko-KR', {
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const getRecordKey = (record, index) => String(record?.id || record?.createdAt || `record-${index}`);

const getAverageRating = (records) => {
  const ratings = records.map((record) => Number(record.rating)).filter((rating) => Number.isFinite(rating) && rating > 0);
  if (!ratings.length) return '없음';
  const average = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
  return `${average.toFixed(1)}/5`;
};

export default function TravelRecordsPage() {
  const records = useMemo(() => loadStorageJSON(TRAVEL_RECORDS_STORAGE_KEY, []), []);
  const safeRecords = Array.isArray(records) ? records : [];
  const latestRecord = safeRecords[0] || null;
  const latestPlanetSlug = String(latestRecord?.planetSlug || latestRecord?.planet || 'mars').toLowerCase();
  const latestPlanet = latestRecord ? (PLANET_MEDIA[latestPlanetSlug]?.title || latestRecord.planet || '기록 없음') : '기록 없음';

  return (
    <Page>
      <Shell>
        <Header>
          <TitleBlock>
            <Kicker>NOOS journey archive</Kicker>
            <Title>나의 여행기록</Title>
          </TitleBlock>
          <NavActions>
            <NavLink to="/solar-explorer">행성 선택</NavLink>
            <NavLink to="/my-profile">나의 프로필</NavLink>
          </NavActions>
        </Header>

        <Overview>
          <Stat>
            <StatLabel>
              <Map size={14} aria-hidden="true" /> Total journeys
            </StatLabel>
            <StatValue>{safeRecords.length}회</StatValue>
          </Stat>
          <Stat>
            <StatLabel>
              <Star size={14} aria-hidden="true" /> Average score
            </StatLabel>
            <StatValue>{getAverageRating(safeRecords)}</StatValue>
          </Stat>
          <Stat>
            <StatLabel>
              <CalendarClock size={14} aria-hidden="true" /> Latest planet
            </StatLabel>
            <StatValue>{latestPlanet}</StatValue>
          </Stat>
        </Overview>

        {safeRecords.length ? (
          <RecordGrid>
            {safeRecords.map((record, index) => {
              const planetSlug = String(record.planetSlug || record.planet || 'mars').toLowerCase();
              const planetMedia = PLANET_MEDIA[planetSlug] || PLANET_MEDIA.mars;
              const recordKey = getRecordKey(record, index);
              const ratingText = record.rating ? `${record.rating}/5점` : '점수 없음';
              const durationMin = Math.max(0, Math.round(Number(record.sessionDurationSec || 0) / 60));

              return (
                <RecordCard key={recordKey} to={`/travel-records/${encodeURIComponent(recordKey)}`}>
                  <PlanetHero $image={planetMedia.image}>
                    <PlanetBadge>{record.moodTarget || planetMedia.moodTarget}</PlanetBadge>
                  </PlanetHero>
                  <CardBody>
                    <CardTop>
                      <div>
                        <DateText>{formatDate(record.createdAt)}</DateText>
                        <PlanetName>{planetMedia.title || record.planet}</PlanetName>
                      </div>
                      <DetailHint>
                        상세 분석 <ChevronRight size={15} aria-hidden="true" />
                      </DetailHint>
                    </CardTop>
                    <MetaText>{record.trackName || planetMedia.trackName}</MetaText>
                    <ChipRow>
                      <Chip>
                        <Star size={13} aria-hidden="true" /> {ratingText}
                      </Chip>
                      <Chip>
                        <Timer size={13} aria-hidden="true" /> {durationMin ? `${durationMin}분` : '시간 없음'}
                      </Chip>
                      <Chip>Before / After</Chip>
                    </ChipRow>
                  </CardBody>
                </RecordCard>
              );
            })}
          </RecordGrid>
        ) : (
          <Empty>
            아직 저장된 여행기록이 없습니다. 여정을 종료하고 점수를 저장하면 날짜, 시간, 행성별 여행기록이 여기에 쌓입니다.
          </Empty>
        )}
      </Shell>
    </Page>
  );
}

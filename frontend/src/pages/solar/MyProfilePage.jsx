import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import {
  DEFAULT_PROFILE,
  PROFILE_STORAGE_KEY,
} from '../../components/features/solar/travel/constants';
import { loadStorageJSON, saveStorageJSON } from '../../components/features/solar/travel/storage';

const Page = styled.main`
  min-height: 100vh;
  box-sizing: border-box;
  padding: clamp(1rem, 3vw, 2.2rem);
  color: #fff;
  background:
    linear-gradient(125deg, rgba(0, 0, 0, 0.92), rgba(12, 16, 28, 0.9)),
    radial-gradient(circle at 82% 18%, rgba(255, 209, 102, 0.18), transparent 30%),
    #020308;
  font-family: 'Pretendard Variable', 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
`;

const Header = styled.header`
  width: min(100%, 760px);
  margin: 0 auto 1rem;
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
`;

const Title = styled.h1`
  margin: 0;
  font-size: clamp(32px, 5vw, 54px);
  line-height: 0.96;
`;

const Kicker = styled.p`
  margin: 0 0 0.35rem;
  color: rgba(255, 255, 255, 0.56);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
`;

const Nav = styled.nav`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.5rem;
`;

const NavLink = styled(Link)`
  min-height: 38px;
  padding: 0 0.82rem;
  border: 1px solid rgba(255, 255, 255, 0.24);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  font-size: 12px;
  font-weight: 700;
`;

const Form = styled.form`
  width: min(100%, 760px);
  margin: 0 auto;
  display: grid;
  gap: 0.7rem;
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.06);
`;

const Row = styled.label`
  display: grid;
  gap: 0.32rem;
  color: rgba(255, 255, 255, 0.66);
  font-size: 12px;
  font-weight: 700;

  input {
    height: 42px;
    border: 1px solid rgba(255, 255, 255, 0.16);
    border-radius: 6px;
    background: rgba(0, 0, 0, 0.28);
    color: #fff;
    padding: 0 0.72rem;
    font: inherit;
    outline: none;
  }
`;

const SaveButton = styled.button`
  width: fit-content;
  min-height: 40px;
  padding: 0 1rem;
  border: 1px solid #ffd166;
  border-radius: 999px;
  background: rgba(255, 209, 102, 0.16);
  color: #ffd166;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
`;

const Notice = styled.p`
  margin: 0;
  min-height: 20px;
  color: #7ee787;
  font-size: 12px;
  font-weight: 700;
`;

export default function MyProfilePage() {
  const [profile, setProfile] = useState(() => loadStorageJSON(PROFILE_STORAGE_KEY, DEFAULT_PROFILE));
  const [saved, setSaved] = useState(false);

  const updateProfile = (key, value) => {
    setSaved(false);
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    saveStorageJSON(PROFILE_STORAGE_KEY, profile);
    setSaved(true);
  };

  return (
    <Page>
      <Header>
        <div>
          <Kicker>NOOS traveler profile</Kicker>
          <Title>나의 프로필</Title>
        </div>
        <Nav>
          <NavLink to="/solar-explorer">행성 선택</NavLink>
          <NavLink to="/travel-records">나의 여행기록</NavLink>
        </Nav>
      </Header>

      <Form onSubmit={handleSubmit}>
        <Row>
          아이디
          <input value={profile.userId || ''} onChange={(event) => updateProfile('userId', event.target.value)} />
        </Row>
        <Row>
          이름
          <input value={profile.name || ''} onChange={(event) => updateProfile('name', event.target.value)} />
        </Row>
        <Row>
          이메일
          <input type="email" value={profile.email || ''} onChange={(event) => updateProfile('email', event.target.value)} />
        </Row>
        <Row>
          연락처
          <input value={profile.phone || ''} onChange={(event) => updateProfile('phone', event.target.value)} />
        </Row>
        <SaveButton type="submit">프로필 저장</SaveButton>
        <Notice>{saved ? '저장되었습니다.' : ''}</Notice>
      </Form>
    </Page>
  );
}

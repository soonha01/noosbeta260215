import React from 'react';
import {
  PanelBackButton,
  PanelHeader,
  PanelPage,
  PanelTitle,
  ProfileForm,
  ProfileRow,
  ProfileSaveButton,
} from './spaceTravel.styles';

const TravelProfilePage = ({ profileForm, accentColor, onInput, onSave, onBack }) => {
  return (
    <PanelPage>
      <PanelHeader>
        <PanelBackButton type="button" onClick={onBack} $accent={accentColor}>
          ← 플레이어로 돌아가기
        </PanelBackButton>
        <PanelTitle $accent={accentColor}>Profile</PanelTitle>
      </PanelHeader>

      <ProfileForm $accent={accentColor}>
        <ProfileRow $accent={accentColor}>
          <label>아이디</label>
          <input
            type="text"
            value={profileForm.userId}
            onChange={(event) => onInput('userId', event.target.value)}
          />
        </ProfileRow>
        <ProfileRow $accent={accentColor}>
          <label>이름</label>
          <input
            type="text"
            value={profileForm.name}
            onChange={(event) => onInput('name', event.target.value)}
          />
        </ProfileRow>
        <ProfileRow $accent={accentColor}>
          <label>이메일</label>
          <input
            type="email"
            value={profileForm.email}
            onChange={(event) => onInput('email', event.target.value)}
          />
        </ProfileRow>
        <ProfileRow $accent={accentColor}>
          <label>연락처</label>
          <input
            type="text"
            value={profileForm.phone}
            onChange={(event) => onInput('phone', event.target.value)}
          />
        </ProfileRow>
        <ProfileRow $accent={accentColor}>
          <label>비밀번호</label>
          <input
            type="password"
            value={profileForm.password}
            onChange={(event) => onInput('password', event.target.value)}
            placeholder="새 비밀번호를 입력하세요"
          />
        </ProfileRow>

        <ProfileSaveButton type="button" onClick={onSave} $accent={accentColor}>
          변경사항 저장
        </ProfileSaveButton>
      </ProfileForm>
    </PanelPage>
  );
};

export default React.memo(TravelProfilePage);

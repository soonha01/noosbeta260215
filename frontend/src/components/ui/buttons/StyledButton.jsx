import React from 'react';
import styled from 'styled-components';

const Button = ({ children, onClick, ...props }) => {
  return (
    <StyledWrapper>
      <button id="btn" onClick={onClick} {...props}>{children}</button>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  button {
    padding: 10px 20px;
    text-transform: uppercase;
    border-radius: 8px;
    font-size: 17px;
    font-weight: 500;
    color: #ffffff;
    text-shadow: 0 0 5px #ffffff, 0 0 10px #ffffff, 0 0 20px #ffffff;
    background: #008cff;
    cursor: pointer;
    border: 1px solid #008cff;
    box-shadow: 0 0 5px #008cff, 0 0 20px #008cff, 0 0 50px #008cff,
      0 0 100px #008cff;
    transition: 0.5s ease;
    user-select: none;
  }

  #btn:hover,
  :focus {
    color: #ffffff;
    background: #0099ff;
    border: 1px solid #0099ff;
    text-shadow: 0 0 8px #ffffff, 0 0 15px #ffffff, 0 0 25px #ffffff;
    box-shadow: 0 0 8px #0099ff, 0 0 25px #0099ff, 0 0 60px #0099ff,
      0 0 120px #0099ff;
    transform: scale(1.05);
  }`;

export default Button;
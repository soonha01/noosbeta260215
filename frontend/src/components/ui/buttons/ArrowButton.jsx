import React from 'react';
import styled from 'styled-components';

const Button = ({ children, onClick, ...props }) => {
  return (
    <StyledWrapper>
      <button className="cta" onClick={onClick} {...props}>
        <svg id="arrow-horizontal" xmlns="http://www.w3.org/2000/svg" width={30} height={10} viewBox="0 0 46 16">
          <path id="Path_10" data-name="Path 10" d="M8,0,6.545,1.455l5.506,5.506H-30V9.039H12.052L6.545,14.545,8,16l8-8Z" transform="translate(30) scale(-1,1)" />
        </svg>
        <span className="hover-underline-animation">{children}</span>
      </button>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .cta {
    border: none;
    background: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 15px;
  }

  .cta span {
    letter-spacing: 4px;
    font-size: 14px;
    text-transform: uppercase;
  }

  .cta svg {
    transform: translateX(8px);
    transition: all 0.3s ease;
    fill: white;
  }

  .cta:hover svg {
    transform: translateX(0);
  }

  .cta:active svg {
    transform: scale(0.9) translateX(0);
  }

  .hover-underline-animation {
    position: relative;
    color: white;
    padding-bottom: 5px;
  }

  .hover-underline-animation:after {
    content: "";
    position: absolute;
    width: 100%;
    transform: scaleX(0);
    height: 2px;
    bottom: 0;
    left: 0;
    background-color: #ffffff;
    transform-origin: bottom right;
    transition: transform 0.25s ease-out;
  }

  .cta:hover .hover-underline-animation:after {
    transform: scaleX(1);
    transform-origin: bottom left;
  }`;

export default Button;
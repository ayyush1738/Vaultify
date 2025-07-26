import React from 'react';
import styled from 'styled-components';

export interface ButtonxProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

const Buttonx = React.forwardRef<HTMLButtonElement, ButtonxProps>(
  ({ children, icon, className = '', ...props }, ref) => {
    return (
      <StyledWrapper>
        <button className={`base-btn ${className}`} ref={ref} {...props}>
          {icon && <span className="icon">{icon}</span>}
          <span className="text">{children}</span>
        </button>
      </StyledWrapper>
    );
  }
);

Buttonx.displayName = 'Buttonx';

const StyledWrapper = styled.div`
  .base-btn {
    border: none;
    width: 15em;
    height: 4em;
    border-radius: 3em;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    transition: all 450ms ease-in-out;
  }

  .base-btn .text {
    font-weight: 600;
    font-size: medium;
  }

  .base-btn:hover {
    background: linear-gradient(0deg,#A47CF3,#683FEA);
    box-shadow:
      inset 0px 1px 0px 0px rgba(255, 255, 255, 0.4),
      inset 0px -4px 0px 0px rgba(0, 0, 0, 0.2),
      0px 0px 0px 4px rgba(255, 255, 255, 0.2),
      0px 0px 180px 0px #9917FF;
    transform: translateY(-2px);
  }

  .base-btn:hover .text {
    color: white;
  }

  .base-btn:hover .icon {
    transform: scale(1.2);
  }
`;

export default Buttonx;

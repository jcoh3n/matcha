import styled from "styled-components";
import { darken } from "polished";

interface ButtonProps {
  variant?: "primary" | "secondary" | "accent";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
}

export const StyledButton = styled.button<ButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: ${(props) => props.theme.borderRadius.md};
  font-weight: ${(props) => props.theme.fontWeight.medium};
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  opacity: ${(props) => (props.disabled ? 0.6 : 1)};
  transition: all 0.2s ease-in-out;
  
  /* Size variations */
  ${(props) => {
    switch (props.size) {
      case "sm":
        return `
          padding: ${props.theme.spacing.sm} ${props.theme.spacing.md};
          font-size: ${props.theme.fontSize.sm};
        `;
      case "lg":
        return `
          padding: ${props.theme.spacing.lg} ${props.theme.spacing.xl};
          font-size: ${props.theme.fontSize.lg};
        `;
      case "md":
      default:
        return `
          padding: ${props.theme.spacing.md} ${props.theme.spacing.lg};
          font-size: ${props.theme.fontSize.md};
        `;
    }
  }}
  
  /* Variant styles */
  ${(props) => {
    switch (props.variant) {
      case "secondary":
        return `
          background-color: ${props.theme.colors.secondary};
          color: ${props.theme.colors.surface};
          &:hover {
            background-color: ${darken(0.1, props.theme.colors.secondary)};
          }
        `;
      case "accent":
        return `
          background-color: ${props.theme.colors.accent};
          color: ${props.theme.colors.surface};
          &:hover {
            background-color: ${darken(0.1, props.theme.colors.accent)};
          }
        `;
      case "primary":
      default:
        return `
          background-color: ${props.theme.colors.primary};
          color: ${props.theme.colors.surface};
          &:hover {
            background-color: ${darken(0.1, props.theme.colors.primary)};
          }
        `;
    }
  }}
  
  &:active {
    transform: translateY(1px);
  }
`;
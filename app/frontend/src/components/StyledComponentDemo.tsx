import styled from "styled-components";
import { StyledButton } from "./StyledButton";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: ${(props) => props.theme.spacing.lg};
  background-color: ${(props) => props.theme.colors.background};
  color: ${(props) => props.theme.colors.text.primary};
`;

const Title = styled.h1`
  font-size: ${(props) => props.theme.fontSize.xxxl};
  margin-bottom: ${(props) => props.theme.spacing.lg};
  color: ${(props) => props.theme.colors.primary};
`;

const Description = styled.p`
  font-size: ${(props) => props.theme.fontSize.md};
  margin-bottom: ${(props) => props.theme.spacing.xl};
  text-align: center;
  max-width: 600px;
  line-height: 1.6;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: ${(props) => props.theme.spacing.md};
  flex-wrap: wrap;
  justify-content: center;
`;

const StyledComponentDemo = () => {
  return (
    <Container>
      <Title>Styled Components Demo</Title>
      <Description>
        This page demonstrates that styled-components is properly configured in your application.
        You can create dynamic, themeable components with ease using the styled API.
      </Description>
      <ButtonContainer>
        <StyledButton variant="primary" size="md">Primary Button</StyledButton>
        <StyledButton variant="secondary" size="md">Secondary Button</StyledButton>
        <StyledButton variant="accent" size="md">Accent Button</StyledButton>
        <StyledButton size="sm">Small Button</StyledButton>
        <StyledButton size="lg">Large Button</StyledButton>
      </ButtonContainer>
    </Container>
  );
};

export default StyledComponentDemo;
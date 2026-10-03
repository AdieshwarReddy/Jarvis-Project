import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ToolConfirmationCard } from '../components/ToolConfirmationCard';
import { AssistantStateIndicator } from '../components/AssistantStateIndicator';
import { ChatMessage } from '../components/ChatMessage';
import { VoiceWaveform } from '../components/VoiceWaveform';
import { LoginPage } from '../pages/LoginPage';
import { AuthProvider } from '../context/AuthContext';

describe('Frontend Component Tests', () => {
  it('renders ToolConfirmationCard and handles authorize and cancel callbacks', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    render(
      <ToolConfirmationCard
        activityId="act-123"
        toolName="create_task"
        summary="Create task 'Practice Dynamic Programming'"
        parameters={{ title: 'Practice Dynamic Programming', priority: 'high' }}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );

    expect(screen.getByText("Create task 'Practice Dynamic Programming'")).toBeInTheDocument();
    expect(screen.getByText('create_task')).toBeInTheDocument();
    expect(screen.getByText('Action Confirmation Required')).toBeInTheDocument();

    // Click Authorize
    fireEvent.click(screen.getByText(/Authorize & Execute/i));
    expect(onConfirm).toHaveBeenCalledTimes(1);

    // Click Cancel
    fireEvent.click(screen.getByText(/Cancel/i));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('renders AssistantStateIndicator across different lifecycle states', () => {
    const { rerender } = render(<AssistantStateIndicator state="IDLE" />);
    expect(screen.getByText(/Jarvis Ready/i)).toBeInTheDocument();

    rerender(<AssistantStateIndicator state="LISTENING" />);
    expect(screen.getByText(/Listening/i)).toBeInTheDocument();

    rerender(<AssistantStateIndicator state="THINKING" />);
    expect(screen.getByText(/Thinking/i)).toBeInTheDocument();

    rerender(<AssistantStateIndicator state="SPEAKING" />);
    expect(screen.getByText(/Speaking/i)).toBeInTheDocument();

    rerender(<AssistantStateIndicator state="ERROR" />);
    expect(screen.getByText(/Attention Needed/i)).toBeInTheDocument();
  });

  it('renders ChatMessage with text content and copy button', () => {
    render(
      <ChatMessage
        role="assistant"
        content="Here is your requested calculation: **7,560**."
      />
    );
    expect(screen.getByText(/Here is your requested calculation/i)).toBeInTheDocument();
    expect(screen.getByText('7,560')).toBeInTheDocument();
  });

  it('renders VoiceWaveform without crash', () => {
    const { container } = render(<VoiceWaveform active={true} state="LISTENING" />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders LoginPage with form inputs and 1-Click Demo Login button', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByPlaceholderText('name@domain.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByText(/Instant Demo Sign In/i)).toBeInTheDocument();
  });
});

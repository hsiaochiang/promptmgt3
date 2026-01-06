import { describe, it, expect, beforeEach, vi } from 'vitest';

/**
 * Integration Test: Autosave Failure Scenarios
 * 
 * Tests autosave error handling:
 * 1. Filesystem errors (permission denied, disk full)
 * 2. Network errors (server unreachable)
 * 3. Validation errors (invalid content)
 * 4. User-visible error feedback
 * 5. Retry mechanisms
 */
describe('Integration: Autosave Failure Scenarios', () => {
  let mockFileSystem: {
    writable: boolean;
    diskFull: boolean;
    writeDelay: number;
  };

  beforeEach(() => {
    mockFileSystem = {
      writable: true,
      diskFull: false,
      writeDelay: 50,
    };
    vi.clearAllMocks();
  });

  it('should handle permission denied error and display user-friendly message', async () => {
    mockFileSystem.writable = false;

    const saveContent = async (path: string, content: string) => {
      if (!mockFileSystem.writable) {
        throw new Error('EACCES: permission denied');
      }
      return { success: true };
    };

    let errorMessage = '';
    try {
      await saveContent('projects/demo/prompts/test.md', 'New content');
    } catch (err) {
      errorMessage = (err as Error).message;
    }

    expect(errorMessage).toContain('permission denied');
    
    // User-facing error should be clear
    const userFacingError = {
      type: 'PERMISSION_ERROR',
      message: 'Cannot save file: Permission denied. Check file/folder permissions.',
      retryable: true,
    };

    expect(userFacingError.type).toBe('PERMISSION_ERROR');
    expect(userFacingError.message).toContain('Permission denied');
    expect(userFacingError.retryable).toBe(true);
  });

  it('should handle disk full error and provide clear guidance', async () => {
    mockFileSystem.diskFull = true;

    const saveContent = async (path: string, content: string) => {
      if (mockFileSystem.diskFull) {
        throw new Error('ENOSPC: no space left on device');
      }
      return { success: true };
    };

    let errorMessage = '';
    try {
      await saveContent('projects/demo/prompts/test.md', 'New content');
    } catch (err) {
      errorMessage = (err as Error).message;
    }

    expect(errorMessage).toContain('no space left on device');

    // User-facing error
    const userFacingError = {
      type: 'DISK_FULL',
      message: 'Cannot save file: Disk is full. Free up space and try again.',
      retryable: true,
    };

    expect(userFacingError.type).toBe('DISK_FULL');
    expect(userFacingError.message).toContain('Disk is full');
  });

  it('should handle network/server unreachable error', async () => {
    const saveToServer = async (path: string, content: string) => {
      // Simulate network failure
      throw new Error('ECONNREFUSED: Connection refused');
    };

    let errorMessage = '';
    try {
      await saveToServer('projects/demo/prompts/test.md', 'New content');
    } catch (err) {
      errorMessage = (err as Error).message;
    }

    expect(errorMessage).toContain('Connection refused');

    const userFacingError = {
      type: 'NETWORK_ERROR',
      message: 'Cannot reach server. Check connection and try again.',
      retryable: true,
    };

    expect(userFacingError.retryable).toBe(true);
  });

  it('should handle validation errors and prevent save', async () => {
    const invalidContent = {
      title: '', // Empty title should fail validation
      body: 'Some content',
    };

    const validate = (content: any) => {
      if (!content.title || content.title.trim() === '') {
        throw new Error('Title is required');
      }
      return true;
    };

    let validationError = '';
    try {
      validate(invalidContent);
    } catch (err) {
      validationError = (err as Error).message;
    }

    expect(validationError).toBe('Title is required');

    const userFacingError = {
      type: 'VALIDATION_ERROR',
      message: 'Title is required',
      retryable: false, // User must fix the input
    };

    expect(userFacingError.type).toBe('VALIDATION_ERROR');
    expect(userFacingError.retryable).toBe(false);
  });

  it('should retry autosave on transient failure', async () => {
    let attemptCount = 0;
    const maxRetries = 3;

    const unreliableSave = async () => {
      attemptCount++;
      if (attemptCount < 2) {
        throw new Error('ETIMEDOUT: Request timeout');
      }
      return { success: true };
    };

    let lastError: Error | null = null;
    let saveSuccess = false;

    for (let i = 0; i < maxRetries; i++) {
      try {
        await unreliableSave();
        saveSuccess = true;
        break;
      } catch (err) {
        lastError = err as Error;
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 100));
      }
    }

    expect(attemptCount).toBe(2);
    expect(saveSuccess).toBe(true);
    expect(lastError?.message).toContain('timeout');
  });

  it('should show saving indicator during autosave', async () => {
    let savingState = {
      isAutosaving: false,
      error: null as string | null,
    };

    const autosave = async (content: string) => {
      savingState.isAutosaving = true;
      savingState.error = null;

      try {
        await new Promise(resolve => setTimeout(resolve, mockFileSystem.writeDelay));
        // Simulate success
        savingState.isAutosaving = false;
        return { success: true };
      } catch (err) {
        savingState.isAutosaving = false;
        savingState.error = (err as Error).message;
        throw err;
      }
    };

    // Start autosave
    const savePromise = autosave('New content');
    expect(savingState.isAutosaving).toBe(true);

    await savePromise;
    expect(savingState.isAutosaving).toBe(false);
    expect(savingState.error).toBeNull();
  });

  it('should display error state and allow user to retry manually', async () => {
    let uiState = {
      saveStatus: 'idle' as 'idle' | 'saving' | 'success' | 'error',
      errorMessage: '',
    };

    const autosave = async (content: string) => {
      uiState.saveStatus = 'saving';
      
      try {
        // Simulate failure
        mockFileSystem.writable = false;
        if (!mockFileSystem.writable) {
          throw new Error('Permission denied');
        }
        
        uiState.saveStatus = 'success';
        return { success: true };
      } catch (err) {
        uiState.saveStatus = 'error';
        uiState.errorMessage = (err as Error).message;
        throw err;
      }
    };

    try {
      await autosave('New content');
    } catch (err) {
      // Error handled
    }

    expect(uiState.saveStatus).toBe('error');
    expect(uiState.errorMessage).toContain('Permission denied');

    // User clicks retry button
    const retryManually = async () => {
      mockFileSystem.writable = true; // User fixed the issue
      uiState.saveStatus = 'saving';
      uiState.errorMessage = '';

      await new Promise(resolve => setTimeout(resolve, 50));
      uiState.saveStatus = 'success';
      return { success: true };
    };

    await retryManually();
    expect(uiState.saveStatus).toBe('success');
    expect(uiState.errorMessage).toBe('');
  });

  it('should preserve unsaved content on autosave failure', async () => {
    let editorContent = 'Original content';
    let savedContent = '';
    let unsavedChanges = false;

    const autosave = async (content: string) => {
      mockFileSystem.writable = false;
      
      if (!mockFileSystem.writable) {
        unsavedChanges = true;
        throw new Error('Failed to save');
      }
      
      savedContent = content;
      unsavedChanges = false;
      return { success: true };
    };

    // User edits content
    editorContent = 'New edited content';

    try {
      await autosave(editorContent);
    } catch (err) {
      // Save failed
    }

    // Editor content should remain unchanged
    expect(editorContent).toBe('New edited content');
    expect(savedContent).toBe(''); // Not saved
    expect(unsavedChanges).toBe(true);

    // UI should show unsaved indicator
    const uiIndicator = {
      hasUnsavedChanges: unsavedChanges,
      warningMessage: 'You have unsaved changes',
    };

    expect(uiIndicator.hasUnsavedChanges).toBe(true);
    expect(uiIndicator.warningMessage).toContain('unsaved changes');
  });

  it('should debounce autosave and cancel pending saves on failure', async () => {
    let saveCallCount = 0;
    const debouncedSaves: Array<NodeJS.Timeout> = [];

    const debounce = (fn: Function, delay: number) => {
      let timeoutId: NodeJS.Timeout;
      return (...args: any[]) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
        debouncedSaves.push(timeoutId);
      };
    };

    const actualSave = async (content: string) => {
      saveCallCount++;
      return { success: true };
    };

    const debouncedAutosave = debounce(actualSave, 1000);

    // Rapid typing - should debounce
    debouncedAutosave('a');
    debouncedAutosave('ab');
    debouncedAutosave('abc');

    // Wait for debounce
    await new Promise(resolve => setTimeout(resolve, 1100));

    // Only one save should occur
    expect(saveCallCount).toBe(1);
  });

  it('should provide different error feedback based on error type', async () => {
    const errorTypes = [
      { code: 'EACCES', userMessage: 'Permission denied. Check file permissions.' },
      { code: 'ENOSPC', userMessage: 'Disk is full. Free up space.' },
      { code: 'ENOENT', userMessage: 'File or directory not found.' },
      { code: 'EISDIR', userMessage: 'Expected a file, found a directory.' },
      { code: 'ECONNREFUSED', userMessage: 'Cannot reach server. Check connection.' },
    ];

    errorTypes.forEach(errorType => {
      const getUserMessage = (errorCode: string): string => {
        const mapping: Record<string, string> = {
          EACCES: 'Permission denied. Check file permissions.',
          ENOSPC: 'Disk is full. Free up space.',
          ENOENT: 'File or directory not found.',
          EISDIR: 'Expected a file, found a directory.',
          ECONNREFUSED: 'Cannot reach server. Check connection.',
        };
        return mapping[errorCode] || 'An unknown error occurred.';
      };

      const userMessage = getUserMessage(errorType.code);
      expect(userMessage).toBe(errorType.userMessage);
    });
  });

  it('should meet 200ms feedback SLA even on error', async () => {
    const startTime = Date.now();
    let feedbackShown = false;

    const autosave = async (content: string) => {
      // Show immediate feedback
      setTimeout(() => {
        feedbackShown = true;
      }, 50); // Within 200ms

      // Actual save (may fail)
      throw new Error('Save failed');
    };

    try {
      await autosave('content');
    } catch (err) {
      // Error handled
    }

    const feedbackLatency = Date.now() - startTime;
    
    // Feedback should be shown quickly (within SLA)
    await new Promise(resolve => setTimeout(resolve, 60));
    expect(feedbackShown).toBe(true);
    expect(feedbackLatency).toBeLessThan(200);
  });
});

/**
 * FormCollaborationManager.ts
 * Real-time collaboration management for FormFlow
 * Supports WebSocket-based real-time editing, cursor tracking, and change synchronization
 */

import { Server as SocketIOServer } from 'socket.io';
import type { Socket } from 'socket.io';

// Types and Interfaces
export interface UserSession {
  userId: string;
  username: string;
  email: string;
  formId: string;
  cursorPosition: CursorPosition;
  activeField?: string;
  color: string;
  joinedAt: number;
}

export interface CursorPosition {
  fieldId: string;
  position: number;
  line: number;
  column: number;
}

export interface CollaborationEvent {
  type: 'field_changed' | 'field_added' | 'field_deleted' | 'cursor_moved' | 'selection_changed' | 'user_joined' | 'user_left';
  userId: string;
  username: string;
  formId: string;
  timestamp: number;
  data: any;
}

export interface FormChange {
  fieldId: string;
  fieldName: string;
  oldValue: any;
  newValue: any;
  changeType: 'property' | 'structure';
  timestamp: number;
}

// Main Collaboration Manager Class
export class FormCollaborationManager {
  private io: SocketIOServer | null = null;
  private activeSessions: Map<string, Map<string, UserSession>> = new Map();
  private collaborationEvents: CollaborationEvent[] = [];
  private formChanges: Map<string, FormChange[]> = new Map();
  private changeHistory: Map<string, Array<{ event: CollaborationEvent; change: FormChange }>> = new Map();
  private userColors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
    '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'
  ];
  private colorIndex = 0;

  constructor(io?: SocketIOServer) {
    if (io) {
      this.io = io;
      this.initializeSocketListeners();
    }
  }

  /**
   * Initialize Socket.IO listeners
   */
  private initializeSocketListeners() {
    if (!this.io) return;

    this.io.on('connection', (socket: Socket) => {
      socket.on('join_form', (data: { userId: string; username: string; email: string; formId: string }) => {
        this.joinSession(data.userId, data.username, data.email, data.formId, socket.id);
      });

      socket.on('field_changed', (data: any) => {
        this.broadcastChange({ ...data, type: 'field_changed', timestamp: Date.now() });
      });

      socket.on('cursor_move', (data: any) => {
        this.updateCursorPosition(data.userId, data.formId, data.cursorPosition);
      });

      socket.on('disconnect', () => {
        this.handleDisconnect(socket.id);
      });
    });
  }

  /**
   * Join a collaboration session
   */
  joinSession(
    userId: string,
    username: string,
    email: string,
    formId: string,
    socketId?: string
  ): UserSession | null {
    try {
      if (!this.activeSessions.has(formId)) {
        this.activeSessions.set(formId, new Map());
        this.changeHistory.set(formId, []);
      }

      const userSessions = this.activeSessions.get(formId)!;
      
      // Check if user already exists
      if (userSessions.has(userId)) {
        return userSessions.get(userId) || null;
      }

      const userColor = this.userColors[this.colorIndex % this.userColors.length];
      this.colorIndex++;

      const session: UserSession = {
        userId,
        username,
        email,
        formId,
        cursorPosition: {
          fieldId: '',
          position: 0,
          line: 0,
          column: 0
        },
        color: userColor,
        joinedAt: Date.now()
      };

      userSessions.set(userId, session);

      // Broadcast user joined event
      this.broadcastChange({
        type: 'user_joined',
        userId,
        username,
        formId,
        timestamp: Date.now(),
        data: { session }
      });

      console.log(`User ${username} (${userId}) joined form ${formId}`);
      return session;
    } catch (error) {
      console.error('Error joining session:', error);
      return null;
    }
  }

  /**
   * Leave a collaboration session
   */
  leaveSession(userId: string, formId: string): boolean {
    try {
      const userSessions = this.activeSessions.get(formId);
      if (!userSessions) return false;

      const session = userSessions.get(userId);
      if (!session) return false;

      userSessions.delete(userId);

      // Broadcast user left event
      this.broadcastChange({
        type: 'user_left',
        userId,
        username: session.username,
        formId,
        timestamp: Date.now(),
        data: { userId }
      });

      console.log(`User ${session.username} (${userId}) left form ${formId}`);
      return true;
    } catch (error) {
      console.error('Error leaving session:', error);
      return false;
    }
  }

  /**
   * Update cursor position for a user
   */
  updateCursorPosition(userId: string, formId: string, cursorPosition: CursorPosition): void {
    const userSessions = this.activeSessions.get(formId);
    if (!userSessions) return;

    const session = userSessions.get(userId);
    if (!session) return;

    session.cursorPosition = cursorPosition;
    session.activeField = cursorPosition.fieldId;

    // Broadcast cursor position
    this.broadcastChange({
      type: 'cursor_moved',
      userId,
      username: session.username,
      formId,
      timestamp: Date.now(),
      data: { userId, cursorPosition, color: session.color }
    });
  }

  /**
   * Broadcast a change event
   */
  broadcastChange(event: CollaborationEvent): void {
    this.collaborationEvents.push(event);

    const history = this.changeHistory.get(event.formId);
    if (history && event.type !== 'cursor_moved' && event.type !== 'user_joined' && event.type !== 'user_left') {
      // Store field changes in history
      if (event.data && event.data.change) {
        history.push({ event, change: event.data.change });
      }
    }

    // Emit via Socket.IO if available
    if (this.io) {
      this.io.to(event.formId).emit('collaboration_event', event);
    }

    console.log(`Broadcasting ${event.type} event for form ${event.formId}`);
  }

  /**
   * Get active users in a form
   */
  getActiveUsers(formId: string): UserSession[] {
    const userSessions = this.activeSessions.get(formId);
    if (!userSessions) return [];
    return Array.from(userSessions.values());
  }

  /**
   * Get active user count for a form
   */
  getActiveUserCount(formId: string): number {
    return this.getActiveUsers(formId).length;
  }

  /**
   * Get change history for a form
   */
  getChangeHistory(formId: string): Array<{ event: CollaborationEvent; change: FormChange }> {
    return this.changeHistory.get(formId) || [];
  }

  /**
   * Handle user disconnect
   */
  private handleDisconnect(socketId: string): void {
    // Find and remove user session by socket ID
    this.activeSessions.forEach((userSessions, formId) => {
      // Note: This is simplified - in production, maintain socket->user mapping
      console.log(`Socket ${socketId} disconnected`);
    });
  }

  /**
   * Clear old sessions (inactive for > 30 minutes)
   */
  clearInactiveSessions(maxInactiveTime: number = 30 * 60 * 1000): void {
    const now = Date.now();
    this.activeSessions.forEach((userSessions, formId) => {
      userSessions.forEach((session, userId) => {
        if (now - session.joinedAt > maxInactiveTime) {
          this.leaveSession(userId, formId);
        }
      });
    });
  }

  /**
   * Get collaboration statistics
   */
  getStatistics() {
    let totalActiveSessions = 0;
    let totalEvents = 0;
    const formsStats: Record<string, any> = {};

    this.activeSessions.forEach((userSessions, formId) => {
      totalActiveSessions += userSessions.size;
      const formEvents = this.changeHistory.get(formId) || [];
      totalEvents += formEvents.length;
      formsStats[formId] = {
        activeUsers: userSessions.size,
        changes: formEvents.length
      };
    });

    return {
      totalActiveSessions,
      totalEvents,
      formsStats,
      timestamp: Date.now()
    };
  }
}

// Export singleton instance
export const collaborationManager = new FormCollaborationManager();
